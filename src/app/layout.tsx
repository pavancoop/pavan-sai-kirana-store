import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import PWAInstall from "@/components/PWAInstall";

export const viewport: Viewport = {
  themeColor: "#FFFDF9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: "Pavan Sai Kirana General Store | Groceries Delivered in 30 Mins",
  description:
    "Order fresh groceries online from Pavan Sai Kirana General Store. Fast 30-minute delivery, best prices, WhatsApp support. Minimum order ₹200.",
  keywords: [
    "grocery",
    "kirana",
    "online grocery",
    "delivery",
    "Pavan Sai",
    "groceries",
    "dal",
    "rice",
    "spices",
    "kirana store",
  ],
  openGraph: {
    title: "Pavan Sai Kirana General Store",
    description: "Your Everyday Groceries, Delivered to Your Door",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <PWAInstall />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
