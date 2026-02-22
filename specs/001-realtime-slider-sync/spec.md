# Feature Specification: Real-time slider synchronization in P2P rooms

**Feature Branch**: `001-realtime-slider-sync`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "ユーザーがトップページで「グループ作成」を押すと、ランダムな文字列のURL（例: /room/[id]）へ遷移する。 そのURLを共有された他ユーザー（最大10名程度）がアクセスすると、自動的に相互接続が開始される。 各ユーザーは自分の名前（一時的な表示名）を入力できるが、保存は不要。 0から100の範囲のスライダーを配置し、値を確定（ドラッグ終了）した瞬間に、接続中の全メンバーに数値をブロードキャストする。 画面には「自分」と「他の参加者」の数値がリアルタイムで一覧表示される。"
（追加要件：回答の「お題」とその両端のラベルをルーム内で同期・編集できるようにする）

## Constitution Alignment *(mandatory)*

- **Zero Database Policy**: All session and grouping data is transient (P2P only) or derived from the URL. No database is used.
- **No User Management**: No login or registration required. Names are temporary for the current session.
- **Stateless Grouping**: Rooms are identified solely by the URL path (e.g., `/room/[id]`).
- **Real-time P2P**: Numeric synchronization and room metadata (topic) are performed via WebRTC (using PeerJS).
- **Vercel Native**: Deployment is compatible with the Vercel Hobby plan (client-side focus).
- **Minimalist UI**: Interface is centered around a slider, topic card, and distribution visualization.

## Clarifications

### Session 2026-02-22
- Q: 重複する表示名の扱い → A: 重複を許容する（名前が同じでも別行として表示）
- Q: ルームの「お題」の初期化 → A: 最初の参加者（Anchor）が初期値を持ち、後続の参加者は参加時に同期される。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Share Room (Priority: P1)

As a primary user, I want to create a room and share the URL so that others can join me.

**Acceptance Scenarios**:
1. **Given** the homepage is loaded, **When** the "Create Group" button is clicked, **Then** the user is redirected to a unique `/room/[id]` URL.
2. **Given** a room URL, **When** shared with another user, **Then** that user sees the same room interface and connects automatically.

---

### User Story 2 - Real-time Slider Sync (Priority: P1)

As a participant, I want my slider value to be shared with everyone in the room instantly.

**Acceptance Scenarios**:
1. **Given** two users are in the same room, **When** User A finishes moving their slider, **Then** User B's screen updates with User A's current value in the participant list and the distribution map.
2. **Given** a participant list, **When** a user changes their display name, **Then** other participants see the updated name next to that user's value.

---

### User Story 3 - Topic Synchronization (Priority: P1)

As a room creator or participant, I want to set an "Topic" for the slider so everyone knows what we are answering.

**Acceptance Scenarios**:
1. **Given** a room, **When** a user edits the "Topic" or the "Min/Max Labels", **Then** the change is broadcasted and updated for all participants.
2. **Given** a new participant joins, **Then** they automatically receive the current topic and labels from existing peers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Create Group" button on the homepage.
- **FR-002**: System MUST generate a unique, random room ID for each group.
- **FR-003**: System MUST automatically establish P2P connections (PeerJS) between all users visiting the same room URL.
- **FR-004**: System MUST allow users to enter a temporary display name. Duplicate names MUST be permitted.
- **FR-005**: System MUST provide a slider (0-100) and a distribution map showing all participants' values.
- **FR-006**: System MUST broadcast the slider's value upon completion of interaction (`onValueCommit`).
- **FR-007**: System MUST allow editing and synchronizing a "Topic" string and two "Scale Labels" (for 0 and 100).
- **FR-008**: System MUST NOT persist any room, user, or slider data on a server or database.

### Key Entities

- **Room**: Identified by a unique ID. Contains a `topic` and scale labels (`labelMin`, `labelMax`).
- **Peer/Participant**: A user connected to the room. Attributes: `peerId`, `name`, `value`, `isSelf`.
- **Anchor**: The first peer to join (using a deterministic ID `shirokuro-anchor-[roomId]`). Facilitates initial discovery by sharing the peer list with new joiners.

### Edge Cases

- **Anchor Disconnection**: If the Anchor leaves, existing mesh connections remain. New joiners might fail to discover the mesh unless a new Anchor takes over (currently limited to one attempt at anchor role).
- **Name/Topic updates**: Handled via `SYNC_UPDATE` and `SYNC_TOPIC` payloads.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of room creations result in a unique URL.
- **SC-002**: Participants establish P2P connection within 3 seconds.
- **SC-003**: Slider values and topic updates appear on all screens within 500ms of broadcast.
- **SC-004**: Distribution map correctly handles marker collisions by offsetting vertically.
