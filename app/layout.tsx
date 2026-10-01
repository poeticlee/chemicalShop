import "./globals.css";
export const metadata = { title: "Chemical Shop", description: "Offline-first inventory & POS" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-stone-100 text-stone-900">{children}</body></html>);
}
