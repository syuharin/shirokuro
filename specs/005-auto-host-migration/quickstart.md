# Quickstart: Automatic Host Migration

## Verification Procedure (Manual)

### 1. Auto-Host on Direct Access
1.  Open a new browser window (Window A) and navigate to a new room: `http://localhost:3000/room/test-migration`.
2.  Observe that User A is automatically assigned the "Host" role (indicated in the participant list or UI).

### 2. Seamless Host Migration
1.  Open a second browser window (Window B) and navigate to the same room: `http://localhost:3000/room/test-migration`.
2.  Observe that User B joins as a "Guest".
3.  Set the slider in Window A (Host) to a value (e.g., 75).
4.  Observe that Window B (Guest) updates to the same value (75).
5.  Close Window A (Host).
6.  Wait for approximately 5-10 seconds (Grace Period + Connection Timeout).
7.  Observe that User B in Window B is now promoted to "Host".
8.  Observe that the slider value in Window B remains at 75.
9.  Change the slider value in Window B. It should now control the room's state.

### 3. Re-entry as Guest
1.  In Window A (previous host), navigate back to `http://localhost:3000/room/test-migration`.
2.  Observe that User A now joins as a "Guest," while User B remains the "Host."
