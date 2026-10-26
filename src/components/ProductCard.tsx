"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPct, effectivePrice, formatBDT } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import WishlistButton from "@/components/WishlistButton";

// Premium card, like the reference app: tall image, heart, name, category,
// price + old price. Size pills + quick add kept from the old card.
export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0] || "M");
  const pct = discountPct(product);
  return (
    <div className="bg-white rounded-2xl overflow-hidden shrink-0 snap-start w-[calc(50%-8px)] sm:w-auto">
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        {pct > 0 && (
          <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[11px] font-bold px-2 py-1 rounded-md">-{pct}%</span>
        )}
        <WishlistButton id={product.id} className="absolute top-2 right-2" />
        {product.stock <= 0 && <span className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">Stock Out</span>}
      </Link>
      <div className="p-3">
        <Link href={`/product/${product.id}`} className="block font-semibold text-sm leading-tight">{product.name}</Link>
        <p className="text-xs text-neutral-500 mt-0.5">{product.category_name}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-extrabold">{formatBDT(effectivePrice(product))}</span>
          {pct > 0 && <span className="text-neutral-400 line-through text-xs">{formatBDT(product.price)}</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {product.sizes.slice(0, 5).map(s => (
            <button key={s} onClick={() => setSize(s)} className={`text-[11px] px-2 py-0.5 rounded-full border ${size === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600"}`}>{s}</button>
          ))}
        </div>
        <button
          disabled={product.stock <= 0}
          onClick={() => add({ product_id: product.id, name: product.name, image_url: product.image_url, price: effectivePrice(product), size, qty: 1 })}
          className="mt-2.5 w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-300 text-white text-sm font-bold py-2.5 rounded-full"
        >ADD TO CART</button>
      </div>
    </div>
  );
}
