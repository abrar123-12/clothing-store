"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) return setError("Supabase is not configured yet. Add env vars in Vercel (see DEPLOY-GUIDE.md).");
    setLoading(true);
    const { data, error: e1 } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (e1 || !data.user) { setLoading(false); return setError("Login failed: " + (e1?.message || "check email/password")); }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    setLoading(false);
    if (profile?.role === "admin") router.push("/admin");
    else router.push("/");
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display font-black uppercase text-3xl text-center text-brand">Admin Login</h1>
      {!isSupabaseConfigured && <p className="mt-4 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">⚠️ Supabase env vars are missing, so login will not work yet. Finish the setup steps in DEPLOY-GUIDE.md first.</p>}
      <form onSubmit={login} className="flex flex-col gap-3 mt-6">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border rounded-xl px-4 py-3" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border rounded-xl px-4 py-3" required />
        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
        <button disabled={loading} className="bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white font-bold py-3 rounded-full">{loading ? "Logging in..." : "LOGIN"}</button>
      </form>
      <p className="text-xs text-neutral-500 mt-4 text-center">Only the store admin can open the admin panel. Customers do not need an account to order.</p>
    </div>
  );
}
