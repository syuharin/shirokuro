"use client";

import { useEffect, useState } from 'react';
import { Crown, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'info' | 'error';

interface StatusNotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
}

export function StatusNotification({ message, type = 'info', duration = 5000, onClose }: StatusNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgClass = {
    success: 'bg-black text-white border-white/20',
    info: 'bg-neutral-900 text-white border-white/10',
    error: 'bg-red-600 text-white border-red-400',
  }[type];

  const Icon = type === 'success' ? Crown : Info;

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${bgClass} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <Icon className="w-6 h-6" />
      <p className="font-black text-lg tracking-tight">{message}</p>
      <button 
        onClick={() => { setVisible(false); if (onClose) onClose(); }}
        className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
