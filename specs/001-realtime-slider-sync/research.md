# Research: Interactive Participant Distribution Bar

## Problem Statement
The user's slider control and the distribution bar are spatially separated, forcing users to "look away" from everyone's context while adjusting their own position.

## Findings

### 1. Draggable Components vs. Radix Slider
- **Draggable Components (Custom)**: Implementing manual drag/touch logic for `ParticipantMarker` is error-prone (handling offsets, constraints, and touch events).
- **Radix Slider Overlay**: We can use the existing `Radix Slider` primitive. By making the slider's track transparent and overlaying it on the distribution bar (or making the bar *be* the slider track), we get built-in accessibility, touch support, and standard interaction patterns.

### 2. Layout Integration
- **Current Bar**: 24px height track, markers are absolutely positioned based on value %.
- **Slider Track**: `h-1.5` by default in `ui/slider.tsx`.
- **Decision**: Redesign `ParticipantPositionBar` to use `Radix Slider` as its structural core.
  - The `Slider.Track` will act as the axis line.
  - The `Slider.Thumb` will render the `ParticipantMarker` for `isSelf`.
  - Non-self markers will be rendered as absolute positioned children within the same relative container.

### 3. Vertical Collision Management
- Markers currently use `verticalOffset` to avoid overlapping.
- **Problem**: Standard `Slider.Thumb` is centered on the track.
- **Solution**: The `ParticipantMarker` already takes an `offset` prop. We can pass the `verticalOffset` calculated by `ParticipantPositionBar` to the `isSelf` marker even when it's acting as a slider thumb.

## Decision
Refactor `ParticipantPositionBar` to become `InteractiveParticipantPositionBar`.
- It will accept `value`, `onChange`, and `onCommit` props (optional).
- When these props are present, the "Self" marker is rendered as a `Slider.Thumb`.
- This eliminates the need for the separate `SliderComponent` (or at least makes it redundant).

## Rationale
- Direct manipulation is more intuitive.
- Reduces visual clutter by removing the separate "My Control" slider area.
- Maintains accessibility via Radix UI.
