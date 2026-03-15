# Feature Specification: Automatic Host Migration

**Feature Branch**: `005-auto-host-migration`  
**Created**: 2026-03-15  
**Status**: Ready for Planning  
**Input**: User description: "仕様変更として「直接/room/[id]にアクセスした際にホストがいなければ自分がホストになる」としたいです。ホスト、ゲストが両方いる場合にホストがいなくなるとゲストの誰かがホストになるようにしたいです。"

## Clarifications

### Session 2026-03-15
- Q: ホスト移行時、スライダーの値はどう扱うべきか？ → A: 前のホストの値を引き継ぐ
- Q: ホストに昇格した際、ユーザーにどのように通知すべきか？ → A: バナーまたはトーストを表示する（「あなたがホストになりました」など）

## Constitution Alignment *(mandatory)*

- **Zero Database Policy**: Confirmed. Host status is managed via P2P state and initial room discovery.
- **No User Management**: Confirmed. Participants are identified by transient names and Peer IDs.
- **Stateless Grouping**: Confirmed. Room assignment is handled via `/room/[id]` path parameters.
- **Real-time P2P**: Confirmed. Numeric sync is via PeerJS/WebRTC.
- **Vercel Native**: Confirmed. No backend services required beyond PeerJS signaling.
- **Minimalist UI**: Confirmed. Host status is reflected in the existing participant list and UI indicators.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Host on Direct Access (Priority: P1)

A user navigates directly to a room URL. If no other active participants (specifically a host) are found, the user automatically assumes the host role.

**Why this priority**: Essential for room creation and ensuring that every room session starts with a valid host.

**Independent Test**: Can be tested by opening a new, unique room URL. The user should immediately see themselves marked as "Host".

**Acceptance Scenarios**:

1. **Given** a room ID that has no active participants, **When** a user navigates to `/room/[id]`, **Then** the user becomes the host.
2. **Given** a room that already has a host, **When** a new user joins, **Then** the new user joins as a guest.

---

### User Story 2 - Seamless Host Migration (Priority: P1)

When the current host leaves the room (e.g., closes the tab, disconnects), one of the remaining guests is automatically promoted to the host role.

**Why this priority**: Crucial for session continuity. Without a host, certain room functions (like anchor-based syncing) might fail.

**Independent Test**: Connect two users (A as host, B as guest). Close User A's tab. User B should automatically be promoted to host.

**Acceptance Scenarios**:

1. **Given** a room with one host (A) and one guest (B), **When** User A leaves, **Then** User B becomes the host and receives a visual notification (banner/toast).
2. **Given** a room with one host and multiple guests, **When** the host leaves, **Then** the guest who has been in the room longest (Oldest Guest) is promoted to host.
3. **Given** a host migration occurs, **When** the new host takes over, **Then** the room's slider value remains identical to the last value set by the previous host.

---

### Edge Cases

- **Simultaneous Departure**: If the host and all but one guest leave nearly simultaneously, the remaining guest must still become the host.
- **Host Reconnection**: If a former host reconnects after a migration has occurred, they should join as a guest to avoid "split-brain" (multiple host) scenarios.
- **Network Fluctuation**: Temporary disconnections should not immediately trigger migration if the host can reconnect within a short grace period (e.g., 5 seconds).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect the presence of an active host upon a user's entry into a room.
- **FR-002**: System MUST assign the Host role to the participant who enters an empty room.
- **FR-003**: System MUST monitor the connection status of the current host.
- **FR-004**: System MUST trigger a host election/promotion process when the host's connection is lost.
- **FR-005**: System MUST ensure that a guest is promoted to host within 5 seconds of disconnection detection (3s grace + 2s processing).
- **FR-006**: System MUST guarantee that only one participant holds the Host role at any time (Mutual Exclusion).
- **FR-007**: System MUST notify all participants when a host migration occurs.
- **FR-008**: System MUST preserve the shared synchronization state (e.g., slider value) during role transition.
- **FR-009**: System MUST display a clear visual indicator (banner or toast) to the participant who has been promoted to host.

### Key Entities *(include if feature involves data)*

- **Participant**: A user in the room. Attributes: `peerId`, `name`, `role` (Host/Guest), `joinTimestamp`.
- **Room State**: The collective state of the room, including the current `hostId`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of rooms accessed directly without a host correctly assign the host role to the first joiner.
- **SC-002**: Host migration completes in under 8 seconds from the moment of disconnection.
- **SC-003**: Zero instances of rooms having multiple concurrent hosts after migration stabilizes.
- **SC-004**: Zero "abandoned" rooms (rooms with participants but no host) for more than 10 seconds.
