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

## 📁 Key File Locations
- **P2P Logic**: `src/hooks/usePeer.ts`
- **Main Interaction Bar**: `src/components/ParticipantPositionBar.tsx`
- **Room Entry Point**: `src/app/room/[id]/page.tsx`
