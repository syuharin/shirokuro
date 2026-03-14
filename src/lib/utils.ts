import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges CSS classes using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomId(): string {
  // Simple random string generation for URL-friendly IDs (e.g., 'abcd-1234')
  const part1 = Math.random().toString(36).substring(2, 6);
  const part2 = Math.random().toString(36).substring(2, 6);
  return `${part1}-${part2}`;
}

const STORAGE_PREFIX = "shirokuro-";

export interface SessionData {
  peerId: string | null;
  name: string | null;
  value: number | null;
  isAnchor: boolean | null;
  roomId: string | null;
}

export function saveSession(data: Partial<SessionData>) {
  if (typeof window === "undefined" || !window.sessionStorage) return;

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
  const emptySession = { peerId: null, name: null, value: null, isAnchor: null, roomId: null };

  if (typeof window === "undefined" || !window.sessionStorage) {
    return emptySession;
  }

  try {
    const storedRoomId = sessionStorage.getItem(`${STORAGE_PREFIX}roomId`);

    // If the room ID doesn't match, we shouldn't use the stored session
    if (storedRoomId !== roomId) {
      return emptySession;
    }

    const peerId = sessionStorage.getItem(`${STORAGE_PREFIX}peerId`);
    const name = sessionStorage.getItem(`${STORAGE_PREFIX}name`);
    const valueStr = sessionStorage.getItem(`${STORAGE_PREFIX}value`);
    const isAnchorStr = sessionStorage.getItem(`${STORAGE_PREFIX}isAnchor`);

    return {
      peerId,
      name,
      value: valueStr ? parseFloat(valueStr) : null,
      isAnchor: isAnchorStr === "true",
      roomId: storedRoomId
    };
  } catch (e) {
    console.warn("Failed to load session from sessionStorage:", e);
    return emptySession;
  }
}

export function clearSession() {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  try {
    const keysToRemove = ["peerId", "name", "value", "isAnchor", "roomId"];
    keysToRemove.forEach(key => sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`));
  } catch (e) {
    console.error("Failed to clear session:", e);
  }
}
