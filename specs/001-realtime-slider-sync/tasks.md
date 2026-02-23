# Tasks: Layout Refinement (Minimalist Integrated UI)

**Input**: Design documents from `/specs/001-realtime-slider-sync/`
**Prerequisites**: plan.md, spec.md, research.md, contracts/p2p-payloads.md

**Tests**: Manual multi-tab verification as described in `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify compliance and prepare environment.

- [X] T001 [CONSTITUTION] Verify zero-database and minimalist UI compliance in `src/`

---

## Phase 2: Foundational (Component Preparation)

**Purpose**: Create or refactor components needed for the new layout.

- [X] T002 [P] Refactor `NameInput.tsx` to support a compact, borderless style suitable for header usage in `src/components/NameInput.tsx`
- [X] T003 [P] Create a basic `Header.tsx` component. Must stack on mobile (Room ID / Name & Button) and spread on desktop (Row) in `src/components/Header.tsx`

---

## Phase 3: User Story 2 & 3 - Integrated Distribution UI 🎯 MVP

**Goal**: Eliminate heavy cards and focus the main area on Topic and Distribution.

**Independent Test**: Verify that the main content area shows the Topic and the Distribution Bar without any "Your Opinion" or "Everyone's Opinion" card borders.

### Implementation for US2/US3

- [X] T004 [US2] Update `ParticipantPositionBar` to display the current user's numeric value in the top-right of the container with a large font (e.g., text-5xl) in `src/components/ParticipantPositionBar.tsx`
- [X] T005 [US2] Remove "Your Opinion" (`Card`) and "Participants List" container from the main layout in `src/app/room/[id]/page.tsx`
- [X] T006 [US2] Integrate `InteractiveParticipantPositionBar` as a direct, full-width element in the content area of `src/app/room/[id]/page.tsx`
- [X] T007 [US3] Adjust `TopicCard` styling to ensure it acts as the primary header element within the content area in `src/app/room/[id]/page.tsx`

**Checkpoint**: Main layout is simplified. Distribution bar is now the primary interaction element.

---

## Phase 4: User Story 1 - Header & Identity Refinement

**Goal**: Move identity management and sharing tools to the header.

**Independent Test**: Verify the name can be edited in the header and the "Share URL" button works as expected.

### Implementation for US1

- [X] T008 [US1] Move `NameInput` and the "Share URL" button from the main body to the `Header` component in `src/components/Header.tsx`
- [X] T009 [US1] Add Room ID display and connection status (`Wifi` icon) to `src/components/Header.tsx`
- [X] T010 [US1] Integrate the `Header` component at the top of the page in `src/app/room/[id]/page.tsx`

**Checkpoint**: Identity and room tools are now consistently placed in the header.

---

## Phase 5: Polish & Final Validation

**Purpose**: Visual refinements and final compliance check.

- [X] T011 [P] Refine spacing and responsive behavior in `src/app/room/[id]/page.tsx`. Verify that vertical offset logic (SC-004) works correctly in the new layout.
- [X] T012 Run `quickstart.md` validation scenarios (Multi-tab P2P test)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start here.
- **Phase 2 (Foundational)**: Depends on Phase 1.
- **Phase 3 (Integrated UI)**: Depends on Phase 2. Can proceed independently of Phase 4.
- **Phase 4 (Header)**: Depends on Phase 2. Can proceed independently of Phase 3.
- **Phase 5 (Polish)**: Depends on Phase 3 and 4.

### Parallel Opportunities

- T002 and T003 (Foundational components) can be worked on in parallel.
- Phase 3 and Phase 4 can be implemented in parallel if the `Header` and `Main Content` areas are treated as separate sub-tasks.

---

## Implementation Strategy

### MVP First (Unified Workspace)

1. Complete Setup and Foundational components.
2. Refactor the `RoomPage` to remove cards and unify the distribution bar.
3. **VALIDATE**: Ensure the interactive slider still works and synchronizes correctly.

### Incremental Delivery

1. Foundation: Compact NameInput and Header shell.
2. Layout: Card removal and Bar integration.
3. Identity: Header integration and room tools move.
4. Polish: Mobile adjustments and final testing.
