import "./globals.css";
import type { Viewport } from "next";
import UserNav from "@/components/UserNav";
import SwRegister from "@/components/SwRegister";
export const metadata = {
  title: "Spikenish Chemicals",
  description: "Quality Chemicals for a Cleaner, Brighter Future — offline-first inventory & POS",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Spikenish" },
  icons: { icon: "/icons/favicon.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#0b4aa5", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-stone-100 text-stone-900">
    <SwRegister />
    <UserNav />
    {children}
  </body></html>);
}
