# Data Model: Robust Sync & Persistence

## Browser Persistence (`sessionStorage`)

The following state is persisted to handle browser reloads within a session.

| Field | Type | Description |
| :--- | :--- | :--- |
| `shirokuro_peerId` | `string` | The stable PeerJS ID for this session. |
| `shirokuro_name` | `string` | The user's chosen display name. |
| `shirokuro_value` | `number` | The current slider value (0-100). |
| `shirokuro_isAnchor` | `boolean` | Whether the user is the host/anchor of the room. |
| `shirokuro_roomId` | `string` | The ID of the room these settings belong to (for validation). |

## In-Memory Peer State (`PeerState`)

Extended from the current state to include synchronization status.

| Field | Type | Description |
| :--- | :--- | :--- |
| `peerId` | `string` | Unique identifier. |
| `name` | `string` | Participant name. |
| `value` | `number` | Current slider value. |
| `isSelf` | `boolean` | Whether this is the local user. |
| `status` | `string` | `'online' \| 'reconnecting' \| 'offline'`. |
| `lastUpdated` | `number` | Unix timestamp of the last message received. |

## P2P Mesh Representation (`PeerMesh`)

Managed in `usePeer.ts`.

- `peerRef`: Reference to the `Peer` object.
- `connectionsRef`: Map of active `DataConnection` objects keyed by `peerId`.
- `reconnectCount`: Counter for exponential backoff on reconnection attempts.
