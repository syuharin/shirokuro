# Feature Specification: Layout and Contrast Refinement

**Feature Branch**: `003-layout-refinement`  
**Created**: 2026-03-14  
**Status**: Draft  
**Input**: User description: "レイアウトの修正をしたいです。 ・画面下のラベルや数字を大きくしてください。また、スライダーについて背景色に対して目立っていないのでコントラストをつけてください。 ・スマホの場合縦画面で以下のボタンが大きく画面をはみ出すので小さくするか改行してください。"

## Clarifications

### Session 2026-03-14
- Q: 修正対象とするボタンの範囲 → A: ヘッダー（共有/QR）と編集フォーム（決定/キャンセル）の両方に適用する
- Q: スライダーのコントラスト（色の方向性） → A: 濃いグレー（背景よりは濃いが、黒ほどは主張しない）

## Constitution Alignment *(mandatory)*

- **Zero Database Policy**: Confirmed. This is a pure UI/UX refinement.
- **No User Management**: Confirmed. No changes to auth or user logic.
- **Stateless Grouping**: Confirmed. UI changes do not affect grouping logic.
- **Real-time P2P**: Confirmed. Sync logic remains untouched; only presentation is improved.
- **Vercel Native**: Confirmed. CSS/Tailwind changes fit within standard deployments.
- **Minimalist UI**: Confirmed. Enhances the existing minimalist UI for better accessibility and mobile usability.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Improved Label Readability (Priority: P1)

As a user with a mobile device or high-resolution screen, I want to clearly see the scale markers (0, 50, 100) and the category labels (e.g., "Yes", "No") at the bottom of the distribution bar so that I can accurately interpret the data.

**Why this priority**: Core legibility is essential for the tool's primary function of visualizing distributions.

**Independent Test**: Can be tested by opening the room page and visually verifying that bottom labels are easily readable without squinting (approx. 14px-16px equivalent).

**Acceptance Scenarios**:

1. **Given** a room with topic labels, **When** viewing the ParticipantPositionBar, **Then** the numbers "0", "50", "100" and the labels (labelMin, labelMax) must be significantly larger than the current 9px/10px.
2. **Given** any screen size, **When** labels are rendered, **Then** they must not overlap each other even if the label text is long.

---

### User Story 2 - High Contrast Slider (Priority: P1)

As a user, I want the slider track to be distinct from the background so that I can easily see where the scale is and where my marker is positioned.

**Why this priority**: Poor contrast makes the interface feel "washed out" and difficult to use in bright environments.

**Independent Test**: Can be tested by comparing the track color against the container background. The track should be clearly visible as a defined line/bar.

**Acceptance Scenarios**:

1. **Given** the distribution bar container, **When** rendered, **Then** the central axis line or track must use a dark gray color that provides at least a 3:1 contrast ratio against its immediate background.

---

### User Story 3 - Mobile-Optimized Action Buttons (Priority: P2)

As a mobile user in portrait mode, I want the header buttons (Share, QR) and topic editing buttons (Update, Cancel) to fit within my screen width so that I don't have to scroll horizontally or deal with broken layouts.

**Why this priority**: Overflowing buttons break the responsive design and prevent users from completing actions on small devices.

**Independent Test**: Can be tested using a mobile browser (or dev tools mobile view) in portrait mode. Both Header and Edit form buttons must be fully visible and wrap or resize appropriately.

**Acceptance Scenarios**:

1. **Given** a mobile device in portrait mode, **When** the topic edit mode is active, **Then** the action buttons must either stack vertically or resize to fit the screen width without horizontal overflow.
2. **Given** a mobile device in portrait mode, **When** viewing the header, **Then** the Share and QR buttons must adapt to the narrow width without breaking the header layout.

---

### Edge Cases

- **Very Long Labels**: If the user enters a very long label for "0" or "100", the increased font size might cause overlap.
- **Narrow Screens (e.g., iPhone SE)**: Even smaller buttons might struggle if the text "決定して全員に同期" is preserved in its entirety on one line.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Bottom scale numbers (0, 50, 100) MUST be increased in size to at least 14px equivalent.
- **FR-002**: Bottom category labels (`labelMin`, `labelMax`) MUST be increased in size to at least 14px equivalent and use a higher contrast color against the background.
- **FR-003**: The slider track/axis line MUST use a dark gray color with at least a 3:1 contrast ratio against the container background.
- **FR-004**: All action button groups (Header and Topic Edit) MUST be responsive, switching to a stacked vertical layout or wrapping on narrow screens to prevent horizontal overflow.
- **FR-005**: The primary action button text MUST be allowed to wrap to multiple lines or be dynamically resized on mobile if it exceeds the available button width.

### Key Entities *(include if feature involves data)*

- **N/A**: This feature is purely visual and does not introduce new data entities.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of bottom labels and scale numbers are rendered at a minimum size of 14px.
- **SC-002**: The slider track contrast ratio is increased to at least 3:1 using a dark gray color.
- **SC-003**: Zero horizontal scrollbars are present on common mobile device widths (320px, 375px, 390px) when both the header is displayed and the topic edit form is open.
- **SC-004**: Users can successfully click the "Sync" and "Share" buttons on a 320px wide screen without the button being clipped.
