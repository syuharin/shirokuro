# Quickstart: Real-time Slider Sync

## 🚀 Overview
The application is a pure P2P real-time slider sync platform. Users can create a room, share the URL, and interact on a distribution bar where their position is visible to everyone instantly.

## 🛠 Prerequisites
- **Node.js**: 18.x or later
- **Package Manager**: npm or yarn
- **PeerJS Server**: Default (Public)

## 📦 Installation
```bash
npm install
```

## 🏃 Local Development
```bash
npm run dev
```
Open `http://localhost:3000`.

## 🧪 P2P Testing (Simulating Multiple Users)
To test P2P locally:
1. Open the app in two different browser windows or incognito mode.
2. In Window A, click "Create Group" (or similar URL `/room/[id]`).
3. Copy the URL from Window A and paste it into Window B.
4. Name both users and observe real-time marker updates on the `InteractiveParticipantPositionBar`.
5. **Slider Step**: Note that the slider now moves in increments of 5 (e.g., 0, 5, 10, ...). Verify that both windows show the same stepped value.

## 📱 QR Code Sharing Testing
To verify the QR code:
1.  Open the room page (`/room/[id]`).
2.  Click the QR code icon next to the Share button in the Header.
3.  Ensure the QR code popover appears with the current URL encoded.
4.  **Device Sync**: Use a mobile device to scan the code from your screen. Verify that the mobile browser opens the correct room and connects successfully.

## ⚡ Performance Verification (SC-002, SC-003)
To verify performance requirements:
1.  **Connection Latency (SC-002)**: Check the browser console. The message "Joined as Peer" or "I am the Anchor" should appear within 3 seconds of page load.
2.  **Sync Latency (SC-003)**: Moving the slider in one window should reflect in other windows almost instantly. Visual sync should occur within 500ms.

## 🔗 Edge Case: Anchor Disconnection
To verify room resilience:
1.  Open Window A (Anchor) and Window B (Peer).
2.  Close Window A.
3.  In Window B, verify that the Anchor's marker disappears from the list.
4.  Open Window C (New Peer). Window C will attempt to become the new Anchor. If successful, Window B and Window C will connect.

## 📁 Key File Locations
- **P2P Logic**: `src/hooks/usePeer.ts`
- **Main Interaction Bar**: `src/components/ParticipantPositionBar.tsx`
- **Room Entry Point**: `src/app/room/[id]/page.tsx`
