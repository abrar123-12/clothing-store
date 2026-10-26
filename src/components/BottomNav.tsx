"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { getWishlist, WISHLIST_EVENT } from "@/lib/wishlist";

// App-style bottom navigation (mobile only), like the reference app.
const ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/shop", label: "Categories", icon: "▦" },
  { href: "/wishlist", label: "Wishlist", icon: "🤍" },
  { href: "/track", label: "Orders", icon: "📦" },
  { href: "/account", label: "Account", icon: "👤" }
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const [wishCount, setWishCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const refresh = () => setWishCount(getWishlist().length);
    refresh();
    window.addEventListener(WISHLIST_EVENT, refresh);
    supabase?.auth.getSession().then(({ data }) => setLoggedIn(!!data.session)).catch(() => {});
    return () => window.removeEventListener(WISHLIST_EVENT, refresh);
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5">
        {ITEMS.map(it => {
          const href = it.label === "Account" && !loggedIn ? "/login" : it.href;
          const active = pathname === it.href || (it.href === "/shop" && pathname.startsWith("/shop")) || (it.href === "/account" && (pathname === "/account" || pathname === "/login"));
          const badge = it.label === "Wishlist" ? wishCount : it.label === "Home" ? 0 : 0;
          return (
            <Link key={it.label} href={href} className={`flex flex-col items-center py-2 text-[11px] font-semibold ${active ? "text-neutral-900" : "text-neutral-400"}`}>
              <span className="relative text-xl leading-none">{it.icon}{badge > 0 && <span className="absolute -top-1.5 -right-2.5 bg-neutral-900 text-white rounded-full min-w-4 h-4 px-0.5 text-[9px] flex items-center justify-center">{badge}</span>}</span>
              <span className="mt-1">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
