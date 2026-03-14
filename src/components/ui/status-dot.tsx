import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: 'online' | 'reconnecting' | 'offline';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <div 
      className={cn(
        "w-2 h-2 rounded-full",
        status === 'online' && "bg-green-500",
        status === 'reconnecting' && "bg-yellow-500 animate-pulse",
        status === 'offline' && "bg-neutral-300",
        className
      )}
      title={status}
    />
  );
}
