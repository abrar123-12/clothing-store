"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  remove: (product_id: string, size: string) => void;
  setQty: (product_id: string, size: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kapor-cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("kapor-cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (item: CartItem) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.product_id === item.product_id && x.size === item.size);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + item.qty };
        return copy;
      }
      return [...prev, item];
    });
    setOpen(true);
  };

  const remove = (product_id: string, size: string) =>
    setItems(prev => prev.filter(x => !(x.product_id === product_id && x.size === size)));

  const setQty = (product_id: string, size: string, qty: number) =>
    setItems(prev => qty <= 0 ? prev.filter(x => !(x.product_id === product_id && x.size === size)) : prev.map(x => x.product_id === product_id && x.size === size ? { ...x, qty } : x));

  const clear = () => setItems([]);
  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, x) => s + x.price * x.qty, 0), [items]);

  return <Ctx.Provider value={{ items, count, subtotal, add, remove, setQty, clear, open, setOpen }}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
