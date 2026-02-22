# Research: P2P Mesh Network Management without DB

**Feature**: Real-time slider synchronization (001-realtime-slider-sync)
**Date**: 2026-02-22

## Problem Statement
How to manage participant presence and synchronize slider values in a room without a central database, using only P2P (PeerJS/WebRTC).

## Findings

### 1. Mesh Topology vs. Star Topology
- **Mesh Topology (Full-mesh)**: Every peer connects to every other peer.
- **Star Topology**: One peer acts as a "host/broker".
- **Decision**: **Full-mesh topology**.
- **Rationale**: Since the maximum number of participants is small (10), a full-mesh is viable and avoids a single point of failure (if the "host" leaves). Each peer is responsible for maintaining its own list of connected peers.

### 2. Peer Discovery via PeerJS
- **Logic**: 
  - Room ID is used as a prefix or metadata for PeerJS ID.
  - However, PeerJS doesn't natively support "rooms" without a server-side list.
  - **Workaround**: We will use the PeerJS `listAllPeers()` (if using a custom server) OR, more reliably for Vercel/Public PeerJS, we will implement a "Joiner" logic where new peers attempt to connect to a known "discovery" ID or we rely on the fact that the first person to create the room becomes the initial anchor.
  - **Refined Strategy**: Use a naming convention for PeerJS IDs: `shirokuro-[roomId]-[short-uuid]`. 
  - To "discover" others without a DB, we'll need a way to know who is there. 
  - **Best Practice for Serverless/DB-less**: Use PeerJS with a specific `roomId` prefix. Since PeerJS doesn't support glob searching for IDs easily, the first peer creates the "Room" and subsequent peers connect to it. To make it truly P2P mesh:
    1. Peer A (Creator) generates ID `shirokuro-[roomId]-A`.
    2. Peer B (Joiner) generates ID `shirokuro-[roomId]-B`.
    3. Peer B needs to find Peer A. Since we have no DB, Peer B will try to connect to a predictable "Host" ID first (e.g., `shirokuro-[roomId]-host`) OR we use a simple Signaling fallback.
    4. **Actual Decision**: We will use **PeerJS Server's `listAllPeers` capability** (if available) or simply have the "Creator" take a fixed ID `shirokuro-[roomId]-lobby` to act as the initial entry point. Once connected to the lobby, the lobby peer shares the list of all other Peer IDs in the mesh.

### 3. State Management (Presence)
- **Logic**: 
  - Each peer maintains a local `participants` map: `{ peerId: { name, value, lastSeen } }`.
  - When a new peer joins the "lobby", they receive the current mesh member list.
  - They then initiate P2P connections to *all* members.
  - "Heartbeat" is handled by the WebRTC data channel's `on('close')` event.

### 4. Slider Sync Logic
- **Event**: `onMouseUp` or `onChange` (debounced).
- **Payload**: `{ type: 'UPDATE_VALUE', peerId: '...', value: 85, name: '...' }`.
- **Broadcast**: The local peer iterates through all open `DataConnection` objects and sends the JSON payload.

## Alternatives Considered
- **Signaling Server with Socket.io**: Rejected. Violates "Vercel Native" and "Zero DB" (requires persistent server process).
- **Ably/Pusher**: Rejected. Adds external managed service dependency that might exceed free tier.

## Decision Summary
Use PeerJS with a "Lobby-Anchor" pattern for initial discovery, then transition to a full-mesh WebRTC network for data broadcasting. All state is local to the client's React state.
