# Tasks: Host Migration Logic

**Input**: Design documents from `specs/004-host-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/p2p-payloads.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Update `src/lib/types.ts` with `HOST_MIGRATION` payload types and host roles
- [X] T002 [P] Configure Playwright for multi-browser P2P testing in `playwright.config.ts`
- [X] T003 [CONSTITUTION] Verify migration logic remains in-memory and database-free

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for participant tracking and role management

- [X] T004 Update `src/hooks/usePeer.ts` to maintain a synchronized, sorted list of online PeerIDs (FR-005)
- [X] T005 Add `hostRole` (Guest, Candidate, Acting Host, Anchor) state and refs to `src/hooks/usePeer.ts`
- [X] T006 Implement Heartbeat monitoring to prune stale participants from election list in `src/hooks/usePeer.ts`

**Checkpoint**: Foundation ready - election and migration logic can now be implemented

---

## Phase 3: User Story 1 & 2 - Host Election & Continuity (Priority: P1/P2) 🚀 MVP

**Goal**: Automatically elect a new coordinator when the anchor leaves to ensure session continuity

**Independent Test**: Connect 3 tabs. Close the host tab. Verify remaining tabs elect a winner and stay synced.

### Implementation for User Story 1 & 2

- [X] T007 [US1] Add disconnect/error listener for the Anchor connection in `src/hooks/usePeer.ts` (FR-001)
- [X] T008 [US2] Implement deterministic election utility using lexicographical PeerID sorting in `src/hooks/usePeer.ts` (FR-002)
- [X] T009 [US1] Implement `ELECTION_ANNOUNCEMENT` broadcast and conflict resolution logic in `src/hooks/usePeer.ts`
- [X] T010 [US1] Implement promotion logic from Candidate to Acting Host in `src/hooks/usePeer.ts` (FR-003)
- [X] T011 [US1] Update `src/app/room/[id]/page.tsx` to display the "Host changed" status banner (FR-006)

**Checkpoint**: User Story 1 & 2 functional - existing guests stay synced after host loss

---

## Phase 4: User Story 3 - New Participant Joinability (Priority: P3)

**Goal**: Allow new users to join the room after the original host has left by re-occupying the static ID 

**Independent Test**: Host leaves, Guest A becomes Acting Host. New user Joins room URL and connects to Guest A.

### Implementation for User Story 3

- [X] T012 [US3] Implement exponential backoff (5s, 10s...) for `anchor-ID` takeover attempts in `src/hooks/usePeer.ts` (FR-007)
- [X] T013 [US3] Implement Peer re-initialization logic to attempt occupying the static `anchor-ID` in `src/hooks/usePeer.ts` (FR-004)
- [X] T014 [US3] Broadcast `HOST_TAKEOVER_SUCCESS` to all peers once the static ID is successfully reclaimed in `src/hooks/usePeer.ts`
**Checkpoint**: All user stories complete - room is fully migratable and joinable

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and documentation

- [X] T015 [P] Update `docs/USER_MANUAL.md` with host migration behavior notes
- [X] T016 Run validation scenarios defined in `specs/004-host-migration/quickstart.md`
- [X] T017 Final verification of constitution compliance in `src/hooks/usePeer.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** & **Foundational (Phase 2)**: MUST be completed first.
- **User Story 1 & 2 (Phase 3)**: Depends on Foundational phase.
- **User Story 3 (Phase 4)**: Depends on User Story 1 & 2 completion.
- **Polish (Phase 5)**: Final step.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- Documentation (T015) can run in parallel with implementation.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Setup and Foundational phases.
2. Implement US1 & US2 to ensure existing users don't lose connection when the host leaves.
3. **VALIDATE**: Verify session continuity in a 3-peer mesh.

### Incremental Delivery

1. Add US3 (Joinability) after continuity is stable.
2. This ensures that even if the "takeover" takes 30 seconds, existing users are unaffected.
