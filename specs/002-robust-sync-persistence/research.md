# Research: Robust P2P Synchronization with PeerJS

## Decisions & Rationale

### 1. Storage Choice: `sessionStorage`
- **Decision**: Use `sessionStorage` to store `peerId`, `name`, `value`, and `isAnchor`.
- **Rationale**: `sessionStorage` matches the ephemeral nature of the project. Data persists across reloads in the same tab but is cleared when the tab is closed, adhering to the project's goal of not leaving persistent footprints.

### 2. ID Persistence & Reuse
- **Decision**: Store the `peerId` upon successful connection and try to re-initialize the `Peer` object with that same ID on reload.
- **Rationale**: Reusing the same `peerId` allows other peers to recognize the returning user as the same participant rather than a new one, preventing duplicate entries in the participant list.

### 3. Reconnection Strategy
- **Decision**: Implement a retry loop on the `disconnected` and `close` events of the `Peer` object and its `DataConnection` objects.
- **Rationale**: 
    - `peer.on('disconnected')`: The connection to the signaling server is lost. Call `peer.reconnect()`.
    - `peer.on('close')`: The peer is destroyed. We should attempt to create a new `Peer` instance with the stored `peerId`.
    - `conn.on('close')`: A connection to a specific peer is lost. The initiator (usually the guest or anchor depending on the role) should attempt to reconnect.

### 4. Synchronization Heartbeat / Status Dot
- **Decision**: Add a `status` field to `PeerState` (`'online' | 'reconnecting' | 'offline'`).
- **Rationale**: Provides visual feedback as requested (FR-007). We can use a small colored indicator in the UI.

## Alternatives Considered

- **LocalStorage**: Rejected because it persists forever until cleared, which violates the "session-based" requirement confirmed in clarifications.
- **Auto-Host Delegation**: Rejected during clarification (Option A was chosen: wait for host return).
- **Service Workers**: Overkill for this project's scope and adds unnecessary complexity.

## Findings & Best Practices for PeerJS

- **Signaling Connection vs. Data Connection**: It's important to distinguish between losing the connection to the PeerServer (signaling) and losing the connection between peers (WebRTC). Both need handlers.
- **ID Collisions**: When a peer reloads and tries to use the same ID, the PeerServer might still think the "old" connection is alive for a few seconds. We need to handle `unavailable-id` errors gracefully (perhaps with a short delay or by accepting that the old peer is truly gone).
- **Cleanup**: Always clean up event listeners and destroy `Peer` objects on component unmount to prevent memory leaks and zombie connections.
