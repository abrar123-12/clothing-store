// Guest-friendly wishlist stored in localStorage (no account needed).
// Any component can listen for "kapor-wishlist-changed" to refresh its badge.
const KEY = "kapor-wishlist";
export const WISHLIST_EVENT = "kapor-wishlist-changed";

export function getWishlist(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(id: string): boolean {
  return getWishlist().includes(String(id));
}

export function toggleWishlist(id: string): boolean {
  const list = getWishlist();
  const sid = String(id);
  const next = list.includes(sid) ? list.filter(x => x !== sid) : [...list, sid];
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  try { window.dispatchEvent(new Event(WISHLIST_EVENT)); } catch {}
  return next.includes(sid);
}
