# Implementation Plan: Host Migration Logic

**Branch**: `004-host-migration` | **Date**: 2026-03-14 | **Spec**: [specs/004-host-migration/spec.md](spec.md)
**Input**: Feature specification from `/specs/004-host-migration/spec.md`

## Summary
Implement a decentralized host election and migration system for Shirokuro rooms. When the primary coordinator (Anchor) leaves, guests will automatically elect a new "Acting Host" using lexicographical PeerID sorting. The Acting Host will then attempt to re-occupy the static `anchor-ID` using exponential backoff to ensure session continuity and joinability for new participants.

## Technical Context

**Language/Version**: TypeScript / Next.js 16+ (App Router) + React 19
**Primary Dependencies**: PeerJS, Lucide React, Shadcn/UI (Tailwind CSS)
**Storage**: N/A (Transient P2P only)
**Testing**: Playwright (for multi-browser P2P automation)
**Target Platform**: Vercel Hobby (Serverless)
**Project Type**: P2P Web Application
**Performance Goals**: Host handover under 5s, new joiner connectivity restored under 30s.
**Constraints**: Zero-database, PeerJS signaling server ID release timeout.
**Scale/Scope**: 2-10 concurrent peers per room.

## Constitution Check

- [x] **Zero Database Policy**: Migration is entirely in-memory.
- [x] **No User Management**: No login/account logic added.
- [x] **Stateless Grouping**: Room ID remains the same in URL.
- [x] **Real-time P2P**: Uses PeerJS/WebRTC events.
- [x] **Vercel Native**: No backend changes.
- [x] **Minimalist UI**: Only status banners added to existing UI.

## Project Structure

### Documentation (this feature)

```text
specs/004-host-migration/
├── plan.md              # This file
├── research.md          # Election algorithm and PeerJS timeout research
├── data-model.md        # Host role state machine
├── quickstart.md        # Multi-tab manual test instructions
└── contracts/
    └── p2p-payloads.md  # Host migration event schema
```

### Source Code (repository root)

```text
src/
├── app/
│   └── room/
│       └── [id]/
│           └── page.tsx  # Update to display host migration status
├── hooks/
│   └── usePeer.ts        # Main logic for election and ID takeover
└── lib/
    └── types.ts          # Update with new payload types
```

**Structure Decision**: Updated existing P2P logic in `src/hooks/usePeer.ts` and enhanced the room UI in `src/app/room/[id]/page.tsx`.

## Complexity Tracking

*No Constitution Check violations.*
