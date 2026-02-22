# Quickstart: Implementing Slider Sync

## Steps to Implement

1. **Setup PeerJS**:
   - Install `peerjs`.
   - Create the `usePeer` hook (`src/hooks/usePeer.ts`) to manage WebRTC connections.

2. **Core Components**:
   - `NameInput.tsx`: Input field for the display name.
   - `SliderComponent.tsx`: Shadcn/UI-based slider (0-100).
   - `ParticipantList.tsx`: Numeric list of participants and their values.
   - `ParticipantPositionBar.tsx`: Visual distribution map with collision handling.

3. **Room Page Implementation**:
   - Path: `src/app/room/[id]/page.tsx`.
   - Use the `usePeer` hook to synchronize state.
   - Handle "Topic" editing and synchronization.

4. **Home Page Implementation**:
   - Path: `src/app/page.tsx`.
   - Add a "Create Group" button that redirects to a random `/room/[id]`.

## How to Test

1. **Simulate multiple users**:
   - Open the application in two or more browser tabs or different browsers (Chrome/Firefox).
   - Use the same room URL (e.g., `http://localhost:3000/room/abcd-1234`).
2. **Verify Name and Slider Sync**:
   - Change the name in one tab; it should update on others.
   - Adjust the slider and release; the value should update on others.
3. **Verify Topic Sync**:
   - Click "Edit Topic" and change the title and labels.
   - Save and verify all tabs show the new topic and labels.
4. **Verify Distribution Map**:
   - Adjust multiple sliders to the same value and see markers stack vertically.
