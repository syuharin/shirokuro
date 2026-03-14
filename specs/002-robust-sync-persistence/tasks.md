# Tasks: Robust Synchronization and Reload Persistence

**Input**: Design documents from `/specs/002-robust-sync-persistence/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify project structure and PeerJS configuration in `package.json`
- [X] T002 [CONSTITUTION] Verify zero-database and minimalist UI compliance in current codebase

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for persistence and state tracking

- [X] T003 Update `PeerState` type to include `status` field (`'online' | 'reconnecting' | 'offline'`) in `src/lib/types.ts`
- [X] T004 Implement `sessionStorage` helper functions for room-specific persistence in `src/lib/utils.ts`

## Phase 3: User Story 1 - Seamless Reload Persistence (Priority: P1) 🎯 MVP

**Goal**: Identity (name, ID) and slider value remembered on reload via `sessionStorage`.

**Independent Test**: Join a room, set name to "Alice", move slider to 75, reload browser, and verify name and slider are restored.

### Implementation for User Story 1

- [X] T005 [P] [US1] Update `usePeer` hook to load initial name and value from `sessionStorage` on mount in `src/hooks/usePeer.ts`
- [X] T006 [P] [US1] Implement persistence logic in `usePeer` to sync name and slider changes to `sessionStorage` in `src/hooks/usePeer.ts`
- [X] T007 [US1] Modify Peer initialization to attempt reusing the `peerId` stored in `sessionStorage` in `src/hooks/usePeer.ts`
- [X] T008 [US1] Ensure `SliderComponent` correctly reflects the initial state received from the `usePeer` hook in `src/components/SliderComponent.tsx`

**Checkpoint**: User Story 1 is functional - reload persistence works independently.

---

## Phase 4: User Story 2 - Robust Mesh Reconnection (Priority: P2)

**Goal**: Auto-reconnect on transient network loss with visual status feedback.

**Independent Test**: Simulate network loss (Airplane mode), reconnect, and verify that the status dot changes and sync resumes.

### Implementation for User Story 2

- [X] T009 [P] [US2] Implement `peer.on('disconnected')` retry logic to reconnect to signaling server in `src/hooks/usePeer.ts`
- [X] T010 [P] [US2] Implement reconnection logic for `DataConnection` objects to heal the P2P mesh in `src/hooks/usePeer.ts`
- [X] T011 [US2] Create a status indicator component (color-coded dot) in `src/components/ui/status-dot.tsx`
- [X] T012 [US2] Integrate the status indicator next to each participant's name in `src/components/ParticipantList.tsx`

**Checkpoint**: User Story 2 is functional - mesh heals automatically and status is visible.

---

## Phase 5: User Story 3 - Conflict Resolution on Reconnect (Priority: P3)

**Goal**: Ensure the guest's latest operation takes priority upon reconnection to the host.

**Independent Test**: Disconnect a guest, have the host change the slider, change the guest's slider locally, reconnect guest, and verify the guest's value is broadcast to everyone.

### Implementation for User Story 3

- [X] T013 [P] [US3] Update `usePeer` to send an immediate `SYNC_UPDATE` with the latest local state upon successful reconnection in `src/hooks/usePeer.ts`
- [X] T014 [US3] Update Anchor logic to handle state updates from returning peers, ensuring duplicate entries are removed (SC-004), and broadcast to the room in `src/hooks/usePeer.ts`

**Checkpoint**: All user stories functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [X] T015 Run all validation scenarios defined in `quickstart.md`
- [X] T016 [P] Update `docs/USER_MANUAL.md` to mention reload persistence and status indicator
- [X] T017 Final code cleanup and removal of any redundant reload-handling logic
- [X] T018 [CONSTITUTION] Re-verify that all changes adhere to Zero Database and Minimalist UI policies

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **User Stories (Phases 3-5)**: All depend on Foundational (Phase 2).
  - US1 (Phase 3) is the MVP and should be completed first.
  - US2 (Phase 4) and US3 (Phase 5) can potentially run in parallel after US1.
- **Polish (Phase 6)**: Depends on all user stories.

### Parallel Execution Examples

- **Foundational**: T003 and T004 can be implemented in parallel.
- **User Story 1**: T005 and T006 can be worked on simultaneously.
- **User Story 2**: T009 and T010 (logic) can be parallelized with T011 and T012 (UI).

---

## Implementation Strategy

1. **MVP (US1)**: Focus on `sessionStorage` and Peer ID reuse. This provides the most immediate value for the "reload" requirement.
2. **Robustness (US2)**: Add the reconnection logic and the visual status dot to fulfill the "hardened" requirement.
3. **Consistency (US3)**: Implement the broadcast-on-reconnect logic to ensure all peers stay in sync after disconnections.
4. **Validation**: Use multiple browser tabs and network throttling to verify the success criteria (SC-001 to SC-004).
