# Quickstart: Robust Synchronization & Persistence

## Verification Scenarios

### 1. Browser Reload Persistence (P1)
1. Open a room URL (e.g., `/room/test-room`).
2. Set your name to "Alice" and move the slider to 75.
3. Reload the browser tab.
4. **Success**: "Alice" and 75 should be automatically restored.

### 2. Multi-Peer Reload (P1)
1. Open Tab A (Host) and Tab B (Guest).
2. Set Tab B's name to "Bob" and value to 30.
3. Reload Tab B.
4. **Success**: Tab A should see "Bob" temporarily disconnect and then reappear with the same ID, name, and value (30).

### 3. Network Disconnection Handling (P2)
1. Open a room with two participants.
2. Simulate network loss in Tab B (e.g., disconnect Wi-Fi or use Chrome DevTools Offline mode).
3. Tab B should show a "Reconnecting" status dot (FR-007).
4. Restore the network.
5. **Success**: Tab B should automatically reconnect to the mesh and resume synchronization.

### 4. Host Disconnection (P2)
1. Host reloads or disconnects.
2. Guest enters "Reconnecting" state.
3. Host returns to the same room URL.
4. **Success**: Guest automatically re-establishes connection to the host.

## Implementation Checklist

- [ ] Implement `sessionStorage` persistence in `usePeer.ts`.
- [ ] Add `status` field to `PeerState` in `lib/types.ts`.
- [ ] Implement `reconnect()` logic in `usePeer.ts` for `Peer` and `DataConnection` objects.
- [ ] Add visual "Sync Status" dot in `ParticipantList.tsx`.
- [ ] Ensure `INITIAL_PEER_LIST` correctly handles returning peers.
