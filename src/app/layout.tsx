import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "KAPOR — Premium Clothing in Bangladesh",
  description: "Shop premium clothing with Cash on Delivery all over Bangladesh."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-[70vh] pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
