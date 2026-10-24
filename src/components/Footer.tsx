"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/data";
import { defaultSettings } from "@/lib/data";
import type { Settings } from "@/lib/types";

export default function Footer() {
  const [s, setS] = useState<Settings>(defaultSettings);
  useEffect(() => { fetchSettings().then(setS).catch(() => {}); }, []);
  return (
    <footer className="mt-16">
      <div className="bg-blush">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="font-display font-extrabold uppercase mb-3">About Us</h4>
            <p className="text-neutral-600">{s.store_name} is a premium clothing store in Bangladesh. Cash on Delivery available all over the country.</p>
            <div className="mt-3 flex flex-col gap-1 text-neutral-600">
              <Link href="/shop">Shop</Link>
              <Link href="/track">Track Your Order</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-extrabold uppercase mb-3">Policy</h4>
            <div className="flex flex-col gap-1 text-neutral-600">
              <span>Exchange & Complain Policy</span>
              <span>Return & Refund Policy</span>
              <span>Privacy Policy</span>
              <span>Terms & Conditions</span>
            </div>
          </div>
          <div>
            <h4 className="font-display font-extrabold uppercase mb-3">Connect With Us</h4>
            <p className="text-neutral-600 mb-3">Join our Facebook group for new arrivals and offers.</p>
            <a href={s.facebook_url || "#"} target="_blank" rel="noreferrer" className="inline-block bg-brand text-white font-bold px-4 py-2 rounded-full">Join Facebook Group</a>
            <div className="mt-3 text-xl flex gap-3"><span>📘</span><span>📸</span><span>🎵</span><span>▶️</span></div>
            {(s.bkash_number || s.nagad_number) && (
              <p className="mt-3 text-neutral-600">bKash: {s.bkash_number || "-"}<br />Nagad: {s.nagad_number || "-"}</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-neutral-900 text-white text-center text-sm py-3">Copyright © {new Date().getFullYear()} | {s.store_name} Lifestyle. All rights reserved.</div>
    </footer>
  );
}
