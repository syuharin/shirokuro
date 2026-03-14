# P2P Interface Contract: Host Migration Payloads

## Payload Format (Host Migration)
Messages used for the host migration process.

```json
{
  "type": "HOST_MIGRATION",
  "payload": {
    "action": "ELECTION_ANNOUNCEMENT | HOST_TAKEOVER_SUCCESS",
    "actingHostId": "shirokuro-xyz-123"
  }
}
```

### 1. `ELECTION_ANNOUNCEMENT`
Sent by a peer when they believe they are the new election winner (Candidate).

```json
{
  "type": "HOST_MIGRATION",
  "payload": {
    "action": "ELECTION_ANNOUNCEMENT",
    "actingHostId": "shirokuro-xyz-123"
  }
}
```

### 2. `HOST_TAKEOVER_SUCCESS`
Sent by the "Acting Host" after successfully re-occupying the static `anchor-ID`.

```json
{
  "type": "HOST_MIGRATION",
  "payload": {
    "action": "HOST_TAKEOVER_SUCCESS",
    "actingHostId": "shirokuro-anchor-[roomId]"
  }
}
```
