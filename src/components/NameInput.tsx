"use client";

import { Input } from "@/components/ui/input";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NameInput({ value, onChange, disabled }: NameInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Display Name</label>
      <Input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-neutral-950 border-neutral-700 text-neutral-100" 
        placeholder="Enter your name"
      />
    </div>
  );
}
