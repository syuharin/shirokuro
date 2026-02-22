# Research: Participant Position Bar

## Decision: Horizontal Position Bar with Overlaid Markers

### Rationale
A horizontal bar mapping 0-100 to the screen width is the most direct representation of the slider value. Overlaying markers for each participant allows for immediate visual comparison of all users in the room.

### Alternatives Considered
1. **Vertical Bar Chart**: Good for comparing exact values, but takes up more vertical space and is less intuitive for a 0-100 "spectrum".
2. **Individual Progress Bars**: Redundant since we already have the numeric list. Doesn't help with "where everyone is relative to each other" as much as a shared axis.

## Technical Details

### UI Implementation
- **Container**: A full-width horizontal track (Tailwind: `relative h-12 w-full bg-neutral-100 rounded-full overflow-hidden`).
- **Markers**: 
  - Absolute positioned elements: `left: [value]%`.
  - Content: Small circle with initials or the first letter of the name.
  - Hover: Show full name and value.
  - Collision handling: If multiple users have the same value, stack them vertically or offset slightly (for up to 10 users, slight vertical offset or simple stacking is fine).

### Color Logic
- Use the same color scale as the `ParticipantList` for consistency:
  - High (>= 80): Emerald
  - Low (<= 20): Red
  - Mid: Neutral/Gray

### State Management
- The component will consume `myState` and `participants` array from the parent (same as `ParticipantList`).
- Updates are reactive to the `SYNC_UPDATE` events already handled by `usePeer`.

## Testing Gaps
- **Observation**: No testing framework currently configured in `package.json`.
- **Recommendation**: Integrate **Vitest** for unit testing the positioning logic and **Playwright** for E2E testing of the P2P synchronization.
- **Task**: For this feature, we will focus on the component implementation but document the need for a test runner.

## Dependencies
- No new dependencies required. Standard React and Tailwind CSS will suffice.
