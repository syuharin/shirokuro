# P2P Interface Contract: Slider Sync Payload

**Interface**: PeerJS DataChannel (JSON messages)
**Protocol**: WebRTC (Reliable, Unordered or Ordered)

## Payload Format (Common)
All messages between peers must be valid JSON and contain a `type` field.

```json
{
  "type": "SYNC_UPDATE | INITIAL_PEER_LIST | SYNC_TOPIC | HEARTBEAT",
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

### 2. `SYNC_TOPIC`
Sent when a user updates the "Topic" or the "Scale Labels".

```json
{
  "type": "SYNC_TOPIC",
  "payload": {
    "topic": "Will AI replace programmers?",
    "labelMin": "Definitely No",
    "labelMax": "Definitely Yes"
  }
}
```

### 3. `INITIAL_PEER_LIST`
Sent by the "Anchor" to a newly joined peer.

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
- `InteractiveParticipantPositionBar`: (REPLACED `ParticipantPositionBar` and partially `SliderComponent`)
  - Displays all participants as markers.
  - Acts as a **Radix UI Slider** where the `isSelf` marker is the `Thumb`.
  - Emits `onValueChange` for real-time local updates.
  - Emits `onValueCommit` (from Radix Slider) to the P2P broadcast manager via `usePeer`.
- `SliderComponent`: (DEPRECATED/SECONDARY)
  - Acts as a redundant or fallback control, potentially only showing the large numeric display now.
- `NameInput`: Emits `onChange` events to the P2P broadcast manager via `usePeer`.
- `ParticipantList`: Subscribes to the `participants` array and `myState` from `usePeer`.
- `TopicCard`: Subscribes to `topic`, `labelMin`, `labelMax` and `updateTopic` from `usePeer`.
