# Research: Automatic Host Migration

## Decision: Join Timestamp and Peer ID Sort
- **Decision**: Every participant will include a `joinTimestamp` (local `Date.now()`) in their state. In the event of host departure, the remaining participant with the *lowest* `joinTimestamp` becomes the new host.
- **Rationale**: Provides a consistent, deterministic order for host promotion without a central authority.
- **Alternatives considered**: Random selection (too unpredictable), "First to Claim" (high risk of split-brain/collisions).

## Decision: Peer ID Tie-breaker
- **Decision**: If two participants have identical `joinTimestamp` (rare but possible), the one with the lexicographically smaller `peerId` will be the primary candidate for promotion.
- **Rationale**: Ensures a single winner in extreme edge cases.

## Decision: Migration Grace Period (3 Seconds)
- **Decision**: When a guest detects the Host (Anchor) has disconnected, it will wait for 3 seconds before attempting to "re-anchor" by taking the `PREFIX-anchor-roomId` ID.
- **Rationale**: Allows the original host a short window to reconnect (due to minor network glitches) and prevents rapid, unnecessary role flickering while maintaining a reasonable response time.

## Decision: Role Re-evaluation on Re-entry
- **Decision**: If a user returns to a room where a migration has already occurred, they MUST join as a guest initially, even if they were previously the host.
- **Rationale**: Prevents "Split-brain" scenarios where two users think they are the host.

## Decision: State Preservation
- **Decision**: When a new host takes over, they initialize their state using the last known values for `topic`, `labelMin`, and `labelMax` from their local cache.
- **Rationale**: Satisfies the requirement to preserve the shared synchronization state during transition.
