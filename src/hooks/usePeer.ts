"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Peer, DataConnection } from 'peerjs';
import { PeerState, P2PPayload, SyncUpdatePayload, InitialPeerListPayload } from '../lib/types';

const PREFIX = 'shirokuro-'; 

export function usePeer(roomId: string, initialName: string = 'Anonymous') {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isAnchor, setIsAnchor] = useState<boolean>(false);
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
  useEffect(() => { myStateRef.current = myState; }, [myState]);

  // Broadcast to all connected peers
  const broadcast = useCallback((data: P2PPayload) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  }, []);

  // Update Local State and Broadcast
  const updateMyState = useCallback((newState: Partial<PeerState>) => {
    setMyState((prev) => {
      // Apply default name if empty
      let updatedName = newState.name !== undefined ? newState.name : prev.name;
      if (updatedName.trim() === '') {
        // Don't override local input state immediately to allow typing, 
        // but for broadcast we might want to send 'Anonymous'.
        // However, better UX is to allow empty in input but show 'Anonymous' in UI.
        // Let's keep state as is, but UI rendering handles 'Anonymous'.
        // But spec says "defaulting to Anonymous if empty".
        // Let's send 'Anonymous' if empty string is provided.
      }

      const updated = { ...prev, ...newState, lastUpdated: Date.now() };
      
      const payload: SyncUpdatePayload = {
        type: 'SYNC_UPDATE',
        payload: {
          peerId: updated.peerId,
          name: updated.name || 'Anonymous', // Fallback for broadcast
          value: updated.value,
        },
      };
      
      broadcast(payload);
      return updated;
    });
  }, [broadcast]);

  // Handle Incoming Data
  const handleData = useCallback((data: unknown, senderId: string) => {
    const payload = data as P2PPayload;
    
    if (payload.type === 'SYNC_UPDATE') {
      const { peerId, name, value } = payload.payload;
      
      setParticipants((prev) => {
        const index = prev.findIndex((p) => p.peerId === peerId);
        if (index >= 0) {
          const newParticipants = [...prev];
          newParticipants[index] = { ...newParticipants[index], name, value, lastUpdated: Date.now() };
          return newParticipants;
        }
        return [...prev, { peerId, name, value, isSelf: false, lastUpdated: Date.now() }];
      });
    } else if (payload.type === 'INITIAL_PEER_LIST') {
      const peersToConnect = payload.payload.peers;
      peersToConnect.forEach((targetId) => {
        connectToPeer(targetId);
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

      // If I am Anchor, send list of other peers to the new joiner
      if (isAnchor) {
         const others = Array.from(connectionsRef.current.keys()).filter(id => id !== conn.peer);
         if (others.length > 0) {
            const listPayload: InitialPeerListPayload = {
                type: 'INITIAL_PEER_LIST',
                payload: { peers: others }
            };
            conn.send(listPayload);
         }
      }
    });

    conn.on('data', (data) => handleData(data, conn.peer));
    
    conn.on('close', () => {
      connectionsRef.current.delete(conn.peer);
      setParticipants((prev) => prev.filter((p) => p.peerId !== conn.peer));
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
      connectionsRef.current.delete(conn.peer);
    });
  }, [handleData, isAnchor]);

  const connectToPeer = useCallback((targetId: string) => {
    if (!peerRef.current || connectionsRef.current.has(targetId) || targetId === peerRef.current.id) return;
    const conn = peerRef.current.connect(targetId);
    setupConnection(conn);
  }, [setupConnection]);

  // Initialize Peer
  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

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

      peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          // Anchor exists, join as regular peer
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
            setupConnection(conn);
          });

          regularPeer.on('connection', (conn) => {
             setupConnection(conn);
          });

          peerRef.current = regularPeer;
        } else {
          console.error('Peer Error:', err);
          setStatus('error');
        }
      });

      peer.on('connection', (conn) => {
        setupConnection(conn);
      });

      peerRef.current = peer;
    };

    initPeer();

    return () => {
      mounted = false;
      peerRef.current?.destroy();
      connectionsRef.current.clear();
    };
  }, [roomId]); 

  return {
    peerId,
    isAnchor,
    participants,
    myState,
    updateMyState,
    status
  };
}
