# Implementation Plan: Real-time slider synchronization in P2P rooms

**Branch**: `001-realtime-slider-sync` | **Date**: 2026-02-22 | **Spec**: [specs/001-realtime-slider-sync/spec.md]
**Input**: Feature specification from `/specs/001-realtime-slider-sync/spec.md`

## Summary
Implement a database-less real-time synchronization tool where users in a room can share 0-100 slider values. The technical approach uses **Next.js (App Router)** for the frontend/hosting on **Vercel** and **PeerJS** for full-mesh WebRTC connectivity.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 14+, PeerJS (for WebRTC), Tailwind CSS, shadcn/ui (Radix UI)  
**Storage**: N/A (Zero Database Policy)  
**Testing**: Vitest / Playwright (Simulating multiple browser tabs)  
**Target Platform**: Vercel (Hobby Plan)
**Project Type**: Web Application  
**Performance Goals**: <500ms sync latency  
**Constraints**: Zero DB, 10 max users, P2P only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero Database Policy**: All data is transient (P2P only) or derived from the URL. (PASS)
- [x] **No User Management**: No login or registration. (PASS)
- [x] **Stateless Grouping**: Room ID in URL is the only grouping key. (PASS)
- [x] **Real-time P2P**: PeerJS/WebRTC used for all data sync. (PASS)
- [x] **Vercel Native**: Fits in Vercel Hobby plan. (PASS)
- [x] **Minimalist UI**: 0-100 slider + list only. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-slider-sync/
├── plan.md              # This file
├── research.md          # P2P Mesh Logic Research
├── data-model.md        # Peer/Room In-memory Model
├── quickstart.md        # Local testing guide
├── contracts/
│   └── p2p-payloads.md  # JSON message structure
└── tasks.md             # (Created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                 # Next.js App Router
│   ├── page.tsx         # Homepage (Create Group)
│   └── room/[id]/       # Room Page (Slider + List)
├── components/          # UI Components (shadcn/ui)
├── hooks/               # useP2P hook (PeerJS logic)
└── lib/                 # Utility functions
```

**Structure Decision**: Single Next.js project.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
