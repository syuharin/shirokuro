"use client";

import { PeerState } from "@/lib/types";

interface ParticipantListProps {
  myState: PeerState;
  participants: PeerState[];
}

export function ParticipantList({ myState, participants }: ParticipantListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-200">
        Participants ({participants.length + 1})
      </h2>
      
      <div className="grid gap-3">
        {/* Myself */}
        <ParticipantCard peer={myState} isSelf />
        
        {/* Others */}
        {participants.map((peer) => (
          <ParticipantCard key={peer.peerId} peer={peer} />
        ))}
        
        {participants.length === 0 && (
          <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
            Waiting for others to join...
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantCard({ peer, isSelf }: { peer: PeerState, isSelf?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isSelf ? 'bg-neutral-900 border-blue-900/50' : 'bg-neutral-900 border-neutral-800'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isSelf ? 'bg-blue-500' : 'bg-green-500'}`} />
        <div>
          <div className="font-medium text-neutral-200">{peer.name || 'Anonymous'} {isSelf && '(You)'}</div>
          <div className="text-xs text-neutral-500 font-mono">{peer.peerId.slice(-6)}</div>
        </div>
      </div>
      <div className="text-2xl font-bold font-mono text-neutral-200">
        {peer.value}
      </div>
    </div>
  );
}
