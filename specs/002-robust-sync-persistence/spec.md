# Feature Specification: Robust Synchronization and Reload Persistence

**Feature Branch**: `002-robust-sync-persistence`  
**Created**: 2026-03-14  
**Status**: Draft  
Input: User description: "ゲスト同士やホスト-ゲストの同期の方法を堅牢化したいです。ブラウザをリロードしても同期を保てるようにしたいです。"

## Clarifications

### Session 2026-03-14
- Q: How long should this identity and slider state persist in the user's browser? → A: Session-based (Persists only until the browser/tab is closed)
- Q: What should happen to guests if the host is disconnected/reloading? → A: Wait for host return (Guests enter a reconnecting state and wait for the original host to come back)
- Q: Which slider value takes priority on reconnection? → A: Guest's latest operation (Guest sends their local state upon reconnection, and host broadcasts it)
- Q: Where should the "Sync Status" indicator dot be displayed? → A: Next to the participant's name in the list (Indicating personal connection state)

## Constitution Alignment *(mandatory)*

- **Zero Database Policy**: Confirmed. Persistence across reloads will use browser local storage or session storage, not an external/internal DB.
- **No User Management**: Confirmed. No login/account logic. Participants are identified by transient IDs or names stored locally.
- **Stateless Grouping**: Confirmed. Grouping remains via URL path parameters (Room ID).
- **Real-time P2P**: Confirmed. Synchronization continues to use PeerJS/WebRTC. This feature focuses on making the P2P mesh more resilient.
- **Vercel Native**: Confirmed. No backend changes required.
- **Minimalist UI**: Confirmed. The UI remains a 0-100 slider and a participant list.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless Reload Persistence (Priority: P1)

As a participant (host or guest) in a room, I want my slider position and identity to be remembered if I accidentally reload my browser, so that I don't have to re-enter my name or reset my slider, and others still see me as the same participant.

**Why this priority**: High. Sudden reloads or connection drops shouldn't force a user to restart their session, which disrupts the collective experience.

**Independent Test**: Join a room, set a name and slider value, reload the browser, and verify that the name and slider value are automatically restored and broadcasted to others.

**Acceptance Scenarios**:

1. **Given** I am in a room with a set name "Alice" and slider at 75, **When** I reload the page, **Then** I should see "Alice" and 75 on my screen without manual intervention.
2. **Given** I have reloaded the page, **When** the connection is re-established, **Then** other participants should see "Alice" at 75 in their participant list.

---

### User Story 2 - Robust Mesh Reconnection (Priority: P2)

As a participant, I want the system to automatically attempt to reconnect with other peers if the P2P connection is temporarily lost, so that the synchronization remains "hardened" against transient network issues.

**Why this priority**: Medium. Ensures the "robustness" requested by the user.

**Independent Test**: Simulate a temporary network disconnection (e.g., toggling Airplane mode or disconnecting Wi-Fi), then reconnect and verify that slider updates resume automatically.

**Acceptance Scenarios**:

1. **Given** a lost connection to a peer, **When** the network is restored, **Then** the system should automatically re-establish the P2P link.
2. **Given** a re-established connection, **When** any participant moves their slider, **Then** the change should be reflected on all other participants' screens.

---

### User Story 3 - Conflict Resolution on Reconnect (Priority: P3)

As a participant reconnecting to a room, I want to receive the latest state from the "Host" or the majority of peers to ensure I am synchronized with the current room state.

**Why this priority**: Low. Ensures consistency after a long period of disconnection.

**Independent Test**: Disconnect a guest, have the host change the slider, reconnect the guest, and verify the guest's view updates to match the host.

**Acceptance Scenarios**:

1. **Given** I am a guest reconnecting after a period of absence, **When** I establish a connection to the host, **Then** my local state should be updated to match the host's current "truth" if applicable.

---

### Edge Cases

- **What happens when the Host reloads?**: The "Host" role should be persistent or transferable. If the host reloads, they should regain their host status based on their stored identity, and guests should automatically reconnect to the "new" instance of the host.
- **How does the system handle name conflicts on reload?**: If two people somehow end up with the same ID/Name after a reload, the system should prioritize the one already active or append a suffix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store the user's name, participant ID, and current slider value in browser session storage (`sessionStorage`) using the `shirokuro_` prefix for keys, ensuring data persists across reloads but is cleared when the tab/browser is closed.
- **FR-002**: System MUST automatically retrieve and apply stored session data from `sessionStorage` upon page load if the Room ID matches.
- **FR-003**: System MUST implement an automatic retry/reconnection logic for PeerJS connections when a disconnect event is detected.
- **FR-004**: System MUST ensure that when a participant reloads, they attempt to reuse their previous Peer ID to maintain consistency in other peers' participant lists.
- **FR-005**: System MUST broadcast the current state upon successful reconnection. If a guest modified their slider during a disconnection, this value MUST be sent to the host and broadcast to the room, taking priority over any prior host state.
- **FR-006**: System MUST handle the scenario where the "Host" reloads by having guests wait and continuously attempt reconnection to the original host's Peer ID. During this period, guests SHOULD show a "Reconnecting" status.
- **FR-007**: System MUST provide a subtle visual "Sync Status" indicator (e.g., a color-coded status dot: Green=Connected, Yellow=Reconnecting, Gray=Disconnected) displayed next to the participant's name in the participant list to inform the user of their current P2P connection state.

### Key Entities *(include if feature involves data)*

- **SessionState**: Represents the local persistence of a user's presence in a room (RoomID, PeerID, Name, SliderValue).
- **PeerMesh**: Represents the collection of P2P connections and the logic to maintain them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users are successfully re-synced to the room state within 3 seconds of a page reload.
- **SC-002**: 100% of participants retain their name and last slider position after a browser reload.
- **SC-003**: Synchronization is automatically restored in over 95% of transient network failure cases (less than 30 seconds of downtime) without user intervention.
- **SC-004**: No duplicate entries appear in the participant list when a single user reloads multiple times.
