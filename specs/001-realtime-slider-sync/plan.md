# Implementation Plan: Visual position bar for participants

**Branch**: `001-realtime-slider-sync` | **Date**: 2026-02-22 | **Spec**: `/specs/001-realtime-slider-sync/spec.md`
**Input**: User description: "0から100の間でみんながどの位置にあるのか可視化したいです。バーを追加できますか？"

## Summary

The current implementation shows a participant list. This feature adds a visual horizontal bar (0-100 range) where markers representing each participant are displayed at their respective slider positions. This allows users to intuitively see the relative positioning of all members in the room at once.

## Technical Context

**Language/Version**: TypeScript / Next.js 16  
**Primary Dependencies**: React 19, PeerJS, Tailwind CSS 4, Lucide React  
**Storage**: N/A (In-memory P2P state)  
**Testing**: NEEDS CLARIFICATION (No test framework found in package.json)  
**Target Platform**: Vercel (Hobby plan)
**Project Type**: Web application  
**Performance Goals**: Real-time position updates (< 500ms broadcast delay)  
**Constraints**: Maximum 10 concurrent participants  
**Scale/Scope**: Small interactive component integration  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero Database Policy**: All state is local or P2P. (YES)
- [x] **No User Management**: Temporary display names only. (YES)
- [x] **Stateless Grouping**: Room ID in URL path. (YES)
- [x] **Real-time P2P**: PeerJS used for broadcast. (YES)
- [x] **Vercel Native**: Simple React components and P2P logic. (YES)
- [x] **Minimalist UI**: Adding a single visualization component. (YES)

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-slider-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── p2p-payloads.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   └── room/[id]/page.tsx
├── components/
│   ├── ParticipantPositionBar.tsx (NEW)
│   ├── SliderComponent.tsx
│   └── ParticipantList.tsx
├── hooks/
│   └── usePeer.ts
└── lib/
    ├── types.ts
    └── utils.ts
```

**Structure Decision**: Integration into existing Next.js app structure. Added `ParticipantPositionBar.tsx` for the shared visualization.


## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
