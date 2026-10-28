"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { useConversations } from "@/features/chat/hooks";
import { useUserProfile } from "@/features/admin/hooks";
import ChatWindow from "@/features/chat/ChatWindow";
import ConversationList from "@/features/chat/ConversationList";
import Icon from "@/components/ui/Icon";
import { Alert, PageLoader } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";

function Inbox() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile } = useAuth();
  const { conversations, loading, error } = useConversations();

  const selectedId = params.get("c") || "";
  const selected = conversations.find((c) => c.id === selectedId);
  // Thread may not exist yet (admin opened it from a shipment): fall back to the user's profile
  const fetched = useUserProfile(selectedId && !selected ? selectedId : null);

  const customer = {
    name: selected?.userName || fetched?.name || "",
    email: selected?.userEmail || fetched?.email || "",
  };
  const adminName = profile?.name || user.displayName || "Sea Go";

  const select = (id) => router.push(`/admin/inbox?c=${encodeURIComponent(id)}`);
  const back = () => router.push("/admin/inbox");

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[22rem_1fr]">
      <div className={cn("min-h-0 border-r border-line", selectedId ? "hidden lg:block" : "block")}>
        {error ? (
          <div className="p-4"><Alert>Couldn&apos;t load conversations. Check the admin role and deployed rules.</Alert></div>
        ) : (
          <ConversationList conversations={conversations} selectedId={selectedId} onSelect={select} loading={loading} />
        )}
      </div>

      <div className={cn("min-h-0", selectedId ? "block" : "hidden lg:block")}>
        {selectedId ? (
          <ChatWindow
            key={selectedId}
            conversationId={selectedId}
            viewerRole="admin"
            viewer={{ uid: user.uid, name: adminName }}
            customer={customer}
            title={customer.name || customer.email || "Customer"}
            subtitle={customer.email}
            onBack={back}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-soft px-6 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-link shadow-sm">
              <Icon name="message" size={26} />
            </span>
            <h2 className="font-display text-xl font-bold">Select a conversation</h2>
            <p className="mt-1.5 max-w-xs text-sm text-muted">Pick a customer from the list to read and reply to their messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Inbox />
    </Suspense>
  );
}
