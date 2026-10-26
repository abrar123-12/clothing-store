"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/data";
import { getWishlist, WISHLIST_EVENT } from "@/lib/wishlist";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {});
    const refresh = () => setIds(getWishlist());
    refresh();
    window.addEventListener(WISHLIST_EVENT, refresh);
    return () => window.removeEventListener(WISHLIST_EVENT, refresh);
  }, []);

  const saved = products.filter(p => ids.includes(String(p.id)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-3xl">My Wishlist 🤍</h1>
      <p className="text-sm text-neutral-500 mt-1">{saved.length} saved item{saved.length === 1 ? "" : "s"}</p>
      {saved.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl">🤍</p>
          <p className="text-neutral-500 mt-3">No items saved yet. Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="inline-block mt-5 bg-neutral-900 text-white font-bold px-6 py-3 rounded-full text-sm">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {saved.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
