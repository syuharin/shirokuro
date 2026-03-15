import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomId(): string {
  // Simple random string generation for URL-friendly IDs (e.g., 'abcd-1234')
  const part1 = Math.random().toString(36).substring(2, 6);
  const part2 = Math.random().toString(36).substring(2, 6);
  return `${part1}-${part2}`;
}

const STORAGE_PREFIX = "shirokuro_";

export interface SessionData {
  peerId: string | null;
  name: string | null;
  value: number | null;
  isAnchor: boolean | null;
  roomId: string | null;
  joinTimestamp: number | null;
}

export function saveSession(data: Partial<SessionData>) {
  if (typeof window === "undefined") return;
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      try {
        sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, value.toString());
      } catch (e) {
        console.error(`Failed to save ${key} to sessionStorage. This may be due to private mode or storage limits:`, e);
      }
    }
  });
}

export function loadSession(roomId: string): SessionData {
  if (typeof window === "undefined") {
    return { peerId: null, name: null, value: null, isAnchor: null, roomId: null, joinTimestamp: null };
  }

  const storedRoomId = sessionStorage.getItem(`${STORAGE_PREFIX}roomId`);
  
  // If the room ID doesn't match, we shouldn't use the stored session
  if (storedRoomId !== roomId) {
    return { peerId: null, name: null, value: null, isAnchor: null, roomId: null, joinTimestamp: null };
  }

  const peerId = sessionStorage.getItem(`${STORAGE_PREFIX}peerId`);
  const name = sessionStorage.getItem(`${STORAGE_PREFIX}name`);
  const valueStr = sessionStorage.getItem(`${STORAGE_PREFIX}value`);
  const isAnchorStr = sessionStorage.getItem(`${STORAGE_PREFIX}isAnchor`);
  const joinTimestampStr = sessionStorage.getItem(`${STORAGE_PREFIX}joinTimestamp`);

  return {
    peerId,
    name,
    value: valueStr ? parseFloat(valueStr) : null,
    isAnchor: isAnchorStr === null ? null : isAnchorStr === "true",
    roomId: storedRoomId,
    joinTimestamp: joinTimestampStr ? parseInt(joinTimestampStr, 10) : null
  };
}

export function clearSession() {
  if (typeof window === "undefined") return;
  
  const keysToRemove = ["peerId", "name", "value", "isAnchor", "roomId", "joinTimestamp"];
  keysToRemove.forEach(key => sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`));
}
