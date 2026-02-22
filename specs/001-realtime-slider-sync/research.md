# Research: P2P Synchronization and Distribution Map

## Decision: Deterministic Anchor for P2P Discovery

### Rationale
To allow users to find each other without a central server or database, the first user to enter a room attempts to claim a deterministic ID: `shirokuro-anchor-[roomId]`. Subsequent users, seeing this ID is taken, join as regular peers and connect to this anchor.

### Peer Management (Anchor Role)
- The Anchor maintains a list of all current connections.
- When a new peer joins, the Anchor sends them the `INITIAL_PEER_LIST` containing existing Peer IDs.
- This creates a **mesh topology** where all peers are eventually connected to each other, rather than a star topology around the anchor.

## Decision: Room Metadata (Topic) Synchronization

### Rationale
A collaborative slider needs context. We implement a "Topic" system where users can set what the slider measures (e.g., "Will AI replace programmers?").

### Implementation
- Added `SYNC_TOPIC` payload.
- When a peer joins, the Anchor immediately sends the current topic and labels to them.
- Any participant can edit the topic, which broadcasts the change to everyone.

## Decision: Horizontal Distribution Map with Collision Handling

### Rationale
Visualizing where everyone stands relative to each other is more intuitive than a simple list. A horizontal track with overlaid markers provides this "spectrum" view.

### Collision Handling
- If multiple users have the same or close values (within a proximity threshold), markers are offset vertically.
- This allows up to 10 users to be seen clearly even if they all choose the same value.

## Technical Details

### UI Implementation
- **Component**: `ParticipantPositionBar`
- **Visuals**: Track with an axis line. Markers are animated using `framer-motion` (or standard Tailwind transitions) for smooth movement when values update.
- **Self-Highlight**: The current user's marker is black with a pulse effect to distinguish it from others.

### State Management
- `usePeer` hook encapsulates all PeerJS logic, providing `participants` (array of `PeerState`) and `updateMyState` to components.
- Components are stateless and reactive to the `usePeer` state.

## Dependencies
- **PeerJS**: For WebRTC abstraction.
- **Lucide React**: For iconography.
- **Tailwind CSS**: For all styling and animations.
