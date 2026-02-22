# Data Model: Participant Visualization State

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
- **Sync**: Reactive to `SYNC_UPDATE` events; no internal state needed (stateless display component).
