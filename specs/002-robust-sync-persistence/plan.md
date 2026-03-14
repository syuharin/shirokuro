# Implementation Plan: Robust Synchronization and Reload Persistence

**Branch**: `002-robust-sync-persistence` | **Date**: 2026-03-14 | **Spec**: [specs/002-robust-sync-persistence/spec.md](specs/002-robust-sync-persistence/spec.md)
**Input**: Feature specification from `/specs/002-robust-sync-persistence/spec.md`

## Summary

This feature hardens the P2P synchronization in Shirokuro by implementing session-based persistence and robust reconnection logic. Users will retain their identity (name, ID) and slider value across browser reloads within the same session. The P2P mesh will automatically attempt to heal after transient disconnections, with a clear visual indicator for synchronization status.

## Technical Context

**Language/Version**: TypeScript / Next.js 15+ (App Router), React 19  
**Primary Dependencies**: PeerJS, Lucide React (for status icons), Radix UI (Slider)  
**Storage**: `sessionStorage` (Browser-native) for ephemeral session persistence  
**Testing**: Manual P2P mesh testing (multiple tabs), Network throttle/disconnect simulation  
**Target Platform**: Vercel (Next.js App Router)
**Project Type**: Web application (Real-time P2P)  
**Performance Goals**: Re-sync within < 3 seconds of reload  
**Constraints**: Zero Database Policy (no server-side persistence), PeerJS signaling limits  
**Scale/Scope**: Small groups (2-10 users) per room

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero Database Policy**: Persistence is strictly client-side via `sessionStorage`.
- [x] **No User Management**: No logins; identity is transient and stored in the browser session.
- [x] **Stateless Grouping**: Grouping remains defined by the Room ID in the URL.
- [x] **Real-time P2P**: PeerJS/WebRTC remains the core synchronization engine.
- [x] **Vercel Native**: Fits within Vercel Hobby limits.
- [x] **Minimalist UI**: UI additions are limited to a small status indicator.

## Project Structure

### Documentation (this feature)

```text
specs/002-robust-sync-persistence/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   └── room/
│       └── [id]/
│           └── page.tsx # Room entry point
├── components/
│   ├── ParticipantList.tsx     # Add status indicator
│   └── SliderComponent.tsx    # Handle persisted state
├── hooks/
│   └── usePeer.ts             # Core logic for persistence and reconnection
├── lib/
│   ├── types.ts               # New types for sync status and persistence
│   └── utils.ts               # Storage helper functions
```

**Structure Decision**: Single project structure (Next.js) as it encompasses both UI and P2P logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
