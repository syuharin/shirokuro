# Tasks: QR Code Sharing Support

**Input**: Design documents from `/specs/001-realtime-slider-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Manual verification on desktop and mobile as specified in quickstart.md.

**Organization**: Tasks are grouped by user story. US1-US3 are completed foundational work; US4 is the current implementation target.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency management

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize Next.js 16 project with PeerJS and Tailwind CSS
- [x] T003 Install `react-qr-code` dependency for QR generation
- [x] T004 Install `@radix-ui/react-popover` for the share menu UI
- [x] T005 [CONSTITUTION] Verify zero-database and P2P sync compliance

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and PeerJS integration

- [x] T006 Implement base `usePeer` hook in `src/hooks/usePeer.ts`
- [x] T007 Create minimalist `Header` component in `src/components/Header.tsx`
- [x] T008 [P] Add Popover UI component in `src/components/ui/popover.tsx` using shadcn
- [x] T009 Implement distribution visualization in `src/components/ParticipantPositionBar.tsx`

---

## Phase 3: User Story 1 - Create and Share Room (Completed) ✅

**Goal**: Redirect to random URL and share with others.

- [x] T010 [US1] Implement room redirection in `src/app/page.tsx`
- [x] T011 [US1] Implement URL copy functionality in `src/components/Header.tsx`

---

## Phase 4: User Story 2 - Real-time Slider Sync (Completed) ✅

**Goal**: Synchronize 0-100 slider values across peers.

- [x] T012 [US2] Implement `SYNC_UPDATE` payload in `src/lib/types.ts`
- [x] T013 [US2] Connect slider `onValueCommit` to `usePeer` broadcast in `src/app/room/[id]/page.tsx`

---

## Phase 5: User Story 3 - Topic Synchronization (Completed) ✅

**Goal**: Synchronize topic and labels across peers.

- [x] T014 [US3] Implement `SYNC_TOPIC` payload in `src/hooks/usePeer.ts`
- [x] T015 [US3] Add topic editing UI in `src/app/room/[id]/page.tsx`

---

## Phase 6: User Story 4 - QR Code Sharing (Priority: P1) 🎯 Current Target

**Goal**: Allow users to share the room URL via a QR code in the header.

**Independent Test**: Open the room, click the QR code button, scan the code with a phone, and verify the phone joins the same room.

### Implementation for User Story 4

- [x] T016 [P] [US4] Update `src/components/Header.tsx` imports for `react-qr-code` and `Popover`.
- [x] T017 [US4] Implement the QR code rendering logic in `src/components/Header.tsx` using the current URL.
- [x] T018 [US4] Add the `QrCode` icon button next to the "Share" button in the `Header` layout.
- [x] T019 [US4] Wrap the QR code display in a `Popover` with a clean, white background and padding.
- [x] T020 [US4] Ensure the QR code dynamically updates if the URL changes (though roomId is static).

**Checkpoint**: User Story 4 is functional. QR code appears and is scannable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final UI refinements and documentation

- [x] T021 [P] Verify QR code contrast and scannability on small screens.
- [x] T022 Documentation: Update `specs/001-realtime-slider-sync/quickstart.md` with final verification steps.
- [x] T023 Code cleanup: Remove any unused imports in `Header.tsx` after implementation.
- [x] T024 [US4] Verify P2P connection (SC-002) and sync latency (SC-003) under 3s and 500ms respectively.
- [x] T025 Verify "Anchor Disconnection" edge case behavior as described in spec.md.
- [x] T026 [FIX] Implement full P2P mesh connection by having anchor broadcast new joiners.

---

## Dependencies & Execution Order

### Phase Dependencies

- **US4 (Phase 6)**: Depends on T003, T004 (Setup) and T008 (Foundational Popover).
- **Polish (Phase 7)**: Depends on Phase 6 completion.

### Parallel Opportunities

- T016 can be done while T008 is being set up.
- T021 (Verification) can be done in parallel with T022 (Documentation).

---

## Implementation Strategy

### Incremental Delivery

1. **Setup**: Install `react-qr-code` and `popover`.
2. **Foundational**: Add the Popover component to the UI library.
3. **Feature**: Integrate the QR code button into the Header.
4. **Validation**: Test with a real mobile device.
