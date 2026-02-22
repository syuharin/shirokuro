---

description: "Task list for real-time slider synchronization and visualization in P2P rooms"
---

# Tasks: Real-time slider synchronization and visualization

**Input**: Design documents from `/specs/001-realtime-slider-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/p2p-payloads.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js (App Router) project with TypeScript at repository root
- [x] T002 [P] Install dependencies: peerjs, lucide-react, clsx, tailwind-merge
- [x] T003 [P] Initialize shadcn/ui and install Slider, Button, Input, and Card components
- [x] T004 [CONSTITUTION] Verify zero-database, no-auth, and minimalist UI compliance in configuration

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for P2P communication and routing

- [x] T005 [P] Implement URL utility for random room ID generation in src/lib/utils.ts
- [x] T006 Implement base P2P connection logic (PeerJS initialization) in src/hooks/usePeer.ts
- [x] T007 Implement mesh networking logic (lobby-anchor discovery) in src/hooks/usePeer.ts
- [x] T008 [P] Define TypeScript interfaces for P2P payloads per contracts/p2p-payloads.md in src/lib/types.ts

## Phase 3: User Story 1 - Create and Share Room (Priority: P1) 🎯 MVP

**Goal**: Enable users to create a room and redirect to a unique URL.

**Independent Test**: Click "Create Group" on home, verify redirect to `/room/[id]`, and ensure another tab can open the same URL.

- [x] T009 [US1] Implement Homepage with "Create Group" button in src/app/page.tsx
- [x] T010 [US1] Setup dynamic route for room pages in src/app/room/[id]/page.tsx
- [x] T011 [US1] Implement basic Room layout with ID display in src/app/room/[id]/page.tsx

**Checkpoint**: User Story 1 functional - Rooms can be created and shared via URL.

## Phase 4: User Story 2 - Real-time Slider Sync (Priority: P1) 🎯 MVP

**Goal**: Synchronize slider values across all connected peers.

**Independent Test**: Move slider in Tab A, verify value updates in Tab B's list.

- [x] T012 [P] [US2] Create SliderComponent with 0-100 range in src/components/SliderComponent.tsx
- [x] T013 [P] [US2] Create NameInput component for temporary display name in src/components/NameInput.tsx
- [x] T014 [US2] Integrate usePeer hook with SliderComponent to broadcast SYNC_UPDATE in src/app/room/[id]/page.tsx
- [x] T015 [US2] Implement message receiver for SYNC_UPDATE to update local participants state in src/hooks/usePeer.ts

**Checkpoint**: User Story 2 functional - Slider values synchronize in real-time between peers.

## Phase 5: User Story 3 - Participation Management (Priority: P2)

**Goal**: Display active participants and handle join/leave events.

**Independent Test**: Join with a third tab, verify all tabs see 3 users. Close a tab, verify others see it removed.

- [x] T016 [P] [US3] Create ParticipantList component in src/components/ParticipantList.tsx
- [x] T017 [US3] Implement INITIAL_PEER_LIST sync for new joiners in src/hooks/usePeer.ts
- [x] T018 [US3] Handle WebRTC 'close' event to remove peers from state in src/hooks/usePeer.ts
- [x] T019 [US3] Implement participant list display in src/app/room/[id]/page.tsx using ParticipantList component

**Checkpoint**: User Story 3 functional - Full participation list with real-time join/leave updates.

## Phase 6: User Story 4 - Visual Position Bar (Priority: P1) 🎯 NEW

**Goal**: Provide a shared horizontal bar where markers for all participants are displayed at their respective slider positions.

**Independent Test**: Open multiple tabs on the same room URL, move the slider in one tab, and verify that the corresponding marker in the `ParticipantPositionBar` updates in all tabs instantly.

### Implementation for User Story 4

- [x] T026 [P] [US4] Create `ParticipantPositionBar.tsx` skeleton in src/components/ParticipantPositionBar.tsx
- [x] T027 [US4] Implement marker rendering logic with absolute positioning based on `value` in src/components/ParticipantPositionBar.tsx
- [x] T028 [US4] Add participant names and values on hover for markers in src/components/ParticipantPositionBar.tsx
- [x] T029 [US4] Integrate `ParticipantPositionBar` above the `SliderComponent` in src/app/room/[id]/page.tsx
- [x] T030 [US4] Implement marker collision handling (slight vertical offset) in src/components/ParticipantPositionBar.tsx

**Checkpoint**: User Story 4 functional - All participants' relative positions are visually represented on a single axis.

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and deployment

- [x] T020 [P] Add responsive styling and "Copy URL" utility for easier sharing
- [x] T021 [P] Implement "Anonymous" default name logic per FR-004
- [x] T022 [P] Configure Vercel deployment settings in vercel.json (if needed)
- [x] T023 [P] Performance Verification: Connect with 3+ tabs and visually confirm sync latency is under 500ms (SC-003)
- [x] T024 [P] Capacity Verification: Connect with 10 tabs and confirm stability without significant degradation (SC-004)
- [x] T031 Refine marker styling and animations in src/components/ParticipantPositionBar.tsx
- [x] T032 Run quickstart.md validation for the new visualization component
- [x] T033 Optimize synchronization frequency: Switch to commitment-based P2P broadcast for slider (T014 refinement)

---

## Dependencies & Execution Order

1. **Foundational (Phase 2)** -> **User Story 4 (P1)**: The bar visualization depends on the existing P2P state (`participants` and `myState`).
2. **User Story 4** can be implemented after Phase 5 is complete.
3. **Polish (Phase 7)**: T031 and T032 follow the implementation of User Story 4.

## Parallel Opportunities

- T026 (UI component skeleton) can start independently of integration tasks.
- T031 (Styling) can be worked on as soon as T027 is done.

---

## Parallel Example: User Story 4

```bash
# Start the component development
Task: "Create ParticipantPositionBar.tsx skeleton in src/components/ParticipantPositionBar.tsx"
```

## Implementation Strategy

### Incremental Delivery (Visual Bar)

1. **Skeleton First**: Create the bar track and a static marker.
2. **Dynamic Mapping**: Connect to `myState` and `participants` to move markers dynamically.
3. **Integration**: Add to the room page to verify real-time updates.
4. **Collision Handling**: Ensure multiple markers at the same position remain visible.
5. **Final Polish**: Add hover names and smooth transitions.
