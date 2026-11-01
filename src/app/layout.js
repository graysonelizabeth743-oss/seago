// src/app/layout.js
import "@fontsource-variable/manrope";
import "@fontsource-variable/public-sans";
import "./globals.css";
import { site } from "@/config/site";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { THEME_KEY } from "@/lib/theme";

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0a" },
  ],
};

// Runs before first paint so the saved theme never flashes. The default is light (white); only an explicit choice from the toggle switches to dark.
const themeScript = `(function(){try{var k='${THEME_KEY}';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t='light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}