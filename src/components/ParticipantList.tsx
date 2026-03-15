"use client";

import { PeerState } from "@/lib/types";
import { Users } from "lucide-react";
import { StatusDot } from "./ui/status-dot";

interface ParticipantListProps {
  myState: PeerState;
  participants: PeerState[];
}

export function ParticipantList({ myState, participants }: ParticipantListProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black flex items-center gap-4 text-black italic">
          <Users className="w-8 h-8 not-italic" />
          みんなの意見
        </h2>
        <div className="bg-black text-white px-4 py-1 rounded-full text-xs font-black">
          {participants.length + 1}人 参加中
        </div>
      </div>
      
      <div className="grid gap-4">
        {/* Myself */}
        <ParticipantCard peer={myState} isSelf />
        
        {/* Others */}
        {participants.length > 0 ? (
          participants.map((peer) => (
            <ParticipantCard key={peer.peerId} peer={peer} />
          ))
        ) : (
          <div className="text-center py-20 text-neutral-400 border-2 border-dashed border-neutral-100 rounded-[2rem] bg-neutral-50/50">
            <p className="font-black text-xl">まだ誰もいません</p>
            <p className="font-bold text-sm mt-2 opacity-60">URLを共有して意見を聞いてみましょう</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantCard({ peer, isSelf }: { peer: PeerState, isSelf?: boolean }) {
  const isHost = peer.peerId.includes('anchor-');

  const containerClasses = [
    "flex items-center justify-between p-8 rounded-[2rem] border transition-all duration-500 shadow-sm",
    isSelf ? "bg-white border-black ring-2 ring-black ring-offset-4" : "bg-neutral-50 border-neutral-100 hover:border-neutral-300",
    isHost && !isSelf ? "border-black/20 bg-neutral-50 shadow-md" : ""
  ].join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-6">
        <StatusDot status={peer.status} />
        <div>
          <div className="flex items-center gap-2">
            <div className="font-black text-2xl text-black leading-tight tracking-tighter">{peer.name || 'ゲスト'} {isSelf && '(あなた)'}</div>
            {isHost && (
              <span className="bg-black text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">Host</span>
            )}
          </div>
          <div className="text-[10px] text-neutral-300 font-black uppercase tracking-tighter mt-1">PEER: {peer.peerId.slice(-6)}</div>
        </div>
      </div>
      <div className="text-6xl font-black font-mono leading-none tabular-nums tracking-tighter text-black">
        {peer.value}
      </div>
    </div>
  );
}
