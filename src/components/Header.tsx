"use client";

import { Wifi, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NameInput } from "@/components/NameInput";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  roomId: string;
  name: string;
  onNameChange: (name: string) => void;
  connectionStatus: 'connecting' | 'connected' | 'error';
}

export function Header({ roomId, name, onNameChange, connectionStatus }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-3">
        <Wifi className={cn(
          "w-5 h-5 animate-pulse", 
          connectionStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500'
        )} />
        <div className="font-mono text-sm text-neutral-400 select-all">
          {roomId}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 w-full md:w-auto">
        <NameInput 
          value={name} 
          onChange={onNameChange} 
          variant="header"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyUrl} 
          className="gap-2 font-bold rounded-lg border-neutral-200 hover:bg-neutral-50 hover:text-black w-full md:w-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "コピー完了" : "共有"}
        </Button>
      </div>
    </header>
  );
}
