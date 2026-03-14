# Feature Specification: Host Migration Logic

**Feature Branch**: `004-host-migration`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "現在接続状況やリロード、ホストがいなくなる等でホストのデバイスが変わることはありませんが、そのような状況になった際はゲストの誰かがホストになるようにしたいです。"

## Clarifications

### Session 2026-03-14
- Q: 代理ホストの選出ルールはどうしますか？ → A: Option A (PeerIDの辞書順で最小のIDを持つ人を選出する)
- Q: 移行期間中のステータス表示はどうしますか？ → A: Option A (「ホストが交代しました。新しい参加者を待機中です」などのステータスを表示し、操作は許可する)
- Q: 固定ID（anchor-ID）再取得の試行間隔はどうしますか？ → A: Option A (指数バックオフ 5s, 10s, 20s...)

## Constitution Alignment *(mandatory)*


- **Zero Database Policy**: Confirmed. Migration logic is handled entirely in-memory via P2P state and PeerJS events.
- **No User Management**: Confirmed. Election is based on PeerIDs or connection order, not user accounts.
- **Stateless Grouping**: Confirmed. Room ID remains the same in the URL.
- **Real-time P2P**: Confirmed. Election and role transfer happen over existing PeerJS connections.
- **Vercel Native**: Confirmed. No backend changes required.
- **Minimalist UI**: Confirmed. No complex UI added; only logic for host handover.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless Session Continuity (Priority: P1)

As a participant in a room, I want the session to continue even if the original host leaves or reloads, so that we don't have to recreate the room and everyone can stay synced.

**Why this priority**: Essential for a robust P2P experience. Losing the host shouldn't kill the session.

**Independent Test**: Connect three peers. Disconnect the host. Verify that the remaining two peers can still see each other's slider movements.

**Acceptance Scenarios**:

1. **Given** a room with 1 host and 2 guests, **When** the host closes their browser, **Then** one of the guests is promoted to "Acting Host" and the session remains active for the remaining guest.
2. **Given** a room where the original host has left, **When** a guest changes their slider value, **Then** all other remaining guests receive the update.

---

### User Story 2 - Automatic Host Election (Priority: P2)

As a guest in a room, I want the system to automatically pick a new host when the old one is gone, so that there is always someone responsible for coordinating new connections.

**Why this priority**: Ensures that the room remains "joinable" even after the original creator leaves.

**Independent Test**: Disconnect the host. Wait for the election period. Check if a remaining peer has assumed the coordination role.

**Acceptance Scenarios**:

1. **Given** the host disconnects, **When** the election logic completes, **Then** exactly one guest is identified as the new coordinator based on a deterministic rule (e.g., oldest connection or sorted PeerID).

---

### User Story 3 - New Participant Joinability (Priority: P3)

As a new user, I want to be able to join a room even if the original creator is no longer there, by connecting to whoever is currently acting as the host.

**Why this priority**: Crucial for long-lived rooms where the creator might not stay until the end.

**Independent Test**: Host leaves, Guest A becomes Acting Host. New user Joins. Verify New user connects to Guest A and Guest B.

**Acceptance Scenarios**:

1. **Given** a room with an Acting Host (original host gone), **When** a new user joins via the room URL, **Then** they successfully connect to the Acting Host once the Acting Host has successfully re-occupied the static `anchor-ID`.
2. **Given** the `anchor-ID` is temporarily unavailable due to the previous host's disconnect timeout, **When** the Acting Host's periodic retry succeeds, **Then** the room becomes "joinable" for new participants again.

---

### Edge Cases

- **Concurrent Handover**: What happens if two guests think they are both the new host? (Deterministic election rule should prevent this).
- **Original Host Returns**: If the original host reloads and tries to reclaim the static anchor-ID, how does it interact with the Acting Host?
- **Network Partition**: What if a group of guests is split from the host but can see each other?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect the loss of the Anchor (Host) connection via `peer.on('close')` or `peer.on('error')`.
- FR-002: System MUST implement a deterministic "Election Rule" to select a new coordinator among active peers by lexicographical sorting all current PeerIDs and selecting the smallest ID. Must broadcast `ELECTION_ANNOUNCEMENT` to signal candidacy.
- **FR-003**: The newly elected Host MUST attempt to assume the "Anchor" responsibilities (managing the peer mesh for newcomers).
- FR-004: System MUST allow the new host to attempt to re-occupy the static `anchor-ID` (`shirokuro-anchor-[roomId]`) if it becomes available. Must broadcast `HOST_TAKEOVER_SUCCESS` upon successful re-occupation.
- **FR-005**: All participants MUST maintain a synchronized list of all PeerIDs currently in the room to facilitate election.
- FR-006: System MUST display a subtle status notification (as a toast or a status bar message in the Header) while the Acting Host attempts takeover, but MUST NOT block slider interaction.
- **FR-007**: The Acting Host MUST use an exponential backoff strategy (starting at 5s) for re-occupying the static `anchor-ID` to minimize signaling server load.

### Key Entities

- **Anchor (Host)**: The primary coordinator using the static ID.
- **Acting Host**: A guest promoted to coordination duties when the Anchor is unavailable.
- **Peer List**: A local registry in each client of all connected participants, used for the election algorithm.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Host handover completes in under 5 seconds after connection loss is detected.
- **SC-002**: 100% of remaining participants stay connected to each other after host migration.
- SC-003: New users can join the room within 30 seconds of the original host leaving (allowing for PeerJS ID release timeout).
- **SC-004**: No data (slider values, topic) is lost during the migration process as long as at least one guest was synced.

## Assumptions & Dependencies

- **PeerJS ID Release**: We assume the PeerJS signaling server will release the `anchor-ID` within a reasonable timeframe after a hard disconnect.
- **Mesh Connectivity**: We assume that even if the anchor leaves, existing guests already have direct connections to each other (full mesh), allowing them to continue syncing and negotiate the new host.
