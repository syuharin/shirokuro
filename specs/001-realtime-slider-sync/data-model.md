# Data Model: Real-time Slider Sync

## Entities

### 1. PeerState
Represents a participant in the room.

| Field | Type | Description |
|-------|------|-------------|
| `peerId` | `string` | Unique identifier (from PeerJS) |
| `name` | `string` | Temporary display name |
| `value` | `number` | Slider value (0-100, step: 5) |
| `isSelf` | `boolean` | True if the peer represents the current user |
| `lastUpdated`| `number` | Timestamp of the last update |

### 2. RoomState
Represents the room-wide shared context.

| Field | Type | Description |
|-------|------|-------------|
| `roomId` | `string` | Unique identifier (from URL) |
| `topic` | `string` | Current question or topic |
| `labelMin` | `string` | Label for value 0 |
| `labelMax` | `string` | Label for value 100 |

## Relationships
- A **Room** contains multiple **Peers**.
- Peers communicate directly via WebRTC data channels.
- State is managed via the `usePeer` hook which uses a `Map<PeerId, PeerState>` internally.

## State Transitions

### Join
- New peer creates a PeerJS instance.
- Joins via URL ID.
- If Anchor exists, receives `INITIAL_PEER_LIST`.
- Broadcasts its own presence.

### Update Value
- User interacts with the `InteractiveParticipantPositionBar` (Integrated Slider).
- `onValueChange`: Local state updates.
- `onValueCommit`: `SYNC_UPDATE` payload broadcasted to all connected peers.

### Update Topic
- Any peer can update the topic.
- `SYNC_TOPIC` payload broadcasted.
