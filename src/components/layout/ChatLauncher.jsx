// src/components/layout/ChatLauncher.jsx
import Link from "next/link";
import Icon from "@/components/ui/Icon";

/** Floating shortcut on public pages. Signed-out visitors are asked to sign in first. */
export default function ChatLauncher() {
  return (
    <Link
      href="/portal/messages"
      aria-label="Chat with our team"
      className="fixed bottom-5 right-5 z-30 inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary shadow-lg shadow-brand-700/30 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0 sm:bottom-7 sm:right-7"
    >
      <Icon name="message" size={20} />
      <span className="hidden sm:inline">Chat with us</span>
    </Link>
  );
}
