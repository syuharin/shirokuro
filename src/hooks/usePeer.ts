"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Peer, DataConnection } from 'peerjs';
import { PeerState, P2PPayload, SyncUpdatePayload, InitialPeerListPayload, SyncTopicPayload, HostRole, HeartbeatPayload, HostMigrationPayload } from '../lib/types';
import { loadSession, saveSession } from '../lib/utils';

const PREFIX = 'shirokuro-'; 
const HEARTBEAT_INTERVAL = 10000;
const PRUNE_INTERVAL = 30000;
const ELECTION_TIMEOUT = 2000;
const INITIAL_BACKOFF = 5000;
const MAX_BACKOFF = 60000;

export function usePeer(roomId: string, initialName: string = 'Anonymous') {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isAnchor, setIsAnchor] = useState<boolean>(false);
  const [hostRole, setHostRole] = useState<HostRole>('Guest');
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('トピックを編集して同期を開始してください');
  const [labelMin, setLabelMin] = useState<string>('0');
  const [labelMax, setLabelMax] = useState<string>('100');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const [myState, setMyState] = useState<PeerState>(() => {
    const session = loadSession(roomId);
    return {
      peerId: session.peerId || '',
      name: session.name || initialName,
      value: session.value !== null ? session.value : 50,
      isSelf: true,
      status: 'online',
      lastUpdated: Date.now(),
    };
  });

  const [participants, setParticipants] = useState<PeerState[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const reconnectCountRef = useRef(0);
  const takeoverRetryRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const electionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const takeoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECONNECT_RETRIES = 2;

  const myStateRef = useRef(myState);
  const topicRef = useRef(topic);
  const labelMinRef = useRef(labelMin);
  const labelMaxRef = useRef(labelMax);
  const isAnchorRef = useRef(isAnchor);
  const hostRoleRef = useRef<HostRole>(hostRole);
  const participantsRef = useRef<PeerState[]>(participants);

  useEffect(() => {
    myStateRef.current = myState;
  }, [myState]);

  useEffect(() => {
    saveSession({
      peerId: myState.peerId,
      name: myState.name,
      isAnchor: isAnchorRef.current,
      roomId: roomId
    });
  }, [myState.name, myState.peerId, roomId]);

  useEffect(() => { topicRef.current = topic; }, [topic]);
  useEffect(() => { labelMinRef.current = labelMin; }, [labelMin]);
  useEffect(() => { labelMaxRef.current = labelMax; }, [labelMax]);
  useEffect(() => { isAnchorRef.current = isAnchor; }, [isAnchor]);
  useEffect(() => { hostRoleRef.current = hostRole; }, [hostRole]);
  useEffect(() => { participantsRef.current = participants; }, [participants]);

  const broadcast = useCallback((data: P2PPayload) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  }, []);

  const updateTopic = useCallback((newTopic: string, min: string, max: string) => {
    setTopic(newTopic);
    setLabelMin(min);
    setLabelMax(max);
    const payload: SyncTopicPayload = {
      type: 'SYNC_TOPIC',
      payload: { topic: newTopic, labelMin: min, labelMax: max },
    };
    broadcast(payload);
  }, [broadcast]);

  const updateMyState = useCallback((newState: Partial<PeerState>, shouldBroadcast: boolean = true) => {  
    setMyState((prev) => {
      const updated = { ...prev, ...newState, lastUpdated: Date.now() };

      if (shouldBroadcast) {
        const payload: SyncUpdatePayload = {
          type: 'SYNC_UPDATE',
          payload: {
            peerId: updated.peerId,
            name: updated.name || 'Anonymous',
            value: updated.value,
          },
        };

        broadcast(payload);
      }
      return updated;
    });
  }, [broadcast]);

  const connectToPeerRef = useRef<(id: string) => void>(() => {});
  const setupConnectionRef = useRef<(conn: DataConnection) => void>(() => {});
  const attemptTakeoverRef = useRef<() => void>(() => {});

  const updateParticipantsList = useCallback((updater: (prev: PeerState[]) => PeerState[]) => {
    setParticipants((prev) => {
      const next = updater(prev);
      return [...next].sort((a, b) => a.peerId.localeCompare(b.peerId));
    });
  }, []);

  // US3: ID Takeover logic
  const attemptTakeover = useCallback(async () => {
    const { Peer } = await import('peerjs');
    const anchorId = `${PREFIX}anchor-${roomId}`;
    
    console.log(`Attempting to takeover Anchor ID: ${anchorId} (Attempt ${takeoverRetryRef.current + 1})`);

    const p = new Peer(anchorId);

    p.on('open', (newId) => {
      console.log('Successfully re-occupied Anchor ID:', newId);
      
      if (peerRef.current) {
         peerRef.current.destroy();
      }

      peerRef.current = p;
      setPeerId(newId);
      setIsAnchor(true);
      setHostRole('Anchor');
      setIsMigrating(false);
      setMyState(prev => ({ ...prev, peerId: newId, status: 'online' }));
      
      participantsRef.current.forEach(participant => {
         if (participant.status === 'online') {
            connectToPeerRef.current(participant.peerId);
         }
      });

      const successPayload: HostMigrationPayload = {
        type: 'HOST_MIGRATION',
        payload: {
          action: 'HOST_TAKEOVER_SUCCESS',
          actingHostId: newId
        }
      };
      broadcast(successPayload);
    });

    p.on('connection', (conn) => setupConnectionRef.current(conn));

    p.on('error', (err) => {
      const error = err as { type: string };
      if (error.type === 'unavailable-id') {
        p.destroy();
        takeoverRetryRef.current++;
        const delay = Math.min(MAX_BACKOFF, INITIAL_BACKOFF * Math.pow(2, takeoverRetryRef.current - 1));
        console.log(`Anchor ID unavailable, retrying in ${delay}ms...`);
        
        if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
        takeoverTimerRef.current = setTimeout(() => attemptTakeover(), delay);
      } else {
        console.error('Takeover Peer Error:', err);
      }
    });
  }, [roomId, broadcast]);

  const startElection = useCallback(() => {
    if (hostRoleRef.current === 'Anchor') return;

    const anchorId = `${PREFIX}anchor-${roomId}`;
    console.log('Anchor connection lost. Starting election...');
    setIsMigrating(true);
    
    const onlinePeers = participantsRef.current
      .filter(p => p.status === 'online' && p.peerId !== anchorId)
      .map(p => p.peerId);
    
    if (myStateRef.current.peerId && myStateRef.current.peerId !== anchorId) {
      onlinePeers.push(myStateRef.current.peerId);
    }

    if (onlinePeers.length === 0) {
       console.log('No other peers available for election.');
       return;
    }

    onlinePeers.sort((a, b) => a.localeCompare(b));
    const winner = onlinePeers[0];

    if (winner === myStateRef.current.peerId) {
      console.log('I am the election winner (Candidate)');
      setHostRole('Candidate');
      
      const payload: HostMigrationPayload = {
        type: 'HOST_MIGRATION',
        payload: {
          action: 'ELECTION_ANNOUNCEMENT',
          actingHostId: myStateRef.current.peerId
        }
      };
      broadcast(payload);

      if (electionTimerRef.current) clearTimeout(electionTimerRef.current);
      electionTimerRef.current = setTimeout(() => {
        console.log('Promoted to Acting Host');
        setHostRole('Acting Host');
        takeoverRetryRef.current = 0;
        attemptTakeover();
      }, ELECTION_TIMEOUT);
    } else {
      console.log('Winner is:', winner);
      setHostRole('Guest');
    }
  }, [broadcast, roomId, attemptTakeover]);

  const handleAnchorDisconnect = useCallback(() => {
    const anchorId = `${PREFIX}anchor-${roomId}`;
    
    // Immediate mark as offline in the UI/list to allow correct election
    updateParticipantsList((prev) =>
      prev.map(p => p.peerId === anchorId ? { ...p, status: 'offline' } : p)
    );

    if (reconnectCountRef.current < MAX_RECONNECT_RETRIES) {
      reconnectCountRef.current++;
      const delay = 1000 * reconnectCountRef.current;
      console.log(`Anchor connection lost. Retrying (${reconnectCountRef.current}/${MAX_RECONNECT_RETRIES}) in ${delay}ms...`);
      
      // Start showing the banner during reconnection attempts
      setIsMigrating(true);
      setMyState(prev => ({ ...prev, status: 'reconnecting' }));

      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        if (peerRef.current && !peerRef.current.destroyed) {
          connectToPeerRef.current(anchorId);
        }
      }, delay);
    } else {
      console.error('Anchor unreachable after retries. Starting host migration...');
      setMyState(prev => ({ ...prev, status: 'online' }));
      startElection();
    }
  }, [roomId, updateParticipantsList, startElection]);

  const handleData = useCallback((data: unknown) => {
    const payload = data as P2PPayload;

    if (payload.type === 'SYNC_UPDATE') {
      const { peerId, name, value } = payload.payload;
      if (peerId === myStateRef.current.peerId) return;

      updateParticipantsList((prev) => {
        const index = prev.findIndex(p => p.peerId === peerId);
        if (index === -1) {
          return [...prev, { peerId, name, value, isSelf: false, status: 'online', lastUpdated: Date.now() }];
        }
        const next = [...prev];
        next[index] = { ...next[index], name, value, status: 'online', lastUpdated: Date.now() };
        return next;
      });
    } else if (payload.type === 'SYNC_TOPIC') {
      setTopic(payload.payload.topic);
      setLabelMin(payload.payload.labelMin);
      setLabelMax(payload.payload.labelMax);
    } else if (payload.type === 'INITIAL_PEER_LIST') {
      const peersToConnect = payload.payload.peers;
      peersToConnect.forEach((targetId) => {
        connectToPeerRef.current(targetId);
      });
    } else if (payload.type === 'HEARTBEAT') {
      const { peerId } = payload.payload;
      updateParticipantsList((prev) => {
        const index = prev.findIndex(p => p.peerId === peerId);
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = { ...next[index], status: 'online', lastUpdated: Date.now() };
        return next;
      });
    } else if (payload.type === 'HOST_MIGRATION') {
      const { action, actingHostId } = payload.payload;
      if (action === 'ELECTION_ANNOUNCEMENT') {
        console.log('Election announcement from:', actingHostId);
        setIsMigrating(true);
        if (hostRoleRef.current === 'Candidate' || hostRoleRef.current === 'Acting Host') {
           if (actingHostId.localeCompare(myStateRef.current.peerId) < 0) {
              console.log('Stepping down, new candidate has smaller ID');
              setHostRole('Guest');
              if (electionTimerRef.current) clearTimeout(electionTimerRef.current);
              if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
           }
        }
      } else if (action === 'HOST_TAKEOVER_SUCCESS') {
         console.log('New Anchor established:', actingHostId);
         setIsMigrating(false);
         if (actingHostId !== myStateRef.current.peerId) {
            connectToPeerRef.current(actingHostId);
         }
      }
    }
  }, [updateParticipantsList]);

  const setupConnection = useCallback((conn: DataConnection) => {
    const anchorId = `${PREFIX}anchor-${roomId}`;

    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
      if (conn.peer === anchorId) {
        reconnectCountRef.current = 0;
        setIsMigrating(false);
      }
      
      const payload: SyncUpdatePayload = {
        type: 'SYNC_UPDATE',
        payload: {
          peerId: myStateRef.current.peerId,
          name: myStateRef.current.name || 'Anonymous',
          value: myStateRef.current.value,
        },
      };
      conn.send(payload);

      const topicPayload: SyncTopicPayload = {
        type: 'SYNC_TOPIC',
        payload: {
          topic: topicRef.current,
          labelMin: labelMinRef.current,
          labelMax: labelMaxRef.current
        },
      };
      conn.send(topicPayload);

      if (hostRoleRef.current === 'Anchor' || hostRoleRef.current === 'Acting Host') {
         const existingPeers = Array.from(connectionsRef.current.entries())
            .filter(([id, c]) => id !== conn.peer && c.open)
            .map(([id]) => id);

         if (existingPeers.length > 0) {
            const listPayload: InitialPeerListPayload = {
                type: 'INITIAL_PEER_LIST',
                payload: { peers: existingPeers }
            };
            conn.send(listPayload);
         }

         const newPeerNotification: InitialPeerListPayload = {
            type: 'INITIAL_PEER_LIST',
            payload: { peers: [conn.peer] }
         };

         connectionsRef.current.forEach((existingConn, id) => {
            if (id !== conn.peer && existingConn.open) {
               existingConn.send(newPeerNotification);
            }
         });
      }
    });

    conn.on('data', (data) => handleData(data));

    conn.on('close', () => {
      connectionsRef.current.delete(conn.peer);
      if (hostRoleRef.current !== 'Anchor' && conn.peer === anchorId) {
        handleAnchorDisconnect();
      } else {
        updateParticipantsList((prev) =>
          prev.map(p => p.peerId === conn.peer ? { ...p, status: 'offline' } : p)
        );
      }
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
      connectionsRef.current.delete(conn.peer);
      if (hostRoleRef.current !== 'Anchor' && conn.peer === anchorId) {
        handleAnchorDisconnect();
      }
    });
  }, [handleData, roomId, updateParticipantsList, handleAnchorDisconnect]);

  const connectToPeer = useCallback((targetId: string) => {
    if (!peerRef.current || connectionsRef.current.has(targetId) || targetId === peerRef.current.id) return;
    const conn = peerRef.current.connect(targetId);
    setupConnection(conn);
  }, [setupConnection]);

  useEffect(() => {
    connectToPeerRef.current = connectToPeer;
    setupConnectionRef.current = setupConnection;
    attemptTakeoverRef.current = attemptTakeover;
  }, [connectToPeer, setupConnection, attemptTakeover]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'connected' && myStateRef.current.peerId) {
        const payload: HeartbeatPayload = {
          type: 'HEARTBEAT',
          payload: { peerId: myStateRef.current.peerId }
        };
        broadcast(payload);
      }
    }, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [status, broadcast]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      updateParticipantsList((prev) => 
        prev.map(p => {
          if (p.status === 'online' && p.lastUpdated && now - p.lastUpdated > PRUNE_INTERVAL) {
            return { ...p, status: 'offline' };
          }
          return p;
        })
      );
    }, PRUNE_INTERVAL);
    return () => clearInterval(interval);
  }, [updateParticipantsList]);

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;
    const currentConnections = connectionsRef.current;

    const initPeer = async () => {
      const { Peer } = await import('peerjs');
      const session = loadSession(roomId);
      const anchorId = `${PREFIX}anchor-${roomId}`;
      const storedPeerId = session.peerId;
      const wasAnchor = session.isAnchor;

      const createPeer = (id?: string) => {
        const p = id ? new Peer(id) : new Peer();

        p.on('open', (newId) => {
          if (!mounted) return;
          const currentIsAnchor = newId === anchorId;
          console.log(currentIsAnchor ? 'I am the Anchor:' : 'Joined as Peer:', newId);
          setIsAnchor(currentIsAnchor);
          setHostRole(currentIsAnchor ? 'Anchor' : 'Guest');
          setPeerId(newId);
          setMyState(prev => ({ ...prev, peerId: newId, status: 'online' }));
          setStatus('connected');

          if (!currentIsAnchor) {
            const conn = p.connect(anchorId);
            setupConnectionRef.current(conn);
          }
        });

        p.on('disconnected', () => {
          if (!mounted || p.destroyed) return;
          console.log('Disconnected from signaling server, attempting to reconnect...');
          setStatus('connecting');
          try {
            p.reconnect();
          } catch (e) {
            if (!p.destroyed) p.destroy();
            createPeer(id);
          }
        });

        p.on('connection', (conn) => setupConnectionRef.current(conn));

        p.on('error', (err) => {
          const error = err as { type: string };
          if (error.type === 'unavailable-id') {
            p.destroy();
            if (!id || id === anchorId) {
              const randomId = `${PREFIX}peer-${Math.random().toString(36).substr(2, 9)}`;
              createPeer(randomId);
            } else {
              createPeer();
            }
          } else if (error.type === 'peer-unavailable') {
             console.log('Target peer unavailable, will retry later.');
             // IMPORTANT FIX: If the anchor is unavailable during a connection attempt,
             // trigger the retry/election logic immediately.
             if (err.toString().includes(anchorId)) {
                handleAnchorDisconnect();
             }
          } else {
            console.error('Peer Error:', err);
            setStatus('error');
          }
        });

        peerRef.current = p;
      };

      if (wasAnchor) {
        createPeer(anchorId);
      } else if (storedPeerId) {
        createPeer(storedPeerId);
      } else {
        createPeer(anchorId);
      }
    };

    initPeer();

    return () => {
      mounted = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (electionTimerRef.current) clearTimeout(electionTimerRef.current);
      if (takeoverTimerRef.current) clearTimeout(takeoverTimerRef.current);
      peerRef.current?.destroy();
      currentConnections.clear();
    };
  }, [roomId, handleAnchorDisconnect]);

  return {
    peerId,
    isAnchor,
    hostRole,
    isMigrating,
    topic,
    labelMin,
    labelMax,
    updateTopic,
    participants,
    myState,
    updateMyState,
    status
  };
}
