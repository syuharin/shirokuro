# Quickstart: Layout and Contrast Refinement

## Verification Steps
1. **Run Dev Server**: `npm run dev`
2. **Open Room**: Navigate to `http://localhost:3000/room/test-room`.
3. **Mobile Emulation**:
   - Open Chrome DevTools (F12).
   - Toggle Device Toolbar (Ctrl+Shift+M).
   - Select "iPhone SE" or "iPhone 14 Pro" (narrow widths).
4. **Verify Header**: Check if "Share" and "QR" buttons wrap or stack correctly.
5. **Verify Topic Edit Form**: Click "Edit" and check if "Sync" and "Cancel" buttons stack vertically on mobile.
6. **Verify Labels**: Ensure "0", "50", "100" and category labels are clearly readable (14px).
7. **Verify Slider**: Ensure the central axis track is clearly visible (dark gray).

## Files Involved
- `src/components/ParticipantPositionBar.tsx`: Sizing and slider colors.
- `src/components/Header.tsx`: Responsive button stacking.
- `src/app/room/[id]/page.tsx`: Topic edit form button responsiveness.
