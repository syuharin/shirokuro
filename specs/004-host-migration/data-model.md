# Data Model: Host Migration Logic

## State Transitions: Host Role
A peer can transition through several host-related roles during its lifecycle.

### Roles
- **Guest (Normal Peer)**: A participant who is not the coordinator.
- **Candidate (Election Winner)**: The peer identified as the new coordinator by the election rule.
- **Acting Host**: A candidate who has successfully assumed coordination duties (responding to newcomers).
- **Anchor (Final Host)**: An Acting Host who has successfully re-occupied the static `anchor-ID`.

### Role Transition Rules
| From | To | Trigger | Action |
|------|----|---------|--------|
| Guest | Candidate | Anchor connection lost & ID is lexicographically smallest | Identify as winner |
| Candidate | Acting Host | Election period expires (avoiding races) | Start mesh coordination |
| Acting Host | Anchor | Static `anchor-ID` registration successful | Switch from random ID to static ID |
| Anchor | Guest | Original Anchor re-joins (reclaiming ID) | Relinquish coordination |

## Participant Tracking
To perform the election, each client must maintain a reliable list of all other participants.

### Fields for Election
- `peerId`: Unique PeerJS identifier (used for lexicographical sorting).
- `status`: Only 'online' peers are considered in the election list.
- `lastUpdated`: Used to prune dead peers from the election pool (via Heartbeats).
