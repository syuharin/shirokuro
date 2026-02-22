import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomId(): string {
  // Simple random string generation for URL-friendly IDs (e.g., 'abc-123-xyz')
  return Math.random().toString(36).substring(2, 10);
}
