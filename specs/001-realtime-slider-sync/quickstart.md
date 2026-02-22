# Quickstart: 001-realtime-slider-sync

**Goal**: Establish a real-time slider sync room between two or more browser tabs.

## Prerequisites
- Node.js (v18+)
- Vercel CLI (optional for deployment)

## Setup
1. `npm install` (to install PeerJS, Next.js, and shadcn/ui).
2. `npm run dev` to start the local development server.

## Local Test Flow
1. Open `http://localhost:3000` in a browser.
2. Click **Create Group** to generate a unique Room ID (e.g., `/room/xyz`).
3. Copy the URL and open it in a **private window** or another browser.
4. Enter different **Names** in each window.
5. Move the **Slider** in one window and observe the value updating in the participant list of the other window upon releasing the mouse.

## Verification
- [ ] No database requests are visible in the Network tab.
- [ ] P2P connections are established (verify PeerJS console logs or data channel connectivity).
- [ ] All participants see all other participants' values correctly.
