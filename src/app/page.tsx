"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchProducts, fetchSettings, defaultSettings } from "@/lib/data";
import type { Product, Settings } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const TILES = [
  { label: "99 DEALS", icon: "🎁", bg: "bg-red-50", link: "/shop?sort=discount" },
  { label: "HOT SALE", icon: "🔥", bg: "bg-orange-50", link: "/shop?sort=discount" },
  { label: "NEW ARRIVAL", icon: "✨", bg: "bg-neutral-100", link: "/shop?sort=new" },
  { label: "FORMAL FEST", icon: "👔", bg: "bg-amber-50", link: "/shop?category=men" }
];

function Section({ title, products, shopAll }: { title: string; products: Product[]; shopAll: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (products.length === 0) return null;
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <h2 className="text-center font-display font-black uppercase text-2xl sm:text-3xl text-brand">{title}</h2>
      <div className="relative mt-5">
        <button onClick={() => scroll(-1)} className="hidden sm:flex absolute -left-3 top-1/3 z-10 w-9 h-9 bg-white shadow rounded-full items-center justify-center">‹</button>
        <div ref={ref} className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible no-scrollbar snap-x pb-2">
          {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <button onClick={() => scroll(1)} className="hidden sm:flex absolute -right-3 top-1/3 z-10 w-9 h-9 bg-white shadow rounded-full items-center justify-center">›</button>
      </div>
      <div className="text-center mt-4">
        <Link href={shopAll} className="inline-block border-2 border-brand text-brand font-bold px-6 py-2 rounded-full hover:bg-brand hover:text-white transition">Shop All</Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {});
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % Math.max(1, settings.hero_banners.length)), 4500);
    return () => clearInterval(t);
  }, [settings.hero_banners.length]);

  const banners = settings.hero_banners;
  const men = products.filter(p => p.category === "men");
  const women = products.filter(p => p.category === "women");
  const featured = products.filter(p => p.featured);

  return (
    <div>
      {/* HERO CAROUSEL */}
      <div className="relative w-full h-[300px] sm:h-[440px] overflow-hidden bg-neutral-900">
        {banners.map((b, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image} alt={b.headline} className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="font-display font-black uppercase text-white text-3xl sm:text-5xl drop-shadow">{b.headline}</h1>
              <p className="text-white/90 mt-2 font-medium">{b.subheadline}</p>
              <Link href={b.link || "/shop"} className="mt-4 bg-brand text-white font-bold px-7 py-3 rounded-full">SHOP NOW</Link>
            </div>
          </div>
        ))}
        <button onClick={() => setSlide((slide - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full text-xl">‹</button>
        <button onClick={() => setSlide((slide + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full text-xl">›</button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`w-2.5 h-2.5 rounded-full ${i === slide ? "bg-brand" : "bg-white/70"}`} aria-label={`Slide ${i + 1}`} />)}
        </div>
      </div>

      {/* PROMO TILES */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TILES.map(t => (
          <Link key={t.label} href={t.link} className={`${t.bg} rounded-2xl p-4 flex items-center gap-3 border`}>
            <span className="text-3xl">{t.icon}</span>
            <span className="font-display font-extrabold uppercase">{t.label}</span>
          </Link>
        ))}
      </div>

      {/* TRUST STRIP */}
      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm font-semibold">
        <div className="border rounded-2xl py-3">💵 Cash on Delivery — All Bangladesh</div>
        <div className="border rounded-2xl py-3">🚚 Delivery: Dhaka ৳{settings.delivery_dhaka} / Outside ৳{settings.delivery_outside}</div>
        <div className="border rounded-2xl py-3">🔁 7-Day Easy Exchange</div>
      </div>

      <Section title="New Arrival" products={products} shopAll="/shop?sort=new" />
      <Section title="Best Selling" products={featured.length ? featured : products} shopAll="/shop" />
      <Section title="Mens Collection" products={men} shopAll="/shop?category=men" />
      <Section title="Ladies Collection" products={women} shopAll="/shop?category=women" />
    </div>
  );
}
