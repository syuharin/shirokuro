# Tasks: Real-time Slider Sync (5-Step Increment Refinement)

**Input**: Design documents from `/specs/001-realtime-slider-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Manual multi-tab verification as requested in research.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify compliance with project standards before modification.

- [X] T001 [CONSTITUTION] Verify zero-database and minimalist UI compliance in `src/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure data structures and types are prepared for the change.

- [X] T002 [P] Review `PeerState` and broadcast logic in `src/lib/types.ts` and `src/hooks/usePeer.ts` to ensure compatibility with discrete values

---

## Phase 3: User Story 2 - Real-time Slider Sync (Refinement) 🎯 MVP

**Goal**: Update the slider to move in increments of 5 for better alignment.

**Independent Test**: Drag the "Self" marker on the distribution bar. It should snap to 0, 5, 10, etc. Verify other tabs receive these exact values.

### Implementation for User Story 2

- [X] T003 [US2] Implement `step={5}` in the Radix Slider primitive within `src/components/ParticipantPositionBar.tsx`
- [X] T004 [P] [US2] Verify numeric display formatting in `src/components/SliderComponent.tsx` to handle stepped values
- [X] T005 [US2] Verify `updateMyState` in `src/app/room/[id]/page.tsx` correctly propagates the snapped values to the P2P hook

**Checkpoint**: Slider now snaps to 5-unit increments and syncs across peers.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [X] T006 [P] Update `docs/USER_MANUAL.md` to reflect the 5-step slider behavior
- [X] T007 Run `quickstart.md` validation scenarios (Multi-tab P2P test) and verify baseline functions (Topic sync, room creation) remain intact

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Story 2 (Phase 3)**: Depends on Phase 2 completion.
- **Polish (Final Phase)**: Depends on US2 completion.

### Parallel Opportunities

- T002 can be performed in parallel with Phase 1 checks.
- T004 (UI display check) can be performed in parallel with T003 (Slider implementation).

---

## Implementation Strategy

### MVP First (User Story 2 Refinement Only)

1. Complete Phase 1 and 2 to ensure environment is stable.
2. Apply the `step={5}` change to `ParticipantPositionBar.tsx`.
3. **VALIDATE**: Perform a multi-tab test immediately to ensure broadcast values are snapped.

### Incremental Delivery

1. Foundation check.
2. UI Step implementation.
3. Verification and Sync check.
