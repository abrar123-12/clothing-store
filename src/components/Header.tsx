"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { fetchCategories, fetchSettings } from "@/lib/data";
import { getWishlist, WISHLIST_EVENT } from "@/lib/wishlist";
import type { Category, Settings } from "@/lib/types";
import { defaultSettings, seedCategories } from "@/lib/data";

export default function Header() {
  const { subtotal, count, setOpen } = useCart();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [cats, setCats] = useState<Category[]>(seedCategories);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [wishCount, setWishCount] = useState(0);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    fetchCategories().then(setCats).catch(() => {});
    supabase?.auth.getSession().then(({ data }) => setLoggedIn(!!data.session)).catch(() => {});
    const refresh = () => setWishCount(getWishlist().length);
    refresh();
    window.addEventListener(WISHLIST_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener(WISHLIST_EVENT, refresh); window.removeEventListener("focus", refresh); };
  }, []);

  const goSearch = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) window.location.href = `/shop?q=${encodeURIComponent(q.trim())}`; };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <button className="lg:hidden text-2xl" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
        <Link href="/" className="font-display font-bold text-[22px] sm:text-2xl tracking-[0.25em] uppercase leading-none">
          {settings.store_name}
        </Link>
        <form className="hidden md:flex items-center bg-neutral-100 rounded-full overflow-hidden mx-auto w-72 lg:w-96" onSubmit={goSearch}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search for shirts, brands..." className="px-4 py-2 text-sm outline-none flex-1 bg-transparent" />
          <button className="px-3 text-lg" aria-label="Search">🔍</button>
        </form>
        <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
          <Link href="/wishlist" className="relative text-xl px-1" aria-label="Wishlist">🤍{wishCount > 0 && <span className="absolute -top-1 -right-1 bg-neutral-900 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{wishCount}</span>}</Link>
          <Link href={loggedIn ? "/account" : "/login"} className="text-xl px-1" aria-label="Account">👤</Link>
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 bg-neutral-900 text-white text-sm font-bold px-3 py-2 rounded-full">
            🛒 <span className="hidden sm:inline">{subtotal.toLocaleString("en-IN")} BDT</span>
            {count > 0 && <span className="bg-white text-neutral-900 rounded-full w-5 h-5 text-xs flex items-center justify-center">{count}</span>}
          </button>
        </div>
      </div>
      {/* Category pills (like the reference app's tab row) */}
      <div className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          <Link href="/shop" className="whitespace-nowrap text-sm font-semibold px-3 py-1 rounded-full bg-neutral-900 text-white">All</Link>
          {cats.map(c => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="whitespace-nowrap text-sm font-semibold px-3 py-1 rounded-full border border-neutral-200 text-neutral-700">{c.name}</Link>
          ))}
          <Link href="/track" className="whitespace-nowrap text-sm font-semibold px-3 py-1 rounded-full border border-neutral-200 text-neutral-700">Track Order</Link>
        </div>
      </div>
      {menu && (
        <nav className="lg:hidden border-t px-4 py-3 flex flex-col gap-2 font-bold uppercase text-sm bg-white">
          <form className="flex items-center bg-neutral-100 rounded-full overflow-hidden mb-1" onSubmit={goSearch}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="px-4 py-2 text-sm outline-none flex-1 bg-transparent normal-case font-sans font-normal" />
            <button className="px-3" aria-label="Search">🔍</button>
          </form>
          {cats.map(c => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMenu(false)}>{c.name}</Link>
          ))}
          <Link href="/shop" onClick={() => setMenu(false)}>All Products</Link>
          <Link href="/wishlist" onClick={() => setMenu(false)}>Wishlist</Link>
          <Link href="/track" onClick={() => setMenu(false)}>Track Order</Link>
        </nav>
      )}
    </header>
  );
}
