import "./globals.css";
import Link from "next/link";
export const metadata = { title: "Chemical Shop", description: "Offline-first inventory & POS" };
const links = [["Home","/"],["POS","/pos"],["Items","/items"],["Receive","/receive"],["Stock","/stock"],["Locations","/locations"],["Dashboard","/dashboard"],["Login","/login"],["Sign up","/signup"]];
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-stone-100 text-stone-900">
    <nav className="sticky top-0 z-10 bg-stone-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="font-extrabold mr-2 whitespace-nowrap">Chemical Shop</span>
        {links.map(([t,h])=>(<Link key={h} href={h} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-stone-700 whitespace-nowrap">{t}</Link>))}
      </div>
    </nav>
    {children}
  </body></html>);
}
