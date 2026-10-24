"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { fetchSettings, formatBDT, defaultSettings } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Settings } from "@/lib/types";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [s, setS] = useState<Settings>(defaultSettings);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState<"dhaka" | "outside">("dhaka");
  const [payment, setPayment] = useState("COD");
  const [trx, setTrx] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);

  useEffect(() => { fetchSettings().then(setS).catch(() => {}); }, []);

  const free = subtotal >= s.free_threshold && items.length > 0;
  const delivery = items.length === 0 ? 0 : free ? 0 : area === "dhaka" ? s.delivery_dhaka : s.delivery_outside;
  const total = subtotal + delivery;

  const placeOrder = async () => {
    setError("");
    if (items.length === 0) return setError("Your cart is empty.");
    if (name.trim().length < 3) return setError("Please give your full name.");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setError("Please give a valid BD phone number (01xxxxxxxxx).");
    if (address.trim().length < 8) return setError("Please give your full address.");
    if ((payment === "bKash" || payment === "Nagad") && trx.trim().length < 5) return setError("Please give the TrxID after sending money.");

    if (!supabase) {
      setPlacedId("DEMO-" + Date.now().toString().slice(-6));
      clear();
      return;
    }
    setPlacing(true);
    // Generate the order id client-side: anon customers may INSERT orders but
    // (by design) cannot SELECT them back, so .select() after insert would
    // fail the orders SELECT policy. No returning read is needed.
    const oid = crypto.randomUUID();
    // Logged-in customers get their order linked to their account so it
    // shows in /account; guest orders stay phone-trackable via /track.
    const { data: { session } } = await supabase.auth.getSession();
    const { error: e1 } = await supabase.from("orders").insert({
      id: oid,
      user_id: session?.user.id ?? null,
      customer_name: name.trim(), phone: phone.trim(), address: address.trim(), area,
      payment_method: payment, payment_trx: trx.trim() || null,
      subtotal, delivery_charge: delivery, total, status: "Pending"
    });
    if (e1) { setPlacing(false); return setError("Order failed: " + e1.message); }
    const rows = items.map(it => ({ order_id: oid, product_id: it.product_id, product_name: it.name, size: it.size, price: it.price, qty: it.qty }));
    const { error: e2 } = await supabase.from("order_items").insert(rows);
    setPlacing(false);
    if (e2) return setError("Order saved but items failed: " + e2.message);
    setPlacedId(oid);
    clear();
  };

  if (placedId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="font-display font-black text-3xl mt-4">Order Placed!</h1>
        <p className="mt-2 text-neutral-600">Order ID: <b>{placedId}</b></p>
        <p className="mt-1 text-neutral-600">We will call you to confirm. Track anytime with your phone number.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/track" className="bg-brand text-white font-bold px-6 py-3 rounded-full">Track Order</Link>
          <Link href="/shop" className="border font-bold px-6 py-3 rounded-full">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <h1 className="font-display font-black uppercase text-2xl text-brand">Checkout</h1>
        <div className="flex flex-col gap-3 mt-5">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="border rounded-xl px-4 py-3" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (01xxxxxxxxx)" className="border rounded-xl px-4 py-3" inputMode="tel" />
          <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address (house, road, area, thana)" className="border rounded-xl px-4 py-3" rows={3} />
          <div className="flex gap-2">
            <button onClick={() => setArea("dhaka")} className={`flex-1 py-3 rounded-xl border font-semibold ${area === "dhaka" ? "bg-neutral-900 text-white" : ""}`}>Inside Dhaka (৳{s.delivery_dhaka})</button>
            <button onClick={() => setArea("outside")} className={`flex-1 py-3 rounded-xl border font-semibold ${area === "outside" ? "bg-neutral-900 text-white" : ""}`}>Outside Dhaka (৳{s.delivery_outside})</button>
          </div>
          <p className="font-semibold mt-2">Payment Method</p>
          {["COD", "bKash", "Nagad"].map(m => (
            <label key={m} className={`border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer ${payment === m ? "border-brand bg-brand-light" : ""}`}>
              <input type="radio" name="pay" checked={payment === m} onChange={() => setPayment(m)} />
              <span className="font-semibold">{m === "COD" ? "Cash on Delivery" : m}</span>
              {m === "bKash" && s.bkash_number && <span className="text-sm text-neutral-500">Send Money: {s.bkash_number}</span>}
              {m === "Nagad" && s.nagad_number && <span className="text-sm text-neutral-500">Send Money: {s.nagad_number}</span>}
            </label>
          ))}
          {(payment === "bKash" || payment === "Nagad") && (
            <input value={trx} onChange={e => setTrx(e.target.value)} placeholder="Transaction ID (TrxID)" className="border rounded-xl px-4 py-3" />
          )}
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          <button onClick={placeOrder} disabled={placing} className="bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white font-bold py-3.5 rounded-full mt-1">{placing ? "Placing..." : `PLACE ORDER — ${formatBDT(total)}`}</button>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="border rounded-2xl p-4">
          <h3 className="font-display font-extrabold uppercase">Order Summary</h3>
          <div className="flex flex-col gap-3 mt-3">
            {items.map(it => (
              <div key={it.product_id + it.size} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image_url} alt={it.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm"><p className="font-semibold">{it.name}</p><p className="text-neutral-500">Size {it.size} × {it.qty}</p></div>
                <b className="text-sm">{formatBDT(it.price * it.qty)}</b>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-neutral-500">Cart is empty. <Link href="/shop" className="text-brand font-bold">Shop now</Link></p>}
          </div>
          <div className="border-t mt-4 pt-3 text-sm flex flex-col gap-1">
            <div className="flex justify-between"><span>Subtotal</span><b>{formatBDT(subtotal)}</b></div>
            <div className="flex justify-between"><span>Delivery</span><b>{free ? "FREE" : formatBDT(delivery)}</b></div>
            <div className="flex justify-between text-base"><span>Total</span><b className="text-brand">{formatBDT(total)}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
