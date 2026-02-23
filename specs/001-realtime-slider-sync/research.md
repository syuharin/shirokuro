# Research: QR Code Sharing for Shirokuro

## Decision: QR Code Library
- **Choice**: `react-qr-code`
- **Rationale**: 
  - Lightweight, SVG-based (better for performance and crispness).
  - Simple API, well-maintained.
  - Compatible with React 19 and Next.js 16.
- **Alternatives Considered**: 
  - `next-qrcode`: More features but `react-qr-code` is sufficient for a simple QR code.
  - `qrcode.react`: Common, but `react-qr-code` is generally preferred for its SVG output simplicity.

## Decision: UI/UX Integration
- **Approach**: Add a "QR Code" button in the `Header.tsx` component.
- **UI Element**: Use a `Popover` from `@radix-ui/react-popover` (available via shadcn) to show the QR code when the button is clicked.
- **Rationale**: 
  - Keeps the header clean.
  - Provides a quick way to show/hide the code without navigating away.
  - Consistent with the minimalist UI principle of the Constitution.

## Decision: Technology/Patterns
- **Client-side Component**: The QR code component must be a 'use client' component (which the Header already is).
- **Dynamic Import**: Not strictly necessary but can be used if bundle size is an issue.
- **Library availability**: Must be installed via `npm install react-qr-code`.

## Research Tasks (Complete)
- [x] Identify best QR code library for React 19/Next 16.
- [x] Check compatibility with project constitution (Zero DB, Vercel Native).
- [x] Determine UI placement in existing room header.
