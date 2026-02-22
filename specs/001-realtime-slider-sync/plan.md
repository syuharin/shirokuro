# Implementation Plan: Real-time slider synchronization in P2P rooms

**Branch**: `001-realtime-slider-sync` | **Date**: 2026-02-22 | **Spec**: [specs/001-realtime-slider-sync/spec.md]

## Summary
Implement a serverless real-time synchronization application using PeerJS for P2P communication. The application allows users to join a room via URL, share their display name, and synchronize a slider value (0-100) across all participants. It includes a "Topic" system to define the context of the slider.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 (App Router)  
**Primary Dependencies**: PeerJS, Lucide React, Shadcn/UI (Tailwind CSS)  
**Storage**: N/A (Transient P2P only)  
**Testing**: Vitest (Recommended for logic), Playwright (Recommended for E2E)  
**Target Platform**: Vercel (Hobby Plan)
**Project Type**: Web Application (Client-side focus)  
**Performance Goals**: <500ms sync latency, up to 10 concurrent users.  
**Constraints**: No server-side persistence, WebRTC-based connectivity.  
**Scale/Scope**: Small-scale collaborative tool.

## Constitution Check

- [x] **Zero Database Policy**: No database used. (YES)
- [x] **No User Management**: No logins or persistent sessions. (YES)
- [x] **Stateless Grouping**: Grouping is handled by room IDs in the URL. (YES)
- [x] **Real-time P2P**: PeerJS used for WebRTC sync. (YES)
- [x] **Vercel Native**: Fully client-side logic compatible with Vercel. (YES)
- [x] **Minimalist UI**: Clean, focus-driven UI. (YES)

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-slider-sync/
├── spec.md              # Feature Specification
├── plan.md              # This file
├── research.md          # Technical decisions
├── data-model.md        # State and component models
├── quickstart.md        # Implementation steps
├── contracts/           # P2P Payload definitions
└── checklists/          # Requirements validation
```

### Source Code

```text
src/
├── app/
│   ├── page.tsx               # Homepage (Create Group)
│   └── room/[id]/page.tsx     # Room Page (Main UI)
├── components/
│   ├── NameInput.tsx          # Name editor
│   ├── ParticipantList.tsx    # Numeric list of participants
│   ├── ParticipantPositionBar.tsx # Visual distribution map
│   ├── SliderComponent.tsx    # Slider input
│   └── ui/                    # Shadcn base components
├── hooks/
│   └── usePeer.ts             # Core P2P orchestration hook
├── lib/
│   ├── types.ts               # Shared TypeScript types
│   └── utils.ts               # Utility functions (Room ID gen)
```

## Complexity Tracking

*No violations to track.*
