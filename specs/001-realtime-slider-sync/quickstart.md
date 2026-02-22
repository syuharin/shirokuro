# Quickstart: Implementing ParticipantPositionBar

## Steps to Implement

1. **Create the Component**:
   - Path: `src/components/ParticipantPositionBar.tsx`
   - Use Tailwind CSS to create a horizontal track.
   - Map `myState` and `participants` to absolute-positioned markers.

2. **Integrate into Room Page**:
   - Path: `src/app/room/[id]/page.tsx`
   - Import and place `<ParticipantPositionBar />` above or below the `SliderComponent`.

3. **Verify Synchronicity**:
   - Open two browser tabs on the same room URL.
   - Adjust the slider in one tab.
   - Verify the marker in the `ParticipantPositionBar` in both tabs updates in real-time.

## Example Rendering Logic
```tsx
const calculateLeft = (value: number) => `calc(${value}% - 12px)`; // 12px = half of marker width
```

## Styling Notes
- Track: `bg-neutral-100 rounded-full h-8 w-full border border-neutral-200`
- Marker (Self): `bg-black text-white rounded-full p-2 border-2 border-white shadow-lg`
- Marker (Others): `bg-white text-black border-neutral-300 rounded-full p-2 shadow-sm`
