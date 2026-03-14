# Tasks: Layout and Contrast Refinement

**Feature**: Layout and Contrast Refinement
**Plan**: [plan.md](./plan.md)
**Branch**: `003-layout-refinement`

## Implementation Strategy

We will implement the UI refinements in priority order, starting with label readability and slider contrast, then moving to mobile button responsiveness. Each user story will be verified independently using mobile emulation in Chrome DevTools.

## Phase 1: Setup
*Initial environment verification.*

- [x] T001 Verify project runs locally with `npm run dev` and navigate to a test room

## Phase 2: Foundational
*Shared styles or configurations.*

- [x] T002 Confirm Tailwind 4 configuration is active and functional in `package.json`

## Phase 3: User Story 1 - Improved Label Readability (Priority: P1)
*Goal: Increase scale and category label sizes for better mobile legibility.*
*Independent Test: Verify labels are 14px and readable on mobile emulation.*

- [x] T003 [US1] Increase bottom scale numbers (0, 50, 100) font size in `src/components/ParticipantPositionBar.tsx`
- [x] T004 [US1] Increase category labels (`labelMin`, `labelMax`) font size and contrast in `src/components/ParticipantPositionBar.tsx`
- [x] T005 [US1] Adjust layout spacing to prevent label overlap for long text in `src/components/ParticipantPositionBar.tsx`

## Phase 4: User Story 2 - High Contrast Slider (Priority: P1)
*Goal: Improve visibility of the slider track axis.*
*Independent Test: Verify dark gray track is clearly visible against light background.*

- [x] T006 [US2] Update slider track color to dark gray (neutral-500) in `src/components/ParticipantPositionBar.tsx`
- [x] T007 [US2] Ensure the visual anchor dot contrast matches the new track style in `src/components/ParticipantPositionBar.tsx`

## Phase 5: User Story 3 - Mobile-Optimized Action Buttons (Priority: P2)
*Goal: Ensure action buttons stack or wrap correctly on narrow mobile screens.*
*Independent Test: Verify no horizontal overflow on 320px width for both Header and Topic Edit form.*

- [x] T008 [P] [US3] Update Header button group to stack vertically on small screens in `src/components/Header.tsx`
- [x] T009 [P] [US3] Update Topic Edit form action buttons (決定/Cancel) to stack vertically on small screens in `src/app/room/[id]/page.tsx`
- [x] T010 [US3] Implement text wrapping for the primary "決定して全員に同期" (Sync) button in `src/app/room/[id]/page.tsx`

## Phase 6: Polish & Cross-cutting
*Final checks and refinement.*

- [x] T011 Perform final visual audit and verify smooth slider interaction (no lag) on multiple mobile device presets (iPhone SE, Pixel 7) in Chrome DevTools
- [x] T012 Verify consistent spacing across all refined components

## Dependencies

- User Story 1 and 2 are independent.
- User Story 3 is independent but involves multiple files.
- All stories depend on Setup (Phase 1).

## Parallel Execution Examples

- **Story 3 Implementation**: T008 and T009 can be implemented in parallel as they touch different files.
- **Visual Audit**: T011 can begin as soon as any single story is complete.
