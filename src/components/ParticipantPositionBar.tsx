"use client";

import { PeerState } from "@/lib/types";
import { Slider as SliderPrimitive } from "radix-ui";
import { SliderTrack } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ParticipantPositionBarProps {
  myState: PeerState;
  participants: PeerState[];
  value?: number;
  onChange?: (val: number) => void;
  onCommit?: (val: number) => void;
  labelMin?: string;
  labelMax?: string;
}

export function ParticipantPositionBar({ 
  myState, 
  participants,
  value,
  onChange,
  onCommit,
  labelMin = "0",
  labelMax = "100"
}: ParticipantPositionBarProps) {
  // すべての参加者を一つの配列にまとめ、数値順にソートする
  // 自分がスライダーモード（value, onChangeがある）の場合は、myStateは別途Thumbとして描画するため、
  // othersとして分離する
  const isInteractive = value !== undefined && onChange !== undefined;
  
  const others = participants.filter(p => p.peerId !== myState.peerId);
  const me = { ...myState, isSelf: true };
  
  // 近接判定（この値以下の差であれば重なっているとみなす）
  const PROXIMITY_THRESHOLD = 10;
  
  // 各マーカーの垂直オフセットを決定する
  // 既に配置されたマーカーとの距離をチェックし、重ならない最小のオフセットを探す
  const allPeersForOffset = [...others, me].sort((a, b) => a.value - b.value);
  const occupiedPositions: { value: number; offset: number }[] = [];
  
  const offsetMap = new Map<string, number>();
  
  allPeersForOffset.forEach(peer => {
    let offset = 0;
    while (occupiedPositions.some(pos => 
      pos.offset === offset && 
      Math.abs(pos.value - peer.value) < PROXIMITY_THRESHOLD
    )) {
      offset++;
    }
    occupiedPositions.push({ value: peer.value, offset });
    offsetMap.set(peer.peerId, offset);
  });

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-black text-black flex items-center gap-2">
          <div className="w-1 h-4 bg-black rounded-full" />
          現在の分布
        </h3>
        
        {isInteractive && (
          <div className="text-5xl font-black font-mono text-black leading-none tracking-tighter tabular-nums opacity-100">
            {Math.round(value)}
          </div>
        )}
      </div>
      
      {/* Track Container */}
      <div className="relative h-32 w-full bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center px-4">
        
        {isInteractive ? (
          <SliderPrimitive.Root
            className="relative flex w-full touch-none items-center select-none h-full"
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            onValueCommit={(vals) => onCommit?.(vals[0])}
            max={100}
            step={5}
          >
            <SliderTrack className="h-0.5 bg-neutral-500 opacity-30">
              {/* Central Axis Line (Static visual) */}
            </SliderTrack>

            {/* Others' markers (Not interactive) */}
            {others.map((peer) => (
              <ParticipantMarker 
                key={peer.peerId} 
                peer={peer} 
                isSelf={false} 
                offset={offsetMap.get(peer.peerId) || 0}
              />
            ))}

            {/* My marker (Interactive Thumb) */}
            <SliderPrimitive.Thumb asChild>
              <div className="outline-none focus:ring-0">
                <ParticipantMarker 
                  peer={{ ...me, value: value }} 
                  isSelf={true} 
                  offset={offsetMap.get(me.peerId) || 0}
                />
              </div>
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>
        ) : (
          <div className="relative w-full h-full flex items-center">
            {/* Central Axis Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-neutral-500 opacity-30 top-1/2 -translate-y-1/2" />
            
            {/* Markers Container */}
            <div className="relative w-full h-full">
              {[...others, me].map((peer) => (
                <ParticipantMarker 
                  key={peer.peerId} 
                  peer={peer} 
                  isSelf={peer.isSelf} 
                  offset={offsetMap.get(peer.peerId) || 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between px-1">
        <div className="flex flex-col items-start gap-1.5 max-w-[30%]">
          <span className="text-sm font-black text-neutral-400">0</span>
          <div className="w-px h-1.5 bg-neutral-300" />
          <span className="text-sm font-bold text-neutral-600 mt-0.5 leading-tight">{labelMin}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-sm font-black text-neutral-400">50</span>
          <div className="w-px h-1.5 bg-neutral-300" />
        </div>
        <div className="flex flex-col items-end gap-1.5 max-w-[30%] text-right">
          <span className="text-sm font-black text-neutral-400">100</span>
          <div className="w-px h-1.5 bg-neutral-300" />
          <span className="text-sm font-bold text-neutral-600 mt-0.5 leading-tight">{labelMax}</span>
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
    const magnitude = Math.ceil(idx / 2) * 28; // Increased slightly for clarity
    return idx % 2 === 0 ? magnitude : -magnitude;
  };
  
  const yOffset = calculateYOffset(offset);

  const badgeStyles = isSelf 
    ? 'bg-black text-white border-white shadow-xl ring-2 ring-black/5 cursor-grab active:cursor-grabbing'
    : 'bg-white text-neutral-500 border-neutral-200 shadow-sm';

  return (
    <div 
      className={cn(
        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 ease-out group/marker",
        isSelf ? 'z-30' : 'z-10 hover:z-20'
      )}
      style={{ 
        left: leftPosition,
        marginTop: `${yOffset}px` 
      }}
    >
      {/* Name Badge (Replaces Icon) */}
      <div 
        className={cn(
          "px-3 py-1 rounded-full border-2 font-black text-[11px] whitespace-nowrap transition-all duration-300 group-hover/marker:scale-110 flex items-center gap-1.5",
          badgeStyles
        )}
      >
        <span className={cn(
          "font-mono tabular-nums",
          isSelf ? "text-white/70" : "text-neutral-900/60"
        )}>{Math.round(peer.value)}</span>
        <span className="tracking-tight max-w-[80px] truncate">
          {peer.name || 'ゲスト'}{isSelf && ' (自分)'}
        </span>
      </div>
      
      {/* Visual Anchor Dot on Axis */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300",
        isSelf ? 'bg-black' : 'bg-neutral-200'
      )} 
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
