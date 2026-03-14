"use client";

import { Wifi, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NameInput } from "@/components/NameInput";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  roomId: string;
  name: string;
  onNameChange: (name: string) => void;
  connectionStatus: 'connecting' | 'connected' | 'error';
}

export function Header({ roomId, name, onNameChange, connectionStatus }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const currentUrl = mounted ? window.location.href : "";

  const copyUrl = () => {

    if (typeof window !== "undefined") {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
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
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg border-neutral-200 hover:bg-neutral-50 hover:text-black shrink-0"
                title="QRコードを表示"
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-6 bg-white border-neutral-200 shadow-xl rounded-2xl" align="end">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-2 rounded-xl border border-neutral-100 shadow-sm">
                  {currentUrl && (
                    <QRCode
                      value={currentUrl}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-black">スキャンして参加</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-1 break-all max-w-[200px]">
                    {currentUrl}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

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
      </div>
    </header>
  );
}
