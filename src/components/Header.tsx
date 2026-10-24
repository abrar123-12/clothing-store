"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { fetchCategories, fetchSettings } from "@/lib/data";
import type { Category, Settings } from "@/lib/types";
import { defaultSettings, seedCategories } from "@/lib/data";

export default function Header() {
  const { subtotal, count, setOpen } = useCart();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [cats, setCats] = useState<Category[]>(seedCategories);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    fetchCategories().then(setCats).catch(() => {});
    supabase?.auth.getSession().then(({ data }) => setLoggedIn(!!data.session)).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <button className="lg:hidden text-2xl" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
        <Link href="/" className="font-display font-black text-2xl sm:text-3xl tracking-tight text-brand uppercase">
          {settings.store_name}<span className="text-neutral-900 text-sm align-top ml-1 hidden sm:inline">LIFESTYLE</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 mx-auto font-display font-bold uppercase text-sm">
          {cats.map(c => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} className="hover:text-brand">{c.name}</Link>
          ))}
          <Link href="/track" className="hover:text-brand">Track Order</Link>
        </nav>
        <form className="hidden md:flex items-center border rounded-full overflow-hidden ml-auto" onSubmit={e => { e.preventDefault(); if (q.trim()) window.location.href = `/shop?q=${encodeURIComponent(q.trim())}`; }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="px-3 py-1.5 text-sm outline-none w-32" />
          <button className="px-3 text-lg" aria-label="Search">🔍</button>
        </form>
        <Link href={loggedIn ? "/account" : "/login"} className="text-xl ml-auto md:ml-0" aria-label="Account">👤</Link>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1 bg-neutral-900 text-white text-sm font-bold px-3 py-2 rounded-full">
          🛒 <span>{subtotal.toLocaleString("en-IN")} BDT</span>
          {count > 0 && <span className="bg-brand rounded-full w-5 h-5 text-xs flex items-center justify-center">{count}</span>}
        </button>
      </div>
      {menu && (
        <nav className="lg:hidden border-t px-4 py-3 flex flex-col gap-2 font-display font-bold uppercase text-sm bg-white">
          <form className="flex items-center border rounded-full overflow-hidden mb-1" onSubmit={e => { e.preventDefault(); if (q.trim()) window.location.href = `/shop?q=${encodeURIComponent(q.trim())}`; }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="px-3 py-2 text-sm outline-none flex-1 normal-case font-sans font-normal" />
            <button className="px-3" aria-label="Search">🔍</button>
          </form>
          {cats.map(c => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMenu(false)}>{c.name}</Link>
          ))}
          <Link href="/shop" onClick={() => setMenu(false)}>All Products</Link>
          <Link href="/track" onClick={() => setMenu(false)}>Track Order</Link>
        </nav>
      )}
    </header>
  );
}
