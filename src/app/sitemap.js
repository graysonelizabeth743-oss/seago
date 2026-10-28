import { site } from "@/config/site";
import { services } from "@/config/content";

export default function sitemap() {
  const pages = ["", "/services", "/quote", "/track", "/about", "/contact", "/faq", "/privacy", "/terms"];
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, lastModified: now })),
    ...services.map((s) => ({ url: `${site.url}/services/${s.slug}`, lastModified: now })),
  ];
}
