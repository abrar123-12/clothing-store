"use client";
import { useEffect, useState } from "react";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";

export default function WishlistButton({ id, className = "" }: { id: string; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isWishlisted(id)); }, [id]);
  return (
    <button
      aria-label="Toggle wishlist"
      onClick={e => { e.preventDefault(); e.stopPropagation(); setOn(toggleWishlist(id)); }}
      className={`w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-base ${className}`}
    >
      {on ? "❤️" : "🤍"}
    </button>
  );
}
