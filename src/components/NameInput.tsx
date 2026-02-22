"use client";

import { Input } from "@/components/ui/input";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NameInput({ value, onChange, disabled }: NameInputProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-neutral-400 uppercase tracking-widest">表示名</label>
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-neutral-50 border-neutral-200 text-black font-bold h-12 rounded-xl focus-visible:ring-black" 
        placeholder="名前を入力してください"
      />
      <p className="text-xs text-neutral-400 font-medium">名前はサーバーに保存されません</p>
    </div>
  );
}
