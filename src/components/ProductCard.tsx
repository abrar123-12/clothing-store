"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPct, effectivePrice, formatBDT } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0] || "M");
  const pct = discountPct(product);
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition overflow-hidden w-[220px] sm:w-auto shrink-0 snap-start">
      <Link href={`/product/${product.id}`} className="block relative aspect-square bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        {pct > 0 && (
          <span className="absolute top-2 left-2 w-11 h-11 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">-{pct}%</span>
        )}
        {product.stock <= 0 && <span className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">Stock Out</span>}
      </Link>
      <div className="p-3 text-center">
        <div className="flex flex-wrap justify-center gap-1 mb-2">
          {product.sizes.slice(0, 5).map(s => (
            <button key={s} onClick={() => setSize(s)} className={`text-[11px] px-2 py-0.5 rounded-full border ${size === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600"}`}>{s}</button>
          ))}
        </div>
        <Link href={`/product/${product.id}`} className="block font-semibold text-sm leading-tight min-h-[36px]">{product.name}</Link>
        <div className="mt-1">
          {pct > 0 && <span className="text-neutral-400 line-through text-sm mr-2">{formatBDT(product.price)}</span>}
          <span className="text-brand font-extrabold">{formatBDT(effectivePrice(product))}</span>
        </div>
        <button
          disabled={product.stock <= 0}
          onClick={() => add({ product_id: product.id, name: product.name, image_url: product.image_url, price: effectivePrice(product), size, qty: 1 })}
          className="mt-2 w-full bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white text-sm font-bold py-2 rounded-full"
        >ADD TO CART</button>
      </div>
    </div>
  );
}
