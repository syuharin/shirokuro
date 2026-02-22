# Feature Specification: Real-time slider synchronization in P2P rooms

**Feature Branch**: `001-realtime-slider-sync`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "ユーザーがトップページで「グループ作成」を押すと、ランダムな文字列のURL（例: /room/[id]）へ遷移する。 そのURLを共有された他ユーザー（最大10名程度）がアクセスすると、自動的に相互接続が開始される。 各ユーザーは自分の名前（一時的な表示名）を入力できるが、保存は不要。 0から100の範囲のスライダーを配置し、値を確定（ドラッグ終了）した瞬間に、接続中の全メンバーに数値をブロードキャストする。 画面には「自分」と「他の参加者」の数値がリアルタイムで一覧表示される。"

## Constitution Alignment *(mandatory)*

- **Zero Database Policy**: All session and grouping data is transient (P2P only) or derived from the URL. No database is used.
- **No User Management**: No login or registration required. Names are temporary for the current session.
- **Stateless Grouping**: Rooms are identified solely by the URL path (e.g., `/room/[id]`).
- **Real-time P2P**: Numeric synchronization is performed via WebRTC (using PeerJS).
- **Vercel Native**: Deployment is compatible with the Vercel Hobby plan (client-side focus).
- **Minimalist UI**: Interface is limited to a slider, name input, and a list of participants' values.

## Clarifications

### Session 2026-02-22
- Q: 重複する表示名の扱い → A: 重複を許容する（名前が同じでも別行として表示）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Share Room (Priority: P1)

As a primary user, I want to create a room and share the URL so that others can join me.

**Why this priority**: Essential for starting any collaborative session.

**Independent Test**: Can be tested by clicking "Create Group" on the homepage and verifying the URL change, then opening that URL in another tab.

**Acceptance Scenarios**:
1. **Given** the homepage is loaded, **When** the "Create Group" button is clicked, **Then** the user is redirected to a unique `/room/[id]` URL.
2. **Given** a room URL, **When** shared with another user, **Then** that user sees the same room interface.

---

### User Story 2 - Real-time Slider Sync (Priority: P1)

As a participant, I want my slider value to be shared with everyone in the room instantly.

**Why this priority**: Core functionality of the application.

**Independent Test**: Can be tested by opening two browser windows, moving the slider in one, and verifying the change appears in the other window's list.

**Acceptance Scenarios**:
1. **Given** two users are in the same room, **When** User A finishes moving their slider, **Then** User B's screen updates with User A's current value in the participant list.
2. **Given** a participant list, **When** a user changes their display name, **Then** other participants see the updated name next to that user's value.

---

### User Story 3 - Participation Management (Priority: P2)

As a user, I want to see who is currently in the room and what their current values are.

**Why this priority**: Provides the "social" context for the synchronization.

**Independent Test**: Verified by joining/leaving the room and checking the participant list.

**Acceptance Scenarios**:
1. **Given** a room with 3 participants, **When** User C joins, **Then** Users A and B see User C added to the list.
2. **Given** a room, **When** a user closes their tab, **Then** they are removed from the lists of remaining participants.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Create Group" button on the homepage.
- **FR-002**: System MUST generate a unique, random room ID for each group.
- **FR-003**: System MUST automatically establish P2P connections (PeerJS) between all users visiting the same room URL.
- **FR-004**: System MUST allow users to enter a temporary display name (defaulting to "Anonymous" if empty). Duplicate names MUST be permitted and displayed as distinct entries in the participant list.
- **FR-005**: System MUST provide a slider with a range of 0 to 100.
- **FR-006**: System MUST broadcast the slider's value to all connected peers upon `onMouseUp` or `onChange` (end of interaction).
- **FR-007**: System MUST display a real-time list of all connected participants showing their display name and current slider value.
- **FR-008**: System MUST NOT persist any room, user, or slider data on a server or database.

### Key Entities

- **Room**: Identified by a unique ID in the URL. Transient grouping of connected peers.
- **Peer/Participant**: A user connected to the room. Attributes: PeerID (WebRTC), Display Name (temporary), Slider Value (0-100).
- **Lobby-Anchor**: The first peer to join the room. Acts as a signaling assistant by distributing the list of existing PeerIDs to new joiners.

### Edge Cases

- **Lobby-Anchor Disconnection**: If the current Lobby-Anchor leaves, the next longest-connected peer automatically assumes the role (Mesh Migration) to ensure new joiners can still discover the mesh.
- **Connection Failure/Limit**: If WebRTC fails to establish or the 10-user limit is reached, the system MUST display a "Connection Error" or "Room Full" notification to the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of room creations result in a unique URL.
- **SC-002**: Participants can establish a P2P connection within 3 seconds of entering a valid room URL.
- **SC-003**: Slider values are updated on all connected peers' screens within 500ms of the broadcast event.
- **SC-004**: System handles up to 10 concurrent users in a single room without connection degradation.
- **SC-005**: Zero data remains on the server after all users leave a room.
