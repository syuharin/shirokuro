# Shirokuro

Shirokuro is a minimalist real-time data sync tool that operates entirely without a database. It uses P2P (Peer-to-Peer) communication to synchronize values between participants in a room.

## Key Features

- **Zero Database**: No data is stored on any server or database.
- **No User Management**: No login or signup required.
- **Real-time P2P**: Synchronization via WebRTC (PeerJS).
- **Vercel Native**: Optimized for Vercel Hobby plan.

## Documentation

- **[Shirokuro Constitution](.specify/memory/constitution.md)**: The non-negotiable architectural principles of the project.
- **[User Manual](docs/USER_MANUAL.md)**: How to use the application.
- **[Technical Implementation Plan](specs/001-realtime-slider-sync/plan.md)**: Details on the P2P mesh logic and architecture.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **P2P Communication**: PeerJS
- **Styling**: Tailwind CSS & shadcn/ui
- **Hosting**: Vercel

---

**Shirokuro** - *Minimalist real-time sync powered by PeerJS & Next.js.*
