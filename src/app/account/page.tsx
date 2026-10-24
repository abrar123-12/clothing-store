"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/lib/data";
import type { Order } from "@/lib/types";

// Customer dashboard: shows the signed-in customer's own orders only.
// (Orders are linked to accounts by orders.user_id; guest orders stay
// trackable by phone on /track.)
export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!supabase) { router.push("/login"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setEmail(session.user.email || "");
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (data) setOrders(data as Order[]);
      setReady(true);
    })();
  }, [router]);

  const logout = async () => { await supabase?.auth.signOut(); router.push("/"); };

  if (!ready) return <p className="text-center py-20">Loading your account...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-black uppercase text-2xl text-brand">My Account</h1>
          <p className="text-sm text-neutral-500 mt-1">{email}</p>
        </div>
        <button onClick={logout} className="border font-bold px-4 py-2 rounded-full text-sm">Logout</button>
      </div>

      <h2 className="font-display font-extrabold uppercase mt-8 mb-3">My Orders</h2>
      {orders.length === 0 ? (
        <div className="border rounded-2xl p-5 text-sm text-neutral-600">
          <p>No orders on this account yet.</p>
          <p className="mt-2">Orders placed while logged in show up here. Orders placed without logging in can be tracked by phone number:</p>
          <Link href="/track" className="inline-block mt-3 bg-brand text-white font-bold px-4 py-2 rounded-full text-sm">Track by Phone →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(o => (
            <div key={o.id} className="border rounded-2xl p-4">
              <div className="flex justify-between flex-wrap gap-2">
                <b>#{String(o.id).slice(0, 8)}</b>
                <span className="text-sm text-neutral-500">{new Date(o.created_at).toLocaleString()}</span>
              </div>
              <div className="text-sm mt-2">{o.order_items?.map((it, i) => <p key={i}>• {it.product_name} (Size {it.size}) × {it.qty} — {formatBDT(Number(it.price) * it.qty)}</p>)}</div>
              <p className="text-sm mt-2">Payment: <b>{o.payment_method}</b> • <b className="text-brand">Total {formatBDT(Number(o.total))}</b> • Status: <b>{o.status}</b></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
