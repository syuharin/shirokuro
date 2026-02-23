"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant?: "default" | "header";
  className?: string;
}

export function NameInput({ value, onChange, disabled, variant = "default", className }: NameInputProps) {
  if (variant === "header") {
    return (
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "bg-transparent border-none text-black font-bold h-9 rounded-lg focus-visible:ring-0 focus:bg-neutral-100/50 hover:bg-neutral-100/50 transition-colors w-full md:w-48 text-sm px-2", 
          className
        )}
        placeholder="名前を入力"
      />
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-neutral-400 uppercase tracking-widest">表示名</label>
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn("bg-neutral-50 border-neutral-200 text-black font-bold h-12 rounded-xl focus-visible:ring-black", className)} 
        placeholder="名前を入力してください"
      />
      <p className="text-xs text-neutral-400 font-medium">名前はサーバーに保存されません</p>
    </div>
  );
}
