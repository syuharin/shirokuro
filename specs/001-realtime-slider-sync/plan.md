# Implementation Plan: Layout Refinement (Minimalist Integrated UI)

**Branch**: `001-realtime-slider-sync` | **Date**: 2026-02-23 | **Spec**: `/specs/001-realtime-slider-sync/spec.md`

## Summary

Refine the application layout to move away from heavy "Your Opinion" and "Everyone's Opinion" cards. The goal is to focus the UI on the Topic and the Interactive Distribution Bar. The display name input will be moved from the main content area to a more appropriate location (e.g., Header or a small Floating Action Button/Popover).

## Technical Context

**Language/Version**: TypeScript / Next.js 16+ (App Router)
**Primary Dependencies**: React 19, Tailwind CSS, Radix UI (Slider, Popover/Dialog), PeerJS
**Storage**: N/A (Stateless P2P)
**Testing**: Manual / E2E (Multi-tab)
**Target Platform**: Vercel
**Project Type**: Web Application
**Performance Goals**: Instant UI response
**Constraints**: Keep minimalist aesthetic (Shirokuro Constitution)
**Scale/Scope**: Refactoring `RoomPage` and extracting components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero Database Policy**: Are we using *any* external/internal DB? (NO)
- [x] **No User Management**: Are there logins or sessions? (NO)
- [x] **Stateless Grouping**: Is state stored on the server for groups? (NO)
- [x] **Real-time P2P**: Is PeerJS/WebRTC the primary sync method? (YES)
- [x] **Vercel Native**: Does this fit in the Vercel Hobby plan? (YES)
- [x] **Minimalist UI**: Is the UI simple (0-100 slider + list)? (YES)

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-slider-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           
│   └── p2p-payloads.md  # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   └── room/
│       └── [id]/
│           └── page.tsx        # TARGET: Main layout refactor
├── components/
│   ├── Header.tsx              # NEW: Move name input here
│   ├── ParticipantPositionBar.tsx # REFINEMENT: Integrate numeric displays?
│   ├── ParticipantList.tsx     # REFINEMENT: Smaller, compact list?
│   └── NameInput.tsx           # REFINEMENT: Style for header usage
└── lib/
    └── types.ts                # PeerState
```

**Structure Decision**: Extract a `Header` component to host metadata and user settings (name). Simplify the `RoomPage` to focus on the Topic and Distribution Bar.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (None)    |            |                                     |
