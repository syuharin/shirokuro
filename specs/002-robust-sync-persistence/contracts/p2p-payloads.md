# P2P Interface Contracts: Robust Sync & Heartbeat

## Overview

The P2P communication protocol used in Shirokuro for synchronization and mesh management. All messages are JSON payloads sent via PeerJS `DataConnection`.

## Message Format

All payloads follow a consistent `type` and `payload` structure.

| Type | Description |
| :--- | :--- |
| `SYNC_UPDATE` | Broadcasts the current slider value and name. |
| `SYNC_TOPIC` | Sent by the Anchor to update the room's topic and labels. |
| `INITIAL_PEER_LIST` | Sent by the Anchor to new joiners for mesh construction. |
| `HEARTBEAT` | Optional: Sent periodically or on reconnect to verify presence. |

---

### `SYNC_UPDATE`

Broadcast when a user moves their slider or updates their name.

```json
{
  "type": "SYNC_UPDATE",
  "payload": {
    "peerId": "string (unique)",
    "name": "string (display name)",
    "value": "number (0-100)"
  }
}
```

---

### `SYNC_TOPIC` (Anchor only)

Broadcast by the Anchor to set the theme of the room.

```json
{
  "type": "SYNC_TOPIC",
  "payload": {
    "topic": "string (the question/topic)",
    "labelMin": "string (left label)",
    "labelMax": "string (right label)"
  }
}
```

---

### `INITIAL_PEER_LIST` (Anchor only)

Provides the newcomer with a list of active `peerId`s to complete the P2P mesh.

```json
{
  "type": "INITIAL_PEER_LIST",
  "payload": {
    "peers": ["string (peerId1)", "string (peerId2)", "..."]
  }
}
```

---

### `HEARTBEAT`

Sent immediately upon reconnection to confirm the peer's return to the mesh.

```json
{
  "type": "HEARTBEAT",
  "payload": {
    "peerId": "string",
    "status": "online"
  }
}
```
