"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Admin-only sign-in. This page is deliberately NOT linked from the store
// header or footer — only the store owner uses it (bookmark it). Customers
// use /login, which never opens the admin panel.
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) return setError("Store is not connected yet. Please try again later.");
    setLoading(true);
    const { data, error: e1 } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (e1 || !data.user) { setLoading(false); return setError("Login failed: " + (e1?.message || "check email/password")); }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    setLoading(false);
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      return setError("This account is not an admin. Customers use the normal login on the store.");
    }
    router.push("/admin");
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display font-black uppercase text-3xl text-center text-brand">Admin Access</h1>
      <p className="text-sm text-neutral-500 text-center mt-2">Store owner only. This page is not linked from the store — bookmark it.</p>
      <form onSubmit={login} className="flex flex-col gap-3 mt-6">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" className="border rounded-xl px-4 py-3" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border rounded-xl px-4 py-3" required />
        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
        <button disabled={loading} className="bg-neutral-900 hover:bg-black disabled:bg-neutral-300 text-white font-bold py-3 rounded-full">{loading ? "Checking..." : "OPEN ADMIN PANEL"}</button>
      </form>
    </div>
  );
}
