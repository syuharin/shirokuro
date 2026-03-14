# Research: Host Migration Logic

## Decision: PeerJS ID Takeover Strategy
**Decision**: Use Option A (Static ID Takeover) with Exponential Backoff.
**Rationale**: In a serverless P2P environment, the Room ID must be discoverable by newcomers via a predictable PeerID. Since we lack a central registry, the `anchor-ID` (`shirokuro-anchor-[roomId]`) is our only discovery mechanism.
**Alternatives considered**: 
- **Option B (Deterministic Fallbacks)**: Rejected because it requires newcomers to perform multiple connection attempts, increasing latency and complexity.
- **Option C (Manual Re-hosting)**: Rejected as it provides a poor user experience for a "real-time" app.

## Decision: Election Algorithm
**Decision**: Lexicographical sorting of PeerIDs.
**Rationale**: This is a "zero-message" election. As long as every peer has a consistent list of participants, they will all independently arrive at the same conclusion about who the new "Acting Host" is.
**Alternatives considered**:
- **Oldest Connection**: Hard to track reliably without a central clock or vector clocks.
- **Random with Consensus**: Too much overhead for a simple synchronization app.

## Technical Unknown: PeerJS ID Release Timeout
**Research Finding**: PeerJS signaling servers (like the default one) typically detect a disconnect and release the ID within 10-30 seconds. During this window, any attempt to register the same ID will result in an `unavailable-id` error.
**Action**: The Acting Host must listen for the `unavailable-id` error and retry using the exponential backoff strategy (5s, 10s, 20s...).

## Technical Unknown: Mesh Coordination
**Research Finding**: In the current `usePeer.ts` implementation, the Anchor is responsible for sending the `INITIAL_PEER_LIST` to newcomers. 
**Action**: The Acting Host must take over this responsibility. Even before successfully re-occupying the `anchor-ID`, the Acting Host should be ready to respond to connection requests if any peer manages to reach them (though unlikely for newcomers until the ID is taken over).
