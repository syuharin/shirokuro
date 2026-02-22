// P2P Payload Types as defined in specs/001-realtime-slider-sync/contracts/p2p-payloads.md

export type PeerId = string;
export type RoomId = string;

export interface PeerState {
  peerId: PeerId;
  name: string;
  value: number; // 0-100
  isSelf: boolean;
  lastUpdated?: number; // timestamp
}

export type PayloadType = 'SYNC_UPDATE' | 'INITIAL_PEER_LIST' | 'HEARTBEAT';

export interface BasePayload {
  type: PayloadType;
}

export interface SyncUpdatePayload extends BasePayload {
  type: 'SYNC_UPDATE';
  payload: {
    peerId: PeerId;
    name: string;
    value: number;
  };
}

export interface InitialPeerListPayload extends BasePayload {
  type: 'INITIAL_PEER_LIST';
  payload: {
    peers: PeerId[];
  };
}

export interface HeartbeatPayload extends BasePayload {
  type: 'HEARTBEAT';
  payload: Record<string, never>; // Empty payload
}

export type P2PPayload = SyncUpdatePayload | InitialPeerListPayload | HeartbeatPayload;
