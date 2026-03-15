# Tasks: Automatic Host Migration

**Input**: Design documents from `specs/005-auto-host-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/p2p-payloads.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update data structures and prepare for migration protocol

- [x] T001 Update `PeerState` and `SyncUpdatePayload` types to include `joinTimestamp` in `src/lib/types.ts`
- [x] T002 Define `HOST_MIGRATION` payload type in `src/lib/types.ts`
- [x] T003 [CONSTITUTION] Verify no external database or user management is introduced in `specs/005-auto-host-migration/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Capture and broadcast `joinTimestamp` for all participants

**⚠️ CRITICAL**: Must complete before host election logic can be implemented

- [x] T004 Initialize `joinTimestamp` in `myState` within `src/hooks/usePeer.ts` (using `Date.now()`)
- [x] T005 Update `updateMyState` and `broadcast` logic to include `joinTimestamp` in `src/hooks/usePeer.ts`
- [x] T006 Update `handleData` in `src/hooks/usePeer.ts` to store `joinTimestamp` for all participants
- [x] T007 [P] Update `ParticipantCard` to display "Host" badge if peer is anchor in `src/components/ParticipantList.tsx`

**Checkpoint**: Foundation ready - all peers now know each other's join order

---

## Phase 3: User Story 1 - Auto-Host on Direct Access (Priority: P1) 🎯 MVP

**Goal**: Automatically assign host role to the first participant in an empty room

**Independent Test**: Open a new room URL (e.g., `/room/test-123`). The user should immediately be marked as "Host".

### Implementation for User Story 1

- [x] T008 [US1] Update `usePeer.ts` initialization to ensure `joinTimestamp` is captured only once per session
- [x] T009 [US1] Refine `initPeer` logic in `src/hooks/usePeer.ts` to handle the transition from "trying to be anchor" to "becoming anchor" more reliably
- [x] T010 [US1] Implement check in `usePeer.ts` to verify if the participant is the *only* one in the room (fallback host assignment)

**Checkpoint**: User Story 1 functional - direct access correctly assigns the first host

---

## Phase 4: User Story 2 - Seamless Host Migration (Priority: P1)

**Goal**: Automatically promote a guest to host when the current host leaves

**Independent Test**: Connect Host A and Guest B. Close Host A. Guest B should become Host after 5-10 seconds.

### Implementation for User Story 2

- [x] T011 [US2] Implement `promotionTimerRef` and 3-second grace period logic in `src/hooks/usePeer.ts`
- [x] T012 [US2] Add listener for `close` event on anchor connection to trigger migration in `src/hooks/usePeer.ts`
- [x] T013 [US2] Implement `promoteToHost` function in `src/hooks/usePeer.ts` (destroy/re-init as anchor)
- [x] T014 [US2] Implement election logic in `src/hooks/usePeer.ts` (find peer with lowest `joinTimestamp`)
- [x] T015 [US2] Add `HOST_MIGRATION` broadcast when a new host successfully re-anchors in `src/hooks/usePeer.ts`
- [x] T016 [US2] Handle `HOST_MIGRATION` message in `handleData` to update local host tracking in `src/hooks/usePeer.ts`

**Checkpoint**: User Story 2 functional - host departure triggers automatic migration

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Visual feedback and final verification

- [x] T017 Create a simple `Toast` notification for host status changes in `src/components/ui/status-notification.tsx`
- [x] T018 Integrate `Toast` in `usePeer.ts` to notify user when promoted to host (FR-009)
- [x] T019 [P] Update `ParticipantList` styling to clearly distinguish the Host in `src/components/ParticipantList.tsx`
- [x] T020 [P] Run final verification following `specs/005-auto-host-migration/quickstart.md`
- [x] T021 [P] Ensure `joinTimestamp` is persistent across local page reloads for the same session in `src/lib/utils.ts`
- [x] T022 [US2] Implement notification for guests who are NOT promoted ("New host: [Name]") in `src/hooks/usePeer.ts` to fulfill FR-007

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent of US2
- **User Story 2 (P1)**: Depends on `joinTimestamp` from Foundation, but logic is independent of US1 success (though US1 is usually the trigger for a session)

### Parallel Opportunities

- T001 and T002 (Types) can be done in parallel
- T007 (UI badge) can be done in parallel with T004-T006
- T019 and T020 can be done in parallel at the end
- Phase 3 (US1) and Phase 4 (US2) can be worked on in parallel once Phase 2 is complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify direct room access works as expected

### Incremental Delivery

1. Foundation ready (T001-T007)
2. Add Auto-Host (T008-T010) → Test US1
3. Add Host Migration (T011-T016) → Test US2
4. Add Polish (T017-T021) → Final verification
