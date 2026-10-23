"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProducts, discountPct } from "@/lib/data";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const ALL_SIZES = ["S", "M", "L", "XL", "Free"];

function ShopInner() {
  const sp = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState(sp.get("category") || "all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState(sp.get("sort") || "new");
  const [q, setQ] = useState(sp.get("q") || "");

  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}); }, []);
  useEffect(() => { setCategory(sp.get("category") || "all"); setQ(sp.get("q") || ""); if (sp.get("sort")) setSort(sp.get("sort")!); }, [sp]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "all") list = list.filter(p => p.category === category);
    if (size !== "all") list = list.filter(p => p.sizes.includes(size));
    if (q.trim()) list = list.filter(p => p.name.toLowerCase().includes(q.trim().toLowerCase()));
    if (sort === "price-low") list.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    if (sort === "price-high") list.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    if (sort === "discount") list.sort((a, b) => discountPct(b) - discountPct(a));
    return list;
  }, [products, category, size, sort, q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display font-black uppercase text-3xl text-center text-brand">Shop</h1>
      <div className="flex flex-wrap gap-2 justify-center mt-5">
        {["all", "men", "women", "accessories", "kids"].map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full border font-semibold text-sm uppercase ${category === c ? "bg-brand text-white border-brand" : "border-neutral-300"}`}>{c}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="border rounded-full px-4 py-2 text-sm w-56" />
        <select value={size} onChange={e => setSize(e.target.value)} className="border rounded-full px-3 py-2 text-sm">
          <option value="all">All Sizes</option>
          {ALL_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="border rounded-full px-3 py-2 text-sm">
          <option value="new">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>
      <p className="text-center text-sm text-neutral-500 mt-4">{filtered.length} products found</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-neutral-500 mt-10">No products match. Try another filter.</p>}
    </div>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<p className="text-center py-10">Loading...</p>}><ShopInner /></Suspense>;
}
