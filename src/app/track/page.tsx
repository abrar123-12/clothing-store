"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/lib/data";
import type { Order } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800"
};

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setMsg(""); setOrders([]);
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setMsg("Give a valid phone number (01xxxxxxxxx).");
    if (!supabase) return setMsg("Store database is not connected yet. Admin: finish the Supabase setup in DEPLOY-GUIDE.md.");
    setLoading(true);
    const { data, error } = await supabase.rpc("track_orders", { p_phone: phone.trim() });
    setLoading(false);
    if (error) return setMsg("Error: " + error.message);
    const list = Array.isArray(data) ? (data as Order[]) : [];
    if (list.length === 0) return setMsg("No orders found for this number.");
    setOrders(list);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display font-black uppercase text-3xl text-center text-brand">Track Your Order</h1>
      <div className="flex gap-2 mt-6">
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number (01xxxxxxxxx)" className="border rounded-full px-4 py-3 flex-1" inputMode="tel" />
        <button onClick={search} disabled={loading} className="bg-brand text-white font-bold px-6 rounded-full">{loading ? "..." : "Track"}</button>
      </div>
      {msg && <p className="text-center mt-4 text-neutral-600">{msg}</p>}
      <div className="flex flex-col gap-4 mt-6">
        {orders.map(o => (
          <div key={o.id} className="border rounded-2xl p-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <b>Order #{String(o.id).slice(0, 8)}</b>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLOR[o.status] || "bg-neutral-100"}`}>{o.status}</span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">{new Date(o.created_at).toLocaleString()} • {o.payment_method} • Total {formatBDT(Number(o.total))}</p>
            <div className="mt-2 text-sm">
              {o.order_items?.map((it, i) => <p key={i}>• {it.product_name} (Size {it.size}) × {it.qty} — {formatBDT(Number(it.price) * it.qty)}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
