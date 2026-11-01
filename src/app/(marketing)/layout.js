// src/app/(marketing)/layout.js
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatLauncher from "@/components/layout/ChatLauncher";

export default function MarketingLayout({ children }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <ChatLauncher />
    </>
  );
}
