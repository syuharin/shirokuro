# Tasks: Real-time Slider Sync (Interactive Distribution Bar)

**Input**: Design documents from `/specs/001-realtime-slider-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/p2p-payloads.md

**Tests**: P2P interaction tests are recommended via manual multi-tab testing as described in `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [X] T001 [CONSTITUTION] Verify zero-database, no-auth, and minimalist UI compliance in current implementation
- [X] T002 [P] Verify `src/components/ui/slider.tsx` exists and is based on Radix UI Slider
- [X] T003 [P] Create a backup of `src/components/ParticipantPositionBar.tsx` for reference during refactoring

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and layout adjustments for the unified bar

- [X] T004 [P] Ensure `src/lib/types.ts` contains `PeerState` and `RoomState` as defined in `data-model.md`
- [X] T005 [P] Update `src/components/ui/slider.tsx` to export sub-components (Track, Range, Thumb) if needed for custom layout
- [X] T006 [P] Prepare the layout in `src/app/room/[id]/page.tsx` by expanding the distribution bar container height to `h-48` for better visibility.

---

## Phase 3: User Story 2 - Real-time Slider Sync (Priority: P1) 🎯 MVP

**Goal**: Integrate the user's slider directly into the distribution bar for direct manipulation.

**Independent Test**: Drag the "Self" marker on the distribution bar and verify it updates the numeric display and broadcasts to other tabs.

### Implementation for User Story 2

- [X] T007 [US2] Update `ParticipantPositionBar` props to accept `value`, `onChange`, and `onCommit` in `src/components/ParticipantPositionBar.tsx`
- [X] T008 [US2] Refactor `ParticipantMarker` component to be used as a child of `SliderPrimitive.Thumb` in `src/components/ParticipantPositionBar.tsx`
- [X] T009 [US2] Implement the `Radix Slider` structure within `ParticipantPositionBar` track in `src/components/ParticipantPositionBar.tsx`
- [X] T010 [US2] Bind the `isSelf` marker to the `Slider.Thumb` while maintaining its `verticalOffset` logic in `src/components/ParticipantPositionBar.tsx`
- [X] T011 [US2] Update `src/app/room/[id]/page.tsx` to pass `myState.value` and `updateMyState` callbacks to `ParticipantPositionBar`
- [X] T012 [US2] Refactor `src/components/SliderComponent.tsx` to remove the redundant slider track, keeping only the large numeric display
- [X] T013 [US2] Hide/Remove the duplicate slider control from the "My Controls" card in `src/app/room/[id]/page.tsx`
- [X] T024 [US2] SC-004の検証：3人以上のユーザーが同じ値（例：全員50）に設定した場合に、垂直オフセットが正しく働き、名前バッジが重ならずに一覧できることを確認する。

**Checkpoint**: User Story 2 is functional. Direct manipulation of markers on the bar is possible and syncs.

---

## Phase 4: User Story 1 - Create and Share Room (Priority: P1)

**Goal**: Ensure room creation and sharing flow is consistent with the new UI.

**Independent Test**: Create a room, share the URL, and join from another tab. Verify both tabs see the interactive bar.

### Implementation for User Story 1

- [X] T014 [US1] Verify "Create Group" button on homepage correctly redirects to the room with the new UI layout
- [X] T015 [P] [US1] Ensure `copyUrl` functionality in `src/app/room/[id]/page.tsx` remains accessible and visible

---

## Phase 5: User Story 3 - Topic Synchronization (Priority: P1)

**Goal**: Synchronize topic and labels, and display them on the interactive bar.

**Independent Test**: Change the "Topic" or "Scale Labels" and verify they update on the distribution bar for all participants.

### Implementation for User Story 3

- [X] T016 [US3] Update `ParticipantPositionBar` to display `labelMin` and `labelMax` at the ends of the bar in `src/components/ParticipantPositionBar.tsx`
- [X] T017 [US3] Ensure topic updates from `TopicCard` correctly refresh the labels on the `ParticipantPositionBar` via props in `src/app/room/[id]/page.tsx`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual improvements and validation

- [X] T018 [P] Enhance marker transition animations in `src/components/ParticipantPositionBar.tsx` using `transition: all 300ms ease-out` for smooth sliding.
- [X] T019 [P] Optimize marker collision logic in `src/components/ParticipantPositionBar.tsx` ensuring at least `20px` vertical gap between overlapping badges.
- [X] T020 [P] Test touch target sizes for the "Self" marker on mobile resolutions
- [X] T021 Run `quickstart.md` validation scenarios to ensure 100% feature compliance
- [X] T022 [US1] SC-002の検証：2つのタブでルームを開き、P2P接続が3秒以内に確立されることを確認する。
- [X] T023 [US2] SC-003の検証：スライダーを動かした際、他方の画面に500ms以内で数値が反映されることを確認する。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phases 1-2)**: MUST be completed first to prepare the components.
- **User Story 2 (Phase 3)**: The primary implementation of the requested feature.
- **User Story 1 & 3 (Phases 4-5)**: Can be verified/refined in parallel once Story 2 is stable.
- **Polish (Phase 6)**: Final refinement.

### Parallel Opportunities

- T002, T003, T004, T005, T006 can all be prepared in parallel.
- Once the main refactor (T007-T010) is done, UI adjustments (T012, T013) and secondary story checks (T014-T017) can be parallelized.

---

## Implementation Strategy

### MVP First (Integrated Slider)

1. Complete Setup and Foundational tasks.
2. Focus on `src/components/ParticipantPositionBar.tsx` refactor to make it interactive.
3. Update `src/app/room/[id]/page.tsx` to connect the P2P state to the new interactive bar.
4. **VALIDATE**: Open two tabs, drag the marker in one, and see it move in the other.

### Incremental Delivery

1. **Iteration 1**: Interactive Bar working (replacing the old bar functionality).
2. **Iteration 2**: Remove redundant separate slider, clean up "My Controls" area.
3. **Iteration 3**: Label sync and visual polish.

---

## Notes

- **Collision Logic**: Ensure that making the marker a `Slider.Thumb` doesn't break the `verticalOffset` calculation. The `Thumb` is absolutely positioned by Radix, but we can apply `marginTop` or a nested transform for the vertical offset.
- **Touch Support**: Radix UI Slider provides excellent touch support, which should be preserved.
