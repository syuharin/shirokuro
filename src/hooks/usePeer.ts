"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Peer, DataConnection } from 'peerjs';
import { PeerState, P2PPayload, SyncUpdatePayload, InitialPeerListPayload, SyncTopicPayload, HostMigrationPayload, HeartbeatPayload } from '../lib/types';
import { loadSession, saveSession } from '../lib/utils';

const PREFIX = 'shirokuro-'; 

export function usePeer(roomId: string, initialName: string = 'Anonymous') {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isAnchor, setIsAnchor] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('（お題を入力してください）');
  const [labelMin, setLabelMin] = useState<string>('0');
  const [labelMax, setLabelMax] = useState<string>('100');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  
  const [myState, setMyState] = useState<PeerState>(() => {
    const session = loadSession(roomId);
    return {
      peerId: session.peerId || '',
      name: session.name || initialName,
      value: session.value !== null ? session.value : 50,
      isSelf: true,
      status: 'online',
      joinTimestamp: session.joinTimestamp || Date.now(),
      lastUpdated: Date.now(),
    };
  });

  const [participants, setParticipants] = useState<PeerState[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const promotionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const justPromotedRef = useRef(false);
  const MAX_RECONNECT_RETRIES = 5;
  const MIGRATION_GRACE_PERIOD = 3000;
  const HEARTBEAT_INTERVAL = 3000;
  const STALE_THRESHOLD = 10000;
  
  const myStateRef = useRef(myState);
  const topicRef = useRef(topic);
  const labelMinRef = useRef(labelMin);
  const labelMaxRef = useRef(labelMax);
  const isAnchorRef = useRef(isAnchor);
  const participantsRef = useRef(participants);

  // Refs for functions to avoid TDZ and circular dependencies
  const connectToPeerRef = useRef<(id: string) => void>(() => {});
  const setupConnectionRef = useRef<(conn: DataConnection) => void>(() => {});
  const initPeerRef = useRef<() => void>(() => {});

  useEffect(() => { myStateRef.current = myState; }, [myState]);
  useEffect(() => { participantsRef.current = participants; }, [participants]);
  useEffect(() => { topicRef.current = topic; }, [topic]);
  useEffect(() => { labelMinRef.current = labelMin; }, [labelMin]);
  useEffect(() => { labelMaxRef.current = labelMax; }, [labelMax]);
  useEffect(() => { isAnchorRef.current = isAnchor; }, [isAnchor]);

  useEffect(() => {
    saveSession({
      peerId: myState.peerId,
      name: myState.name,
      isAnchor: isAnchor,
      roomId: roomId,
      joinTimestamp: myState.joinTimestamp
    });
  }, [myState.name, myState.peerId, myState.joinTimestamp, isAnchor, roomId]);

  // --- Callbacks (Defined first) ---

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
            joinTimestamp: updated.joinTimestamp,
          },
        };
        broadcast(payload);
      }
      return updated;
    });
  }, [broadcast]);

  const promoteToHost = useCallback(() => {
    console.log('Promoting to Host (Anchor)...');
    
    // Track that we just took over to inform others via HOST_MIGRATION
    justPromotedRef.current = true;
    setTimeout(() => { justPromotedRef.current = false; }, 10000); // Window for existing peers to connect

    saveSession({
      peerId: myStateRef.current.peerId,
      name: myStateRef.current.name,
      isAnchor: true,
      roomId: roomId,
      joinTimestamp: myStateRef.current.joinTimestamp
    });

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    setIsAnchor(true);
    isAnchorRef.current = true;
    setNotification({ message: 'あなたがホストになりました', type: 'success' });
    
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (initPeerRef.current) initPeerRef.current();
  }, [roomId]);

  const handleData = useCallback((data: unknown) => {
    const payload = data as P2PPayload;
    
    if (payload.type === 'SYNC_UPDATE') {
      const { peerId, name, value, joinTimestamp } = payload.payload;
      if (peerId === myStateRef.current.peerId) return;

      setParticipants((prev) => {
        const index = prev.findIndex(p => p.peerId === peerId);
        if (index === -1) {
          return [...prev, { peerId, name, value, joinTimestamp, isSelf: false, status: 'online', lastUpdated: Date.now() }];
        }
        const next = [...prev];
        next[index] = { ...next[index], name, value, joinTimestamp, status: 'online', lastUpdated: Date.now() };
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
      setParticipants((prev) => 
        prev.map(p => p.peerId === peerId ? { ...p, status: 'online', lastUpdated: Date.now() } : p)
      );
    } else if (payload.type === 'HOST_MIGRATION') {
      const { newHostId } = payload.payload;
      const newHost = participantsRef.current.find(p => p.peerId === newHostId);
      setNotification({ message: newHost ? `新しいホスト: ${newHost.name || 'ゲスト'}` : 'ホストが交代しました', type: 'info' });
    }
  }, []);

  const setupConnection = useCallback((conn: DataConnection) => {
    const anchorId = `${PREFIX}anchor-${roomId}`;

    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
      
      if (conn.peer === anchorId) {
        reconnectCountRef.current = 0;
        if (promotionTimerRef.current) {
          clearTimeout(promotionTimerRef.current);
          promotionTimerRef.current = null;
        }
      }
      
      const payload: SyncUpdatePayload = {
        type: 'SYNC_UPDATE',
        payload: {
          peerId: myStateRef.current.peerId,
          name: myStateRef.current.name || 'Anonymous',
          value: myStateRef.current.value,
          joinTimestamp: myStateRef.current.joinTimestamp,
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

      if (isAnchorRef.current) {
        if (justPromotedRef.current) {
          const migrationPayload: HostMigrationPayload = {
            type: 'HOST_MIGRATION',
            payload: {
              newHostId: myStateRef.current.peerId,
              oldHostId: anchorId,
              timestamp: Date.now()
            }
          };
          conn.send(migrationPayload);
        }

        const existingPeers = Array.from(connectionsRef.current.entries())
          .filter(([id, c]) => id !== conn.peer && c.open)
          .map(([id]) => id);

        if (existingPeers.length > 0) {
          conn.send({ type: 'INITIAL_PEER_LIST', payload: { peers: existingPeers } } as InitialPeerListPayload);
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
      
      if (!isAnchorRef.current && conn.peer === anchorId) {
        if (!promotionTimerRef.current) {
          console.log(`Anchor lost. Starting migration election timer (${MIGRATION_GRACE_PERIOD}ms)...`);
          promotionTimerRef.current = setTimeout(() => {
            const now = Date.now();
            const activeOthers = participantsRef.current.filter(p => 
              p.status === 'online' && (now - (p.lastUpdated || 0) < STALE_THRESHOLD)
            );
            const myJoin = myStateRef.current.joinTimestamp;
            const myId = myStateRef.current.peerId;

            const candidates = [...activeOthers, myStateRef.current].sort((a, b) => {
              if (a.joinTimestamp !== b.joinTimestamp) return a.joinTimestamp - b.joinTimestamp;
              return (a.peerId || '').localeCompare(b.peerId || '');
            });

            if (candidates[0].peerId === myId) {
              promoteToHost();
            } else {
              console.log(`Another peer is senior (Join: ${candidates[0].joinTimestamp}). Waiting for them to anchor.`);
            }
            promotionTimerRef.current = null;
          }, MIGRATION_GRACE_PERIOD);
        }

        if (reconnectCountRef.current < MAX_RECONNECT_RETRIES) {
          reconnectCountRef.current++;
          const delay = 1000 * Math.pow(2, reconnectCountRef.current);
          console.log(`Anchor connection lost. Retrying (${reconnectCountRef.current}/${MAX_RECONNECT_RETRIES}) in ${delay}ms...`);
          setMyState(prev => ({ ...prev, status: 'reconnecting' }));
          
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            if (peerRef.current && !peerRef.current.destroyed) {
              connectToPeerRef.current(anchorId);
            }
          }, delay);
        } else {
          console.error('Max reconnection retries reached.');
          setMyState(prev => ({ ...prev, status: 'offline' }));
        }
      } else {
        setParticipants((prev) => prev.map(p => p.peerId === conn.peer ? { ...p, status: 'offline' } : p));
      }
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
      connectionsRef.current.delete(conn.peer);
    });
  }, [handleData, roomId, promoteToHost]);

  const connectToPeer = useCallback((targetId: string) => {
    if (!peerRef.current || connectionsRef.current.has(targetId) || targetId === peerRef.current.id) return;
    const conn = peerRef.current.connect(targetId);
    setupConnection(conn);
  }, [setupConnection]);

  // --- Effects (Using the defined callbacks) ---

  useEffect(() => { connectToPeerRef.current = connectToPeer; }, [connectToPeer]);
  useEffect(() => { setupConnectionRef.current = setupConnection; }, [setupConnection]);

  // Heartbeat and Stale Monitoring
  useEffect(() => {
    if (status !== 'connected') {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (monitorTimerRef.current) clearInterval(monitorTimerRef.current);
      return;
    }

    heartbeatTimerRef.current = setInterval(() => {
      broadcast({ type: 'HEARTBEAT', payload: { peerId: myStateRef.current.peerId } } as HeartbeatPayload);
    }, HEARTBEAT_INTERVAL);

    monitorTimerRef.current = setInterval(() => {
      const now = Date.now();
      const anchorId = `${PREFIX}anchor-${roomId}`;
      let anchorLostSilently = false;

      setParticipants((prev) => {
        const next = prev.map(p => {
          const isStale = now - (p.lastUpdated || 0) > STALE_THRESHOLD;
          if (isStale && p.status === 'online') {
            if (p.peerId === anchorId) anchorLostSilently = true;
            return { ...p, status: 'offline' as const };
          }
          return p;
        });

        if (anchorLostSilently && !isAnchorRef.current && !promotionTimerRef.current) {
          console.log('Anchor heartbeat lost. Triggering silent migration...');
          const myJoin = myStateRef.current.joinTimestamp;
          const myId = myStateRef.current.peerId;
          const activeOthers = next.filter(p => p.status === 'online');

          const candidates = [...activeOthers, myStateRef.current].sort((a, b) => {
            if (a.joinTimestamp !== b.joinTimestamp) return a.joinTimestamp - b.joinTimestamp;
            return (a.peerId || '').localeCompare(b.peerId || '');
          });

          if (candidates[0].peerId === myId) {
            setTimeout(() => promoteToHost(), 0);
          }
        }
        return next;
      });
    }, 2000);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (monitorTimerRef.current) clearInterval(monitorTimerRef.current);
    };
  }, [status, roomId, broadcast, promoteToHost]);

  // Initialize Peer
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
          setStatus('connecting');
          setMyState(prev => ({ ...prev, status: 'reconnecting' }));
          try { p.reconnect(); } catch (e) {
            if (!p.destroyed) p.destroy();
            createPeer(id);
          }
        });

        p.on('connection', (conn) => { setupConnectionRef.current(conn); });

        p.on('error', (err) => {
          const error = err as { type: string };
          if (error.type === 'unavailable-id') {
            p.destroy();
            if (!id || id === anchorId) {
              createPeer(`${PREFIX}peer-${Math.random().toString(36).substr(2, 9)}`);
            } else {
              createPeer();
            }
          } else {
            setStatus('error');
            setMyState(prev => ({ ...prev, status: 'offline' }));
          }
        });
        peerRef.current = p;
      };

      if (wasAnchor) { createPeer(anchorId); }
      else if (storedPeerId) { createPeer(storedPeerId); }
      else { createPeer(anchorId); }
    };

    initPeer();
    initPeerRef.current = initPeer;

    return () => {
      mounted = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (promotionTimerRef.current) clearTimeout(promotionTimerRef.current);
      peerRef.current?.destroy();
      currentConnections.clear();
    };
  }, [roomId]); 

  return {
    peerId, isAnchor, topic, labelMin, labelMax, updateTopic,
    participants, myState, updateMyState, status, notification,
    clearNotification: () => setNotification(null)
  };
}
