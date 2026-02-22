"use client";

import { PeerState } from "@/lib/types";
import { User } from "lucide-react";

interface ParticipantPositionBarProps {
  myState: PeerState;
  participants: PeerState[];
}

export function ParticipantPositionBar({ myState, participants }: ParticipantPositionBarProps) {
  // すべての参加者を一つの配列にまとめ、数値順にソートする
  const allPeers = [...participants, { ...myState, isSelf: true }]
    .sort((a, b) => a.value - b.value);
  
  // 近接判定（この値以下の差であれば重なっているとみなす）
  const PROXIMITY_THRESHOLD = 10;
  
  // 各マーカーの垂直オフセットを決定する
  // 既に配置されたマーカーとの距離をチェックし、重ならない最小のオフセットを探す
  const occupiedPositions: { value: number; offset: number }[] = [];
  
  const peersWithOffsets = allPeers.map(peer => {
    let offset = 0;
    // 同じオフセット階層に、閾値より近いマーカーがある間、オフセットを上げ続ける
    while (occupiedPositions.some(pos => 
      pos.offset === offset && 
      Math.abs(pos.value - peer.value) < PROXIMITY_THRESHOLD
    )) {
      offset++;
    }
    
    occupiedPositions.push({ value: peer.value, offset });
    return { ...peer, verticalOffset: offset };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-black text-black flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          現在の分布（みんなの立ち位置）
        </h3>
        <div className="flex gap-4 text-[10px] font-black text-neutral-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-black" />
            <span>あなた</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-full bg-neutral-200" />
            <span>他の人</span>
          </div>
        </div>
      </div>
      
      {/* Track Container */}
      <div className="relative h-24 w-full bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center px-4">
        {/* Central Axis Line */}
        <div className="absolute left-4 right-4 h-0.5 bg-neutral-100 top-1/2 -translate-y-1/2" />
        
        {/* Markers Container */}
        <div className="relative w-full h-full">
          {peersWithOffsets.map((peer) => (
            <ParticipantMarker 
              key={peer.peerId} 
              peer={peer} 
              isSelf={peer.isSelf} 
              offset={peer.verticalOffset}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between px-1">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-black text-neutral-300">0</span>
          <div className="w-px h-1 bg-neutral-200" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-neutral-300">50</span>
          <div className="w-px h-1 bg-neutral-200" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black text-neutral-300">100</span>
          <div className="w-px h-1 bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

function ParticipantMarker({ 
  peer, 
  isSelf, 
  offset = 0 
}: { 
  peer: PeerState; 
  isSelf?: boolean;
  offset?: number;
}) {
  // マーカーの左位置を計算（中央揃えのために調整）
  const leftPosition = `${peer.value}%`;
  
  // 垂直オフセットの計算：重ならないように上下に散らす
  // 0, 1, 2, 3 ... を 0, -28, 28, -56, 56 ... のように交互に配置
  const calculateYOffset = (idx: number) => {
    if (idx === 0) return 0;
    const magnitude = Math.ceil(idx / 2) * 26;
    return idx % 2 === 0 ? magnitude : -magnitude;
  };
  
  const yOffset = calculateYOffset(offset);

  // マーカーの色（バッジ形式に合わせる）
  const getBadgeColors = (value: number) => {
    if (isSelf) return 'bg-black text-white border-white shadow-xl ring-2 ring-black/5';
    
    if (value >= 80) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (value <= 20) return 'bg-red-50 text-red-600 border-red-100';
    if (value >= 55) return 'bg-emerald-50/50 text-emerald-500/80 border-emerald-50';
    if (value <= 45) return 'bg-red-50/50 text-red-500/80 border-red-50';
    
    return 'bg-white text-neutral-500 border-neutral-200 shadow-sm';
  };

  const badgeStyles = getBadgeColors(peer.value);

  return (
    <div 
      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group/marker ${isSelf ? 'z-20' : 'z-10 hover:z-30'}`}
      style={{ 
        left: leftPosition,
        marginTop: `${yOffset}px` 
      }}
    >
      {/* Name Badge (Replaces Icon) */}
      <div 
        className={`px-3 py-1 rounded-full border-2 font-black text-[11px] whitespace-nowrap transition-all duration-300 group-hover/marker:scale-110 flex items-center gap-1.5 ${badgeStyles}`}
      >
        <span className="opacity-40 font-mono tabular-nums">{peer.value}</span>
        <span className="tracking-tight max-w-[80px] truncate">
          {peer.name || 'ゲスト'}{isSelf && ' (自分)'}
        </span>
      </div>
      
      {/* Visual Anchor Dot on Axis */}
      <div className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
        isSelf ? 'bg-black' : 'bg-neutral-200'
      }`} 
      style={{ 
        // バッジから軸線（中央）に向かってドットを配置
        top: '50%',
        marginTop: `${-yOffset}px`,
        opacity: offset === 0 ? 0 : 1 // 重なっていない時は隠す
      }} />

      {/* Pulse for self */}
      {isSelf && (
        <div className="absolute inset-0 rounded-full animate-ping bg-black/5 -z-10" />
      )}
    </div>
  );
}
