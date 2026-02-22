---

description: "Task list for real-time slider synchronization in P2P rooms"
---

# Tasks: Real-time slider synchronization in P2P rooms

**Input**: Design documents from `/specs/001-realtime-slider-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/p2p-payloads.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Next.js (App Router) project with TypeScript at repository root
- [ ] T002 [P] Install dependencies: peerjs, lucide-react, clsx, tailwind-merge
- [ ] T003 [P] Initialize shadcn/ui and install Slider, Button, Input, and Card components
- [ ] T004 [CONSTITUTION] Verify zero-database, no-auth, and minimalist UI compliance in configuration

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for P2P communication and routing

- [ ] T005 [P] Implement URL utility for random room ID generation in src/lib/utils.ts
- [ ] T006 Implement base P2P connection logic (PeerJS initialization) in src/hooks/usePeer.ts
- [ ] T007 Implement mesh networking logic (lobby-anchor discovery) in src/hooks/usePeer.ts
- [ ] T008 [P] Define TypeScript interfaces for P2P payloads per contracts/p2p-payloads.md in src/lib/types.ts

## Phase 3: User Story 1 - Create and Share Room (Priority: P1) 🎯 MVP

**Goal**: Enable users to create a room and redirect to a unique URL.

**Independent Test**: Click "Create Group" on home, verify redirect to `/room/[id]`, and ensure another tab can open the same URL.

- [ ] T009 [US1] Implement Homepage with "Create Group" button in src/app/page.tsx
- [ ] T010 [US1] Setup dynamic route for room pages in src/app/room/[id]/page.tsx
- [ ] T011 [US1] Implement basic Room layout with ID display in src/app/room/[id]/page.tsx

**Checkpoint**: User Story 1 functional - Rooms can be created and shared via URL.

## Phase 4: User Story 2 - Real-time Slider Sync (Priority: P1) 🎯 MVP

**Goal**: Synchronize slider values across all connected peers.

**Independent Test**: Move slider in Tab A, verify value updates in Tab B's list.

- [ ] T012 [P] [US2] Create SliderComponent with 0-100 range in src/components/SliderComponent.tsx
- [ ] T013 [P] [US2] Create NameInput component for temporary display name in src/components/NameInput.tsx
- [ ] T014 [US2] Integrate usePeer hook with SliderComponent to broadcast SYNC_UPDATE in src/app/room/[id]/page.tsx
- [ ] T015 [US2] Implement message receiver for SYNC_UPDATE to update local participants state in src/hooks/usePeer.ts

**Checkpoint**: User Story 2 functional - Slider values synchronize in real-time between peers.

## Phase 5: User Story 3 - Participation Management (Priority: P2)

**Goal**: Display active participants and handle join/leave events.

**Independent Test**: Join with a third tab, verify all tabs see 3 users. Close a tab, verify others see it removed.

- [ ] T016 [P] [US3] Create ParticipantList component in src/components/ParticipantList.tsx
- [ ] T017 [US3] Implement INITIAL_PEER_LIST sync for new joiners in src/hooks/usePeer.ts
- [ ] T018 [US3] Handle WebRTC 'close' event to remove peers from state in src/hooks/usePeer.ts
- [ ] T019 [US3] Implement participant list display in src/app/room/[id]/page.tsx using ParticipantList component

**Checkpoint**: User Story 3 functional - Full participation list with real-time join/leave updates.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and deployment

- [ ] T020 [P] Add responsive styling and "Copy URL" utility for easier sharing
- [ ] T021 [P] Implement "Anonymous" default name logic per FR-004
- [ ] T022 [P] Configure Vercel deployment settings in vercel.json (if needed)
- [ ] T023 [P] Performance Verification: Connect with 3+ tabs and visually confirm sync latency is under 500ms (SC-003)
- [ ] T024 [P] Capacity Verification: Connect with 10 tabs and confirm stability without significant degradation (SC-004)
- [ ] T025 Run quickstart.md validation to ensure all SC-xxx criteria are met

## Dependencies & Execution Order

1. **Setup (Phase 1)** -> **Foundational (Phase 2)**
2. **Foundational (Phase 2)** -> **User Story 1 & 2 (P1)**
3. **User Story 1 & 2** are the MVP.
4. **User Story 3** depends on User Story 2's base P2P implementation.
5. **Polish** follows all functional stories.

## Parallel Opportunities

- T002, T003 (Dependencies/UI components)
- T005, T008 (Utils/Types)
- T012, T013 (UI Components for Story 2)
- T016 (UI Component for Story 3)
- T020, T021, T022 (Polish tasks)
