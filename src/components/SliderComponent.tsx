"use client";

import { Slider } from "@/components/ui/slider";

interface SliderComponentProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function SliderComponent({ value, onChange, disabled }: SliderComponentProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-neutral-400">
        <span>Intensity</span>
        <span className="font-mono text-xl font-bold text-neutral-100">{value}</span>
      </div>
      <Slider 
        value={[value]} 
        onValueChange={(val) => onChange(val[0])} 
        max={100} 
        step={1}
        disabled={disabled}
        className="py-4"
      />
    </div>
  );
}
