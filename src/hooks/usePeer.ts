"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Peer, DataConnection } from 'peerjs';
import { PeerState, P2PPayload, SyncUpdatePayload, InitialPeerListPayload, SyncTopicPayload } from '../lib/types';

const PREFIX = 'shirokuro-'; 

export function usePeer(roomId: string, initialName: string = 'Anonymous') {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isAnchor, setIsAnchor] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>('（お題を入力してください）');
  const [labelMin, setLabelMin] = useState<string>('0');
  const [labelMax, setLabelMax] = useState<string>('100');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const [myState, setMyState] = useState<PeerState>({
    peerId: '',
    name: initialName,
    value: 50,
    isSelf: true,
    lastUpdated: Date.now(),
  });

  const [participants, setParticipants] = useState<PeerState[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  
  const myStateRef = useRef(myState);
  const topicRef = useRef(topic);
  const labelMinRef = useRef(labelMin);
  const labelMaxRef = useRef(labelMax);
  const isAnchorRef = useRef(isAnchor);

  useEffect(() => { myStateRef.current = myState; }, [myState]);
  useEffect(() => { topicRef.current = topic; }, [topic]);
  useEffect(() => { labelMinRef.current = labelMin; }, [labelMin]);
  useEffect(() => { labelMaxRef.current = labelMax; }, [labelMax]);
  useEffect(() => { isAnchorRef.current = isAnchor; }, [isAnchor]);

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

  // Handle Incoming Data
  const handleData = useCallback((data: unknown) => {
    const payload = data as P2PPayload;
    
    if (payload.type === 'SYNC_UPDATE') {
      const { peerId, name, value } = payload.payload;
      
      // Skip if this is my own data (prevents double self in participants list)
      if (peerId === myStateRef.current.peerId) return;

      setParticipants((prev) => {
        const index = prev.findIndex((p) => p.peerId === peerId);
        if (index >= 0) {
          const newParticipants = [...prev];
          newParticipants[index] = { ...newParticipants[index], name, value, lastUpdated: Date.now() };
          return newParticipants;
        }
        return [...prev, { peerId, name, value, isSelf: false, lastUpdated: Date.now() }];
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
    }
  }, []);

  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      connectionsRef.current.set(conn.peer, conn);
      
      // Send my state immediately
      const payload: SyncUpdatePayload = {
        type: 'SYNC_UPDATE',
        payload: {
          peerId: myStateRef.current.peerId,
          name: myStateRef.current.name || 'Anonymous',
          value: myStateRef.current.value,
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
         // We use INITIAL_PEER_LIST with a single peerId for this purpose
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
      setParticipants((prev) => prev.filter((p) => p.peerId !== conn.peer));
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
      connectionsRef.current.delete(conn.peer);
    });
  }, [handleData]);

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
      
      const anchorId = `${PREFIX}anchor-${roomId}`;
      
      // Try to be the Anchor
      const peer = new Peer(anchorId);

      peer.on('open', (id) => {
        if (!mounted) return;
        console.log('I am the Anchor:', id);
        setIsAnchor(true);
        setPeerId(id);
        setMyState(prev => ({ ...prev, peerId: id }));
        setStatus('connected');
      });

      peer.on('error', (err) => {
        const error = err as { type: string };
        if (error.type === 'unavailable-id') {
          // Anchor exists, join as regular peer
          peer.destroy();
          console.log('Anchor exists, joining as regular peer...');
          const randomId = `${PREFIX}peer-${Math.random().toString(36).substr(2, 9)}`;
          const regularPeer = new Peer(randomId);

          regularPeer.on('open', (id) => {
            if (!mounted) return;
            console.log('Joined as Peer:', id);
            setIsAnchor(false);
            setPeerId(id);
            setMyState(prev => ({ ...prev, peerId: id }));
            setStatus('connected');

            // Connect to Anchor
            const conn = regularPeer.connect(anchorId);
            setupConnectionRef.current(conn);
          });

          regularPeer.on('connection', (conn) => {
             setupConnectionRef.current(conn);
          });

          peerRef.current = regularPeer;
        } else {
          console.error('Peer Error:', err);
          setStatus('error');
        }
      });
      peer.on('connection', (conn) => {
        setupConnectionRef.current(conn);
      });

      peerRef.current = peer;
    };

    initPeer();

    return () => {
      mounted = false;
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
    status
  };
}
