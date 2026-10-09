import "./globals.css";
import type { Viewport } from "next";
import UserNav from "@/components/UserNav";
import SwRegister from "@/components/SwRegister";
export const metadata = {
  title: "Chemical Shop",
  description: "Offline-first inventory & POS",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "ChemShop" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#0b6140", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-stone-100 text-stone-900">
    <SwRegister />
    <UserNav />
    {children}
  </body></html>);
}
