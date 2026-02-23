# Research: Layout Refinement & Name Input Placement

## Problem Statement
The current UI has large cards for "Your Opinion" and "Everyone's Opinion," which feel bulky and redundant since the interactive slider is already part of the distribution bar. The name input is also tied to one of these large cards.

## Findings

### 1. Name Input Placement
- **Decision**: Move the name input to the **Header**.
- **Rationale**: The display name is a "session identity" rather than "data input" related to the current topic. Placing it in the header follows common patterns for collaborative tools (e.g., Figma, Google Docs avatars).
- **Implementation**: Use a small, editable name badge in the header or a simple input field next to the "Share URL" button.

### 2. Streamlining "Your Opinion"
- **Decision**: Remove the "Your Opinion" card.
- **Rationale**: The slider is already in the distribution bar. The large numeric display (currently in `SliderComponent`) can be integrated into the distribution bar's header or as a floating overlay near the "Self" marker.
- **Alternative**: Keep a very minimal "Current Value" display somewhere on the page, but not as a large card.

### 3. Streamlining "Everyone's Opinion"
- **Decision**: Remove the separate "Participants List" card.
- **Rationale**: The distribution bar already shows everyone's relative position.
- **Improvement**: Make the distribution bar slightly taller and ensure name badges are clear. If a list is still needed for accessibility or precise reading, make it a compact, collapsible list or a side drawer.

## Decisions

### Decision: Integrated Header
- The header will now contain:
  - Room ID
  - Current User's Name (Editable)
  - Share URL Button
  - Connection Status

### Decision: Focused Main Area
- The main content area will only contain:
  - Topic Card (Top)
  - Interactive Distribution Bar (Middle/Bottom)

### Decision: Numeric Display Refinement
- Move the large "Your Value" number to the interactive bar's own header section to keep context unified.

## Summary
The UI will shift from a "Dashboard of Cards" to a "Unified Workspace" aesthetic, maximizing the space for the distribution visualization.
