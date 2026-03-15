"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Peer, DataConnection } from 'peerjs';
import { PeerState, P2PPayload, SyncUpdatePayload, InitialPeerListPayload, SyncTopicPayload, HostMigrationPayload } from '../lib/types';
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
    // T005: Load session state on mount
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
  const MAX_RECONNECT_RETRIES = 5;
  const MIGRATION_GRACE_PERIOD = 3000; // 3 seconds as per research.md
  const HEARTBEAT_INTERVAL = 3000; // Send heartbeat every 3s
  const STALE_THRESHOLD = 10000; // Mark as offline if no update for 10s
  
  const myStateRef = useRef(myState);
  const topicRef = useRef(topic);
  const labelMinRef = useRef(labelMin);
  const labelMaxRef = useRef(labelMax);
  const isAnchorRef = useRef(isAnchor);
  const participantsRef = useRef(participants);

  useEffect(() => { 
    myStateRef.current = myState;
  }, [myState]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  // T006: Persist profile changes to sessionStorage (avoiding high-frequency slider value writes)
  useEffect(() => {
    saveSession({
      peerId: myState.peerId,
      name: myState.name,
      isAnchor: isAnchor,
      roomId: roomId,
      joinTimestamp: myState.joinTimestamp
    });
  }, [myState.name, myState.peerId, myState.joinTimestamp, isAnchor, roomId]);

  useEffect(() => { topicRef.current = topic; }, [topic]);
  useEffect(() => { labelMinRef.current = labelMin; }, [labelMin]);
  useEffect(() => { labelMaxRef.current = labelMax; }, [labelMax]);
  useEffect(() => { isAnchorRef.current = isAnchor; }, [isAnchor]);

  // T015: Heartbeat and Stale Monitoring Logic
  useEffect(() => {
    if (status !== 'connected') {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (monitorTimerRef.current) clearInterval(monitorTimerRef.current);
      return;
    }

    // 1. Send Heartbeat
    heartbeatTimerRef.current = setInterval(() => {
      const payload: P2PPayload = {
        type: 'HEARTBEAT',
        payload: { peerId: myStateRef.current.peerId }
      };
      broadcast(payload);
    }, HEARTBEAT_INTERVAL);

    // 2. Monitor Stale Participants
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

        // Trigger migration if anchor was marked offline in this pass
        if (anchorLostSilently && !isAnchorRef.current && !promotionTimerRef.current) {
          console.log('Anchor heartbeat lost. Triggering silent migration...');
          
          // Election logic: must use 'next' which has the latest offline statuses
          const myJoin = myStateRef.current.joinTimestamp;
          const myId = myStateRef.current.peerId;
          const activeOthers = next.filter(p => p.status === 'online');

          const candidates = [...activeOthers, myStateRef.current].sort((a, b) => {
            if (a.joinTimestamp !== b.joinTimestamp) return a.joinTimestamp - b.joinTimestamp;
            return (a.peerId || '').localeCompare(b.peerId || '');
          });

          if (candidates[0].peerId === myId) {
            // Race condition fix: Move the side effect out of the state updater
            setTimeout(() => promoteToHost(), 0);
          }
        }

        return next;
      });
    }, 2000); // Check every 2s

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (monitorTimerRef.current) clearInterval(monitorTimerRef.current);
    };
  }, [status, roomId, broadcast, promoteToHost]);

  // Broadcast to all connected peers
  const broadcast = useCallback((data: P2PPayload) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  }, []);

  // Update Topic and Broadcast
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

  // Update Local State and Broadcast
  const updateMyState = useCallback((newState: Partial<PeerState>, shouldBroadcast: boolean = true) => {
    setMyState((prev) => {
      const updated = { ...prev, ...newState, lastUpdated: Date.now() };
      
      if (shouldBroadcast) {
        const payload: SyncUpdatePayload = {
          type: 'SYNC_UPDATE',
          payload: {
            peerId: updated.peerId,
            name: updated.name || 'Anonymous', // Fallback for broadcast
            value: updated.value,
            joinTimestamp: updated.joinTimestamp,
          },
        };
        
        broadcast(payload);
      }
      return updated;
    });
  }, [broadcast]);

  // Use a ref for connectToPeer to avoid circular dependency with setupConnection
  const connectToPeerRef = useRef<(id: string) => void>(() => {});
  // Use a ref for setupConnection to avoid effect re-runs
  const setupConnectionRef = useRef<(conn: DataConnection) => void>(() => {});
  // Use a ref for initPeer to allow re-triggering from promotion
  const initPeerRef = useRef<() => void>(() => {});

  const promoteToHost = useCallback(() => {
    console.log('Promoting to Host (Anchor)...');
    
    // Race condition fix: Explicitly persist the new role before re-initializing
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
    
    // Set flag to try becoming anchor in next init
    setIsAnchor(true);
    isAnchorRef.current = true;
    setNotification({ message: 'あなたがホストになりました', type: 'success' });
    
    // Clear any existing reconnect timers
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    
    // Re-initialize as Anchor
    if (initPeerRef.current) initPeerRef.current();
  }, []);

  // Handle Incoming Data
  const handleData = useCallback((data: unknown) => {
    const payload = data as P2PPayload;
    
    if (payload.type === 'SYNC_UPDATE') {
      const { peerId, name, value, joinTimestamp } = payload.payload;
      
      // Skip if this is my own data (prevents double self in participants list)
      if (peerId === myStateRef.current.peerId) return;

      setParticipants((prev) => {
        const index = prev.findIndex(p => p.peerId === peerId);
        if (index === -1) {
          return [...prev, { peerId, name, value, joinTimestamp, isSelf: false, status: 'online', lastUpdated: Date.now() }];
        }
        // Surgical update to avoid unnecessary array/object recreation during frequent slider moves
        const next = [...prev];
        next[index] = { ...next[index], name, value, joinTimestamp, status: 'online', lastUpdated: Date.now() };
        return next;
      });

      // T014: If I am Anchor, I might need to broadcast this to ensure consistency, 
      // though PeerJS mesh usually handles this if all peers are connected.
      // For robustness, Anchor acts as a relay for state if requested.
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
      // Simple presence confirmation
      const { peerId } = payload.payload;
      setParticipants((prev) => 
        prev.map(p => p.peerId === peerId ? { ...p, status: 'online', lastUpdated: Date.now() } : p)
      );
    } else if (payload.type === 'HOST_MIGRATION') {
      const { newHostId } = payload.payload;
      console.log('Host migration detected:', newHostId);
      
      const newHost = participantsRef.current.find(p => p.peerId === newHostId);
      if (newHost) {
        setNotification({ message: `新しいホスト: ${newHost.name || 'ゲスト'}`, type: 'info' });
      } else {
        setNotification({ message: 'ホストが交代しました', type: 'info' });
      }
    }
  }, []);

  const setupConnection = useCallback((conn: DataConnection) => {
    const anchorId = `${PREFIX}anchor-${roomId}`;

    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
      
      // Reset reconnect count if we successfully connect to the Anchor
      if (conn.peer === anchorId) {
        reconnectCountRef.current = 0;
        if (promotionTimerRef.current) {
          clearTimeout(promotionTimerRef.current);
          promotionTimerRef.current = null;
        }
      }
      
      // T013: Send my state immediately upon (re)connection
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

      // Send the current topic and labels
      const topicPayload: SyncTopicPayload = {
        type: 'SYNC_TOPIC',
        payload: { 
          topic: topicRef.current,
          labelMin: labelMinRef.current,
          labelMax: labelMaxRef.current
        },
      };
      conn.send(topicPayload);

      // If I am Anchor, broadcast migration notification if needed
      if (isAnchorRef.current) {
        const migrationPayload: HostMigrationPayload = {
          type: 'HOST_MIGRATION',
          payload: {
            newHostId: myStateRef.current.peerId,
            oldHostId: anchorId, // technically we are the new anchor
            timestamp: Date.now()
          }
        };
        conn.send(migrationPayload);
      }

      // If I am Anchor, manage mesh connections
      if (isAnchorRef.current) {
         // 1. Send the list of existing peers to the new joiner so they can connect to everyone
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

         // 2. Broadcast the NEW peer's ID to all existing peers so they can connect to the joiner
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
      
      // T010: Reconnection logic with exponential backoff and retry limit
      if (!isAnchorRef.current && conn.peer === anchorId) {
        // Start promotion timer if anchor is lost
        if (!promotionTimerRef.current) {
          console.log(`Anchor lost. Starting migration election timer (${MIGRATION_GRACE_PERIOD}ms)...`);
          promotionTimerRef.current = setTimeout(() => {
            // Election logic: find participant with lowest joinTimestamp who is actually active
            const now = Date.now();
            const activeOthers = participantsRef.current.filter(p => 
              p.status === 'online' && (now - (p.lastUpdated || 0) < STALE_THRESHOLD)
            );
            const myJoin = myStateRef.current.joinTimestamp;
            const myId = myStateRef.current.peerId;

            const candidates = [...activeOthers, myStateRef.current].sort((a, b) => {
              if (a.joinTimestamp !== b.joinTimestamp) {
                return a.joinTimestamp - b.joinTimestamp;
              }
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
          // Clarified backoff: 2s, 4s, 8s...
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
          console.error('Max reconnection retries reached. Please reload manually.');
          setMyState(prev => ({ ...prev, status: 'offline' }));
        }
      } else {
        setParticipants((prev) => 
          prev.map(p => p.peerId === conn.peer ? { ...p, status: 'offline' } : p)
        );
      }
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
      connectionsRef.current.delete(conn.peer);
    });
  }, [handleData, roomId]);

  const connectToPeer = useCallback((targetId: string) => {
    if (!peerRef.current || connectionsRef.current.has(targetId) || targetId === peerRef.current.id) return;
    const conn = peerRef.current.connect(targetId);
    setupConnection(conn);
  }, [setupConnection]);

  // Sync the refs
  useEffect(() => {
    connectToPeerRef.current = connectToPeer;
  }, [connectToPeer]);

  useEffect(() => {
    setupConnectionRef.current = setupConnection;
  }, [setupConnection]);

  // Initialize Peer
  useEffect(() => {
    if (!roomId) return;

    let mounted = true;
    const currentConnections = connectionsRef.current;

    const initPeer = async () => {
      const { Peer } = await import('peerjs');
      
      const session = loadSession(roomId);
      const anchorId = `${PREFIX}anchor-${roomId}`;
      
      // T007: Try to use existing peerId if available, otherwise determine role
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
            // Connect to Anchor
            const conn = p.connect(anchorId);
            setupConnectionRef.current(conn);
          }
        });

        // T009: Reconnect to signaling server if disconnected
        p.on('disconnected', () => {
          if (!mounted || p.destroyed) return;

          console.log('Disconnected from signaling server, attempting to reconnect...');
          setStatus('connecting');
          setMyState(prev => ({ ...prev, status: 'reconnecting' }));
          
          try {
            p.reconnect();
          } catch (e) {
            console.error('Reconnect failed, falling back to re-creation:', e);
            if (!p.destroyed) p.destroy();
            createPeer(id);
          }
        });

        p.on('connection', (conn) => {
          setupConnectionRef.current(conn);
        });

        p.on('error', (err) => {
          const error = err as { type: string };
          if (error.type === 'unavailable-id') {
            console.log('ID unavailable, trying fallback...');
            p.destroy();
            // If we were trying to be anchor and failed, join as peer
            if (!id || id === anchorId) {
              const randomId = `${PREFIX}peer-${Math.random().toString(36).substr(2, 9)}`;
              createPeer(randomId);
            } else {
              // If we were a peer and our ID is taken, just get a new one
              createPeer();
            }
          } else if (error.type === 'peer-unavailable') {
             // Host might be reloading, we'll wait and retry via connection close handlers
             console.log('Target peer unavailable, will retry later.');
          } else {
            console.error('Peer Error:', err);
            setStatus('error');
            setMyState(prev => ({ ...prev, status: 'offline' }));
          }
        });

        peerRef.current = p;
      };

      // Initial attempt logic
      if (wasAnchor) {
        createPeer(anchorId);
      } else if (storedPeerId) {
        createPeer(storedPeerId);
      } else {
        // First time joining
        createPeer(anchorId); // Try to be anchor first
      }
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
    peerId,
    isAnchor,
    topic,
    labelMin,
    labelMax,
    updateTopic,
    participants,
    myState,
    updateMyState,
    status,
    notification,
    clearNotification: () => setNotification(null)
  };
}
