# Implementation Plan: Automatic Host Migration

**Feature Branch**: `005-auto-host-migration`  
**Created**: 2026-03-15  
**Status**: Planning  
**Spec**: [specs/005-auto-host-migration/spec.md]

## Technical Context

- **Framework**: Next.js 16 (App Router) + React 19
- **Networking**: PeerJS (WebRTC) for P2P signaling and data transfer.
- **State Management**: React `useState` and `useRef` within the `usePeer` hook.
- **Role System**: Currently, the user-facing "Host" role is tied to the technical "Anchor" Peer ID `${PREFIX}anchor-${roomId}`.
- **Migration Logic**: Needs to be implemented in `usePeer.ts` to handle host departure and re-anchoring.

## Constitution Check

- [x] **Zero Database Policy**: No DB used. State is ephemeral and P2P.
- [x] **No User Management**: No logins. Join timestamps are used for role election.
- [x] **Stateless Grouping**: Room ID is sourced from URL.
- [x] **Real-time P2P**: WebRTC via PeerJS.
- [x] **Vercel Native**: No backend changes required.
- [x] **Minimalist UI**: Only role-related status indicators (e.g., "Host" label) and a notification (toast/banner).

## Implementation Phases

### Phase 0: Research (Completed)
- [x] Define migration protocol (3s Grace period, Election criteria).
- [x] Address edge cases (Simultaneous departure, Re-entry).
- [x] Verify state preservation requirements.

### Phase 1: Design & Infrastructure
- [x] Update `PeerState` and `P2PPayload` types to include `joinTimestamp`.
- [x] Update `usePeer.ts` state initialization to capture and persist `joinTimestamp`.
- [x] Define `HOST_MIGRATION` payload and its handling.

### Phase 2: Core Logic (usePeer.ts)
- [ ] Implement `checkHostDeparture` logic using `conn.on('close')`.
- [ ] Add `promotionTimer` with a 3-second grace period.
- [ ] Implement the `promoteToHost` function:
    - Destroys current Peer instance.
    - Re-initializes as Host (Anchor) with `${PREFIX}anchor-${roomId}`.
    - Preserves existing `topic`, `labelMin`, `labelMax`, and `value`.
- [ ] Update `handleData` to process `HOST_MIGRATION` signals.

### Phase 3: UI & Notifications
- [ ] Integrate a Toast or Banner notification when a user is promoted to Host.
- [ ] Update `ParticipantList` or similar components to reflect the current Host accurately.

### Phase 4: Verification
- [ ] Manual testing across two browser windows (following `quickstart.md`).
- [ ] Verify no "Split-brain" scenarios under high-latency simulations (if possible).
- [ ] Ensure state is correctly preserved after migration.
