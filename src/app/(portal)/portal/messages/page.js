"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import ChatWindow from "@/features/chat/ChatWindow";
import { contact } from "@/config/site";
import { site } from "@/config/site";

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const name = profile?.name || user?.displayName || "";

  return (
    <div className="mx-auto h-full max-w-4xl lg:py-6">
      <div className="h-full overflow-hidden border-line lg:rounded-2xl lg:border lg:shadow-[var(--shadow-card)]">
        <ChatWindow
          conversationId={user.uid}
          viewerRole="user"
          viewer={{ uid: user.uid, name }}
          customer={{ name, email: user.email }}
          title={`${site.name} support`}
          subtitle={contact.hours}
        />
      </div>
    </div>
  );
}
