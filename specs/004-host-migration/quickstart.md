# Quickstart: Host Migration Testing

## Prerequisites
- 3+ browser windows/tabs open to the same room URL.
- DevTools console open to monitor PeerJS connection logs.

## Test Scenario 1: Anchor Disconnect
1. Open a room in Tab 1 (Host/Anchor).
2. Join the room in Tab 2 and Tab 3 (Guests).
3. Confirm all three are synced (all markers visible on all tabs).
4. Close Tab 1 (Original Host).
5. Observe Tab 2 and Tab 3 logs: "Anchor connection lost. Starting election...".
6. Verify one tab is promoted to "Acting Host" based on lexicographical sorting.
7. Confirm Tab 2 and Tab 3 remain synced with each other.

## Test Scenario 2: New Joiner during Migration
1. (Repeat Test 1 steps 1-4).
2. Before the Acting Host re-occupies the `anchor-ID`, open a new Tab 4.
3. Tab 4 should fail to connect initially (while `anchor-ID` is in timeout).
4. Once Acting Host re-occupies `anchor-ID`, Tab 4 should automatically connect.
