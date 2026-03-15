# Data Model: Automatic Host Migration

## Entity: Participant (Updated)
Represents a user in a PeerJS-based room.

| Field | Type | Description |
|---|---|---|
| `peerId` | string | Unique PeerJS ID. |
| `name` | string | User's display name. |
| `value` | number | Current slider value (0-100). |
| `role` | enum | `Host` or `Guest`. |
| `status` | enum | `online`, `reconnecting`, `offline`. |
| `joinTimestamp` | number | Unix timestamp of when the user joined the room. Used for host election. |
| `lastUpdated` | number | Timestamp of the last state update received. |

## Role Transition Logic
- **Host Selection**: The participant with the *lowest* `joinTimestamp` in the current room is the candidate for the `Host` role.
- **Collision Handling**: If two `joinTimestamp` are identical, the lexicographically smaller `peerId` takes precedence.
- **Migration Trigger**: When the current `Host`'s connection is `closed` and not recovered within 5 seconds.
