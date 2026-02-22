# P2P Interface Contract: Slider Sync Payload

**Interface**: PeerJS DataChannel (JSON messages)
**Protocol**: WebRTC (Reliable, Unordered or Ordered)

## Payload Format (Common)
All messages between peers must be valid JSON and contain a `type` field.

```json
{
  "type": "SYNC_UPDATE | INITIAL_PEER_LIST | HEARTBEAT",
  "payload": { ... }
}
```

## Messages

### 1. `SYNC_UPDATE`
Sent when a user updates their name or completes a slider interaction.

```json
{
  "type": "SYNC_UPDATE",
  "payload": {
    "peerId": "shirokuro-xyz-123",
    "name": "Anonymous",
    "value": 42
  }
}
```

### 2. `INITIAL_PEER_LIST`
Sent by the "lobby-anchor" to a newly joined peer.

```json
{
  "type": "INITIAL_PEER_LIST",
  "payload": {
    "peers": [
      "shirokuro-xyz-124",
      "shirokuro-xyz-125"
    ]
  }
}
```

## UI Contracts (Client-side Only)
The frontend components must adhere to the following data-flow:
- `SliderComponent`: Emits `onChangeCommitted` events (from `shadcn/ui` slider) to the P2P broadcast manager.
- `ParticipantList`: Subscribes to the `participants` map state from the P2P connection provider.
