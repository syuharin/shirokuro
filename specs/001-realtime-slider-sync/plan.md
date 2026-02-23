# Implementation Plan: QR Code Sharing Support

**Branch**: `001-realtime-slider-sync` | **Date**: 2026-02-23 | **Spec**: `/specs/001-realtime-slider-sync/spec.md`
**Input**: Feature specification update (FR-009) to allow sharing via QR code.

## Summary
Add a QR code generation feature to the room header, allowing users to share the room URL via a mobile device or by showing their screen. This will be implemented using `react-qr-code` and displayed within a Radix UI Popover for a minimalist and non-intrusive experience.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16.
**Primary Dependencies**: `react-qr-code`, `peerjs`, `lucide-react`, `radix-ui`.
**Storage**: N/A (Zero Database Policy).
**Testing**: Manual P2P verification and visual check of QR code validity.
**Target Platform**: Vercel (Hobby).
**Project Type**: Web Application.
**Performance Goals**: Instant QR code rendering on the client side.
**Constraints**: Must work without server-side generation to adhere to the Stateless principle.
**Scale/Scope**: Single component addition (`Header.tsx`) and one new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Zero Database Policy**: Are we using *any* external/internal DB? (NO)
- [x] **No User Management**: Are there logins or sessions? (NO)
- [x] **Stateless Grouping**: Is state stored on the server for groups? (NO)
- [x] **Real-time P2P**: Is PeerJS/WebRTC the primary sync method? (YES - for slider sync; QR code is for sharing the key)
- [x] **Vercel Native**: Does this fit in the Vercel Hobby plan? (YES)
- [x] **Minimalist UI**: Is the UI simple (0-100 slider + list)? (YES - adding one QR button)

## Project Structure

### Documentation (this feature)

```text
specs/001-realtime-slider-sync/
├── plan.md              # This file
├── research.md          # QR library choice and UI approach
├── data-model.md        # No changes required for QR code
├── quickstart.md        # Added QR testing section
├── contracts/           # No changes
└── tasks.md             # To be generated
```

### Source Code (repository root)

```text
src/
├── app/
│   └── room/
│       └── [id]/
│           └── page.tsx
├── components/
│   ├── Header.tsx       # Main target: add QR code button
│   └── ui/
│       ├── popover.tsx  # New shadcn component (to be added)
│       └── ...
└── lib/
    └── utils.ts
```

**Structure Decision**: Single project structure (Next.js App Router). We will integrate the QR code button directly into the existing `Header` component.

## Complexity Tracking

*No constitution violations.*
