# Data Model: Participant and Room State

## Component: `ParticipantPositionBar`

### Props
- `myState`: `PeerState` (Self)
- `participants`: `PeerState[]` (Other connected peers)

### Internal Representation (per marker)
For rendering, the component maps `PeerState` objects into markers:

| Field | Source | Note |
|-------|--------|------|
| ID | `peerId` | Unique key for React |
| Name | `name` | Used for hover/display |
| Position | `value` | Number (0-100) used for `left` calculation |
| IsSelf | `isSelf` | Used for highlighting marker |

### Relationship
- **One-to-Many**: One `ParticipantPositionBar` displays multiple `PeerState` markers.
- **Sync**: Reactive to `SYNC_UPDATE` and `SYNC_TOPIC` events; no internal state needed (stateless display component).

## State: `RoomMetadata` (Synchronized)
This state is maintained by all connected peers and represents the room's current context.

| Field | Type | Default |
|-------|------|---------|
| `topic` | `string` | "（お題を入力してください）" |
| `labelMin` | `string` | "0" |
| `labelMax` | `string` | "100" |

### State Transitions
- **JOIN**: Receiving initial metadata from existing peers.
- **UPDATE**: Any user can change the topic/labels, which triggers a `SYNC_TOPIC` broadcast to all connected peers.

## State: `PeerState` (Synchronized)
Each peer maintains their own state and broadcasts updates to others.

| Field | Type | Note |
|-------|------|------|
| `peerId` | `string` | Unique WebRTC ID |
| `name` | `string` | Display name (default "Anonymous") |
| `value` | `number` | Slider value (0-100) |
| `isSelf` | `boolean` | Client-side only flag |
| `lastUpdated`| `number` | Timestamp for sorting/freshness |
