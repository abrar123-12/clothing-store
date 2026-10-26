"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProducts, fetchCategories, discountPct } from "@/lib/data";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const ALL_SIZES = ["S", "M", "L", "XL", "Free"];

function ShopInner() {
  const sp = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(sp.get("category") || "all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState(sp.get("sort") || "new");
  const [q, setQ] = useState(sp.get("q") || "");

  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}); fetchCategories().then(setCategories).catch(() => {}); }, []);
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

  const title = category === "all" ? "All Products" : (categories.find(c => c.slug === category)?.name || "Shop");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-3xl">{title}</h1>
      {/* Category tabs (reference style) */}
      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setCategory("all")} className={`whitespace-nowrap text-sm font-semibold px-4 py-1.5 rounded-full ${category === "all" ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-white text-neutral-700"}`}>All</button>
        {categories.map(c => (
          <button key={c.slug} onClick={() => setCategory(c.slug)} className={`whitespace-nowrap text-sm font-semibold px-4 py-1.5 rounded-full ${category === c.slug ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-white text-neutral-700"}`}>{c.name}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm w-full sm:w-56" />
        <select value={size} onChange={e => setSize(e.target.value)} className="border border-neutral-200 bg-white rounded-full px-3 py-2 text-sm">
          <option value="all">All Sizes</option>
          {ALL_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="border border-neutral-200 bg-white rounded-full px-3 py-2 text-sm">
          <option value="new">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>
      <p className="text-sm text-neutral-500 mt-4">{filtered.length} products found</p>
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
