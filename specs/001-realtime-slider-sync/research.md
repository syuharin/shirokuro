# Research: Slider Step Increment Change

## Problem Statement
The current slider allows for single-unit increments (0-100), but for some contexts, a broader, discrete step (like 5) provides better alignment and clearer choices.

## Findings

### 1. Radix UI Slider `step` Property
Radix UI's Slider primitive natively supports a `step` prop. Setting this to 5 will automatically snap the UI interaction to multiples of 5.

### 2. Broadcast Value Sync
While the UI snaps, we should ensure the broadcast payload (`SYNC_UPDATE`) sends the stepped value. Since the UI state is controlled by the slider, `onValueChange` and `onValueCommit` will already receive the snapped value.

### 3. Display Consistency
The `SliderComponent` (which shows the large numeric display) currently uses `Math.round(value)`. With a step of 5, it will display 0, 5, 10, etc., without further rounding logic needed, provided the incoming state is already snapped.

## Decisions

### Decision: Implement `step={5}` in `ParticipantPositionBar.tsx`
- Rationale: Direct manipulation of the slider should reflect the user's intent to use discrete steps.
- Alternatives: Manual snapping logic in the state update function was considered but rejected in favor of the native component property for better UX (UI feedback during drag).

### Decision: No server-side validation needed
- Rationale: Since the app is P2P and uses the Shirokuro Constitution (no DB/server state), client-side snapping is sufficient for the intended use case.

## Summary
The change is a targeted modification of the `step` prop in the `Radix Slider` primitive within the `ParticipantPositionBar` component.
