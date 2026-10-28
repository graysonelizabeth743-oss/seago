import { site } from "@/config/site";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/portal", "/admin", "/login", "/register"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
