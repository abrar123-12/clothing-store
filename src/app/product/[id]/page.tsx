"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProducts, discountPct, effectivePrice, formatBDT } from "@/lib/data";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import WishlistButton from "@/components/WishlistButton";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const { add, setOpen } = useCart();
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
  if (!product) return <div className="text-center py-16"><p>Product not found.</p><Link href="/shop" className="font-bold">Back to Shop</Link></div>;
  const pct = discountPct(product);
  const item = { product_id: product.id, name: product.name, image_url: product.image_url, price: effectivePrice(product), size, qty };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link href="/shop" className="text-sm font-semibold text-neutral-500">← Back to Shop</Link>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-100 aspect-[4/5] md:aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          {pct > 0 && <span className="absolute top-3 left-3 bg-neutral-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-md">{pct}% OFF</span>}
          <WishlistButton id={product.id} className="absolute top-3 right-3" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-500">{product.category_name}</p>
          <h1 className="font-display font-bold text-3xl mt-1 leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap">
            <span className="font-extrabold text-2xl">{formatBDT(effectivePrice(product))}</span>
            {pct > 0 && <><span className="text-neutral-400 line-through text-lg">{formatBDT(product.price)}</span><span className="bg-neutral-900 text-white text-xs font-bold px-2 py-1 rounded-md">{pct}% OFF</span></>}
          </div>
          <p className="text-neutral-600 mt-4">{product.description}</p>
          <p className="mt-3 text-sm">{product.stock > 0 ? <span className="text-green-600 font-semibold">In Stock ({product.stock})</span> : <span className="text-red-600 font-semibold">Stock Out</span>}</p>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Select Size</p>
              <span className="text-xs text-neutral-500 underline">Size guide</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-12 px-4 py-2.5 rounded-lg border font-semibold text-sm ${size === s ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 bg-white"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="font-semibold text-sm">Qty</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 border rounded-full bg-white">-</button>
            <span className="font-bold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 border rounded-full bg-white">+</button>
          </div>
          <div className="mt-6 flex gap-3">
            <button disabled={product.stock <= 0} onClick={() => add(item)} className="flex-1 border-2 border-neutral-900 disabled:border-neutral-300 disabled:text-neutral-400 font-bold py-3.5 rounded-full text-sm">🛒 Add to Cart</button>
            <button disabled={product.stock <= 0} onClick={() => { add(item); setOpen(false); router.push("/checkout"); }} className="flex-1 bg-neutral-900 hover:bg-black disabled:bg-neutral-300 text-white font-bold py-3.5 rounded-full text-sm">Buy Now</button>
          </div>
          <div className="mt-4 text-sm text-neutral-600 bg-white border border-neutral-200 rounded-2xl p-3">💵 Cash on Delivery available • 🚚 Dhaka ৳60 / Outside ৳120 • 🔁 7-day exchange</div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display font-bold text-2xl">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
