// P2P Payload Types as defined in specs/001-realtime-slider-sync/contracts/p2p-payloads.md

export type PeerId = string;
export type RoomId = string;

export interface PeerState {
  peerId: PeerId;
  name: string;
  value: number; // 0-100
  isSelf: boolean;
  status: 'online' | 'reconnecting' | 'offline';
  lastUpdated?: number; // timestamp
}

export interface RoomState {
  roomId: RoomId;
  topic: string;
  labelMin: string;
  labelMax: string;
}

export type PayloadType = 'SYNC_UPDATE' | 'INITIAL_PEER_LIST' | 'SYNC_TOPIC' | 'HEARTBEAT';

export interface BasePayload {
  type: PayloadType;
}

export interface SyncTopicPayload extends BasePayload {
  type: 'SYNC_TOPIC';
  payload: {
    topic: string;
    labelMin: string;
    labelMax: string;
  };
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

export type P2PPayload = SyncUpdatePayload | InitialPeerListPayload | SyncTopicPayload | HeartbeatPayload;
