"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Customer account login/signup. This page is for customers only — it never
// opens the admin panel, even for admin accounts. Admins sign in separately
// at /admin-login (not linked from the store).
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!supabase) return setError("Store is not connected yet. Please try again later.");
    setLoading(true);
    if (mode === "signup") {
      const { data, error: e1 } = await supabase.auth.signUp({ email: email.trim(), password });
      setLoading(false);
      if (e1) return setError("Sign up failed: " + e1.message);
      if (data.session) { router.push("/account"); return; }
      setNotice("Account created! Check your email to confirm it, then log in below.");
      setMode("login");
      return;
    }
    const { data, error: e1 } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (e1 || !data.user) return setError("Login failed: " + (e1?.message || "check email/password"));
    router.push("/account");
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display font-black uppercase text-3xl text-center text-brand">My Account</h1>
      <p className="text-sm text-neutral-500 text-center mt-2">Log in to see your orders, or create a free account.</p>
      <div className="flex gap-2 mt-6">
        <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-full font-bold text-sm ${mode === "login" ? "bg-brand text-white" : "border"}`}>LOG IN</button>
        <button onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-full font-bold text-sm ${mode === "signup" ? "bg-brand text-white" : "border"}`}>SIGN UP</button>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3 mt-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border rounded-xl px-4 py-3" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)" className="border rounded-xl px-4 py-3" required minLength={6} />
        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
        {notice && <p className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-2 text-sm font-semibold">{notice}</p>}
        <button disabled={loading || !isSupabaseConfigured} className="bg-brand hover:bg-brand-dark disabled:bg-neutral-300 text-white font-bold py-3 rounded-full">{loading ? "Please wait..." : mode === "login" ? "LOG IN" : "CREATE ACCOUNT"}</button>
      </form>
      <p className="text-xs text-neutral-500 mt-4 text-center">You can also order without an account — and track any order by phone number from the Track Order page.</p>
    </div>
  );
}
