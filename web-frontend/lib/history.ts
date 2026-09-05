export interface VerificationHistoryItem {
  id: string;
  claim: string;
  verdict: string;
  confidence: number;
  virality_index: number;
  peak_hour?: string;
  spike_speed?: string;
  cooldown?: string;
  reason?: string;
  evidence_count: number;
  timestamp: string;
  createdAt: number;
  check_count?: number;
}

const STORAGE_PREFIX = "ti_history_";

export function getHistoryKey(userId?: string | null): string {
  if (!userId || userId.trim() === "") {
    return `${STORAGE_PREFIX}anonymous`;
  }
  return `${STORAGE_PREFIX}${userId.trim()}`;
}

export function getUserHistory(userId?: string | null): VerificationHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const key = getHistoryKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: VerificationHistoryItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sort descending by creation timestamp
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Failed to read user history from localStorage:", err);
    return [];
  }
}

export function saveClaimToHistory(
  userId: string | null | undefined,
  data: Omit<VerificationHistoryItem, "id" | "timestamp" | "createdAt" | "check_count">
): VerificationHistoryItem {
  const now = new Date();
  const normalizedClaim = data.claim.trim().toLowerCase();

  const formattedTimestamp = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (typeof window === "undefined") {
    return {
      ...data,
      id: `item_${Date.now()}`,
      timestamp: formattedTimestamp,
      createdAt: now.getTime(),
      check_count: 1,
    };
  }

  let finalItem: VerificationHistoryItem;

  try {
    const key = getHistoryKey(userId);
    const existing = getUserHistory(userId);

    // Look for existing item with the same news claim
    const matchIndex = existing.findIndex(
      (item) => item.claim.trim().toLowerCase() === normalizedClaim
    );

    if (matchIndex !== -1) {
      // Deduplicate: increment check_count and update with latest analysis metrics
      const prev = existing[matchIndex];
      const newCount = (prev.check_count || 1) + 1;

      finalItem = {
        ...prev,
        ...data,
        timestamp: formattedTimestamp,
        createdAt: now.getTime(),
        check_count: newCount,
      };

      // Move updated single card to top
      existing.splice(matchIndex, 1);
      existing.unshift(finalItem);
    } else {
      // First time checking this claim
      finalItem = {
        ...data,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: formattedTimestamp,
        createdAt: now.getTime(),
        check_count: 1,
      };
      existing.unshift(finalItem);
    }

    // Keep up to 100 recent verification records per user
    const bounded = existing.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(bounded));
  } catch (err) {
    console.error("Failed to save claim to history in localStorage:", err);
    finalItem = {
      ...data,
      id: `item_${Date.now()}`,
      timestamp: formattedTimestamp,
      createdAt: now.getTime(),
      check_count: 1,
    };
  }

  return finalItem;
}

export function deleteHistoryItem(userId: string | null | undefined, id: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = getHistoryKey(userId);
    const existing = getUserHistory(userId);
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete history item from localStorage:", err);
  }
}

export function clearUserHistory(userId: string | null | undefined): void {
  if (typeof window === "undefined") return;

  try {
    const key = getHistoryKey(userId);
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to clear user history from localStorage:", err);
  }
}
