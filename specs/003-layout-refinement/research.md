# Research: Layout and Contrast Refinement

## Decision: Mobile Button Stacking (Header & Edit Form)
- **Choice**: Use Tailwind 4 `flex-col` on small screens (`sm` or `xs`) and `flex-row` on larger screens.
- **Rationale**: This is the standard utility-first approach for responsive button layouts. For the Header, we'll ensure the `NameInput` and `Button` group stack vertically on mobile to prevent horizontal overflow.
- **Alternatives considered**: 
  - Dynamic font sizing (rejected because it doesn't solve the core layout issue on narrow screens).
  - Collapsing buttons into a menu (rejected to maintain "Minimalist UI" principle).

## Decision: Slider Track Contrast
- **Choice**: Use a dark gray (e.g., `text-neutral-500` or `bg-neutral-500`) for the track.
- **Rationale**: WCAG AA for non-text contrast requires a ratio of 3:1. Against `neutral-50` (approx #fafafa), `neutral-500` (approx #737373) provides a ratio of ~4.6:1, safely exceeding the requirement.
- **Alternatives considered**:
  - Solid black (rejected to keep the UI from looking too heavy, as per user preference in clarification).

## Decision: Testing Framework
- **Choice**: N/A (Visual Verification).
- **Rationale**: The project currently has no automated test suite. Visual verification via mobile emulation in DevTools will be used to ensure buttons do not overflow and labels are readable.
- **Alternatives considered**: 
  - Setting up Playwright/Cypress (rejected as it exceeds the scope of this UI refinement task).

## Decision: Label Font Size
- **Choice**: Increase scale numbers and labels to `text-sm` (14px).
- **Rationale**: 14px is the minimum standard for high readability on mobile devices.
