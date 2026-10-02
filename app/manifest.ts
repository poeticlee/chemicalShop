import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Chemical Shop", short_name: "ChemShop", start_url: "/", display: "standalone", background_color: "#f5f5f4", theme_color: "#0b6140", icons: [] };
}
