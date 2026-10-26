"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchProducts, fetchSettings, fetchCategories, defaultSettings } from "@/lib/data";
import type { Product, Settings, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

function Row({ title, products, shopAll }: { title: string; products: Product[]; shopAll: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (products.length === 0) return null;
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl">{title}</h2>
        <Link href={shopAll} className="text-sm font-semibold text-neutral-500">View All</Link>
      </div>
      <div className="relative mt-4">
        <button onClick={() => scroll(-1)} className="hidden sm:flex absolute -left-3 top-1/3 z-10 w-9 h-9 bg-white shadow rounded-full items-center justify-center">‹</button>
        <div ref={ref} className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible no-scrollbar snap-x pb-2">
          {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <button onClick={() => scroll(1)} className="hidden sm:flex absolute -right-3 top-1/3 z-10 w-9 h-9 bg-white shadow rounded-full items-center justify-center">›</button>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [slide, setSlide] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {});
    fetchSettings().then(setSettings).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % Math.max(1, settings.hero_banners.length)), 4500);
    return () => clearInterval(t);
  }, [settings.hero_banners.length]);

  const banners = settings.hero_banners;
  const banner = banners[slide] || banners[0];
  const featured = products.filter(p => p.featured);

  return (
    <div className="pb-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search (like the reference app's home search) */}
        <form className="mt-4 flex items-center bg-white border border-neutral-200 rounded-full overflow-hidden" onSubmit={e => { e.preventDefault(); if (q.trim()) window.location.href = `/shop?q=${encodeURIComponent(q.trim())}`; }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search for shirts, brands..." className="px-4 py-2.5 text-sm outline-none flex-1" />
          <button className="px-4 text-lg" aria-label="Search">🔍</button>
        </form>

        {/* HERO — beige panel, text left, image right (reference style) */}
        {banner && (
          <div className="mt-4 bg-blush rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-6 sm:p-10 flex flex-col justify-center">
                <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight">{banner.headline}</h1>
                <p className="text-neutral-600 mt-3">{banner.subheadline}</p>
                <div className="mt-6">
                  <Link href={banner.link || "/shop"} className="inline-block bg-neutral-900 text-white font-bold px-7 py-3 rounded-full text-sm">SHOP NOW</Link>
                </div>
                <div className="flex gap-2 mt-8">
                  {banners.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-neutral-900" : "w-3 bg-neutral-300"}`} aria-label={`Slide ${i + 1}`} />)}
                </div>
              </div>
              <div className="relative h-64 md:h-auto md:min-h-[380px] bg-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.image} alt={banner.headline} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}

        {/* Trust row (like the reference app) */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-2xl py-4 px-2"><p className="text-xl">🛡️</p><p className="text-xs sm:text-sm font-semibold mt-1">Premium Quality</p></div>
          <div className="bg-white rounded-2xl py-4 px-2"><p className="text-xl">🔁</p><p className="text-xs sm:text-sm font-semibold mt-1">Easy Returns</p></div>
          <div className="bg-white rounded-2xl py-4 px-2"><p className="text-xl">🔒</p><p className="text-xs sm:text-sm font-semibold mt-1">Secure Payment</p></div>
        </div>

        {/* Shop By Category — circles (reference style) */}
        {categories.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-2xl">Shop By Category</h2>
              <Link href="/shop" className="text-sm font-semibold text-neutral-500">View All</Link>
            </div>
            <div className="flex gap-5 mt-4 overflow-x-auto no-scrollbar pb-1">
              {categories.map(c => {
                const first = products.find(p => p.category === c.slug);
                return (
                  <Link key={c.slug} href={`/shop?category=${c.slug}`} className="flex flex-col items-center gap-2 shrink-0">
                    <span className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-blush flex items-center justify-center">
                      {first
                        ? <img src={first.image_url} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                        : <span className="font-display font-bold text-2xl">{c.name.charAt(0)}</span>}
                    </span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Row title="Best Sellers" products={featured.length ? featured : products} shopAll="/shop" />
      <Row title="New Arrival" products={products} shopAll="/shop?sort=new" />
    </div>
  );
}
