"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { fetchSettings, formatBDT } from "@/lib/data";
import { defaultSettings } from "@/lib/data";
import type { Settings } from "@/lib/types";

export default function CartDrawer() {
  const { items, subtotal, setQty, remove, open, setOpen } = useCart();
  const [s, setS] = useState<Settings>(defaultSettings);
  useEffect(() => { if (open) fetchSettings().then(setS).catch(() => {}); }, [open ]);
  if (!open) return null;
  const free = subtotal >= s.free_threshold;
  const progress = Math.min(100, Math.round((subtotal / Math.max(1, s.free_threshold)) * 100));
  const delivery = items.length === 0 ? 0 : free ? 0 : s.delivery_dhaka;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-[92vw] max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display font-extrabold uppercase">Your Cart</h3>
          <button onClick={() => setOpen(false)} className="text-2xl" aria-label="Close">×</button>
        </div>
        <div className="px-4 pt-3">
          {free ? (
            <p className="text-green-600 text-sm font-semibold">🎉 You got FREE delivery!</p>
          ) : (
            <p className="text-sm text-neutral-600">Add {formatBDT(s.free_threshold - subtotal)} more for FREE delivery</p>
          )}
          <div className="h-2 bg-neutral-200 rounded-full mt-1 overflow-hidden"><div className="h-full bg-brand" style={{ width: progress + "%" }} /></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 && <p className="text-neutral-500 text-sm">Cart is empty.</p>}
          {items.map(it => (
            <div key={it.product_id + it.size} className="flex gap-3 border rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image_url} alt={it.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{it.name}</p>
                <p className="text-xs text-neutral-500">Size: {it.size}</p>
                <p className="text-brand font-bold text-sm">{formatBDT(it.price * it.qty)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setQty(it.product_id, it.size, it.qty - 1)} className="w-6 h-6 border rounded">-</button>
                  <span className="text-sm">{it.qty}</span>
                  <button onClick={() => setQty(it.product_id, it.size, it.qty + 1)} className="w-6 h-6 border rounded">+</button>
                  <button onClick={() => remove(it.product_id, it.size)} className="text-xs text-red-600 ml-2">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t text-sm">
          <div className="flex justify-between"><span>Subtotal</span><b>{formatBDT(subtotal)}</b></div>
          <div className="flex justify-between mt-1"><span>Delivery (Dhaka estimate)</span><b>{items.length === 0 ? formatBDT(0) : free ? "FREE" : formatBDT(delivery)}</b></div>
          <div className="flex justify-between mt-1 text-base"><span>Total</span><b className="text-brand">{formatBDT(subtotal + delivery)}</b></div>
          <Link href="/checkout" onClick={() => setOpen(false)} className="block text-center mt-3 bg-brand text-white font-bold py-3 rounded-full">CHECKOUT</Link>
        </div>
      </aside>
    </div>
  );
}
