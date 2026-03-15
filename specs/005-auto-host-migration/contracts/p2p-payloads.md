# P2P Payloads Contract: Automatic Host Migration

## Message Types (Updated)

### SYNC_UPDATE (Updated)
Sent by a participant to broadcast their latest state.

```json
{
  "type": "SYNC_UPDATE",
  "payload": {
    "peerId": "shirokuro-peer-abc12345",
    "name": "Jane Doe",
    "value": 42,
    "joinTimestamp": 1742012000000 
  }
}
```

- **`joinTimestamp`**: Unix timestamp (milliseconds) representing when the participant first connected to the room.

### HOST_MIGRATION (New)
Sent by the *new* host to all other participants to signal they have taken control.

```json
{
  "type": "HOST_MIGRATION",
  "payload": {
    "newHostId": "shirokuro-anchor-room-123",
    "oldHostId": "shirokuro-anchor-room-123-OLD",
    "timestamp": 1742013000000
  }
}
```

*Note*: Since the new host will literally attempt to take the `shirokuro-anchor-room-id` ID, they might send this notification using their previous random peer ID *before* or *during* the re-connection as the anchor. However, to simplify, once the new anchor is established, they broadcast their state to all as the anchor.

## Protocol Sequence: Host Migration

1. **Host Departure**: Current `Host` (Anchor) disconnects.
2. **Detection**: Guests see `close` event on their connection to the Anchor.
3. **Grace Period**: Guests wait 5 seconds.
4. **Election**: Remaining guests sort themselves by `joinTimestamp` then `peerId`.
5. **Promotion**: The "winner" guest destroys their current Peer instance and re-initializes as the Anchor using the ID `shirokuro-anchor-roomId`.
6. **Re-connection**: Other guests detect the new Anchor is available (or the Anchor connects to them) and sync their status.
