"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProducts, discountPct, effectivePrice, formatBDT } from "@/lib/data";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const params = useParams();
  const id = String(params.id);
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(all => {
      const p = all.find(x => x.id === id) || null;
      setProduct(p);
      if (p) { setSize(p.sizes[0] || "M"); setRelated(all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4)); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center py-16">Loading...</p>;
  if (!product) return <div className="text-center py-16"><p>Product not found.</p><Link href="/shop" className="text-brand font-bold">Back to Shop</Link></div>;
  const pct = discountPct(product);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative rounded-2xl overflow-hidden bg-neutral-100 aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          {pct > 0 && <span className="absolute top-3 left-3 w-12 h-12 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">-{pct}%</span>}
        </div>
        <div>
          <p className="text-sm uppercase text-neutral-500">{product.category_name}</p>
          <h1 className="font-display font-black text-3xl mt-1">{product.name}</h1>
          <div className="mt-3">
            {pct > 0 && <span className="text-neutral-400 line-through text-lg mr-2">{formatBDT(product.price)}</span>}
            <span className="text-brand font-extrabold text-2xl">{formatBDT(effectivePrice(product))}</span>
          </div>
          <p className="text-neutral-600 mt-4">{product.description}</p>
          <p className="mt-3 text-sm">{product.stock > 0 ? <span className="text-green-600 font-semibold">In Stock ({product.stock})</span> : <span className="text-red-600 font-semibold">Stock Out</span>}</p>
          <div className="mt-4">
            <p className="font-semibold text-sm mb-2">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-full border font-semibold ${size === s ? "bg-neutral-900 text-white" : "border-neutral-300"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-semibold text-sm">Qty</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 border rounded-full">-</button>
            <span className="font-bold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 border rounded-full">+</button>
          </div>
          <button disabled={product.stock <= 0} onClick={() => add({ product_id: product.id, name: product.name, image_url: product.image_url, price: effectivePrice(product), size, qty })} className="mt-6 w-full bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white font-bold py-3.5 rounded-full">ADD TO CART</button>
          <div className="mt-4 text-sm text-neutral-600 border rounded-2xl p-3">💵 Cash on Delivery available • 🚚 Dhaka ৳60 / Outside ৳120 • 🔁 7-day exchange</div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-center font-display font-black uppercase text-2xl text-brand">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
