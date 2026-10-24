"use client";
import { useEffect } from "react";

// The admin panel moved to its own site. Anyone opening the old /admin URL
// on the store is sent to the admin site instead.
const ADMIN_URL = "https://clothing-store-admin-mess-app1.vercel.app/login";

export default function AdminRedirect() {
  useEffect(() => {
    window.location.href = ADMIN_URL;
  }, []);
  return (
    <div className="max-w-sm mx-auto px-4 py-20 text-center">
      <p className="font-bold">Redirecting to the admin site...</p>
      <a href={ADMIN_URL} className="inline-block mt-4 bg-brand text-white font-bold px-5 py-2.5 rounded-full text-sm">Go to Admin Site →</a>
    </div>
  );
}
