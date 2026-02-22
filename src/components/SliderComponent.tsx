"use client";

import { Slider } from "@/components/ui/slider";

interface SliderComponentProps {
  value: number;
  onChange: (value: number) => void;
  labelMin: string;
  labelMax: string;
  disabled?: boolean;
}

export function SliderComponent({ value, onChange, labelMin, labelMax, disabled }: SliderComponentProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-black text-neutral-400 uppercase tracking-widest block">回答スケール</label>
          <div className="flex justify-between text-[10px] font-black text-neutral-300">
            <span className="max-w-[80px] truncate">{labelMin}</span>
            <span className="max-w-[80px] truncate text-right">{labelMax}</span>
          </div>
        </div>
        <div className="text-7xl font-black font-mono text-black leading-none tabular-nums tracking-tighter">{value}</div>
      </div>

      <Slider 
        value={[value]} 
        onValueChange={(val) => onChange(val[0])} 
        max={100} 
        step={1}
        disabled={disabled}
        className="py-6"
      />

      <div className="flex justify-between items-center gap-4 px-2">
        <div className={`text-sm font-black transition-all duration-300 flex flex-col items-start ${value <= 20 ? 'text-red-500 scale-110 opacity-100' : 'text-neutral-200 opacity-60'}`}>
          <span className="text-[10px] text-neutral-300">極めて</span>
          <span className="break-words max-w-[120px]">{labelMin}</span>
        </div>
        <div className={`text-sm font-black transition-all duration-300 flex flex-col items-end text-right ${value >= 80 ? 'text-emerald-500 scale-110 opacity-100' : 'text-neutral-200 opacity-60'}`}>
          <span className="text-[10px] text-neutral-300">極めて</span>
          <span className="break-words max-w-[120px]">{labelMax}</span>
        </div>
      </div>

      <p className="text-xs text-center text-neutral-400 font-bold bg-neutral-100 py-3 rounded-xl border border-neutral-200">
        スライダーを離すと全員のリストが更新されます
      </p>
    </div>
  );
}
