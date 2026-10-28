"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import { Badge } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { initials, relativeTime } from "@/lib/format";

export default function ConversationList({ conversations, selectedId, onSelect, loading }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) =>
      [c.userName, c.userEmail, c.lastMessage].filter(Boolean).some((v) => v.toLowerCase().includes(term))
    );
  }, [conversations, q]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="border-b border-line p-3">
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-10 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-400/30"
          />
        </div>
      </div>

      <ul className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {loading &&
          [0, 1, 2, 3].map((i) => (
            <li key={i} className="flex gap-3 px-4 py-3.5">
              <span className="skeleton h-10 w-10 shrink-0 !rounded-full" />
              <span className="flex-1 space-y-2">
                <span className="skeleton block h-3 w-1/2" />
                <span className="skeleton block h-3 w-4/5" />
              </span>
            </li>
          ))}

        {!loading && filtered.length === 0 && (
          <li className="px-5 py-12 text-center text-sm text-muted">
            {conversations.length ? "No conversations match your search." : "No conversations yet. Customer messages will appear here."}
          </li>
        )}

        {filtered.map((c) => {
          const active = c.id === selectedId;
          const unread = c.unreadAdmin || 0;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 border-l-2 px-4 py-3.5 text-left transition-colors",
                  active ? "border-primary bg-soft" : "border-transparent hover:bg-soft/70"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sea-100 text-sm font-bold text-sea-800 dark:bg-sea-900 dark:text-sea-100">
                  {initials(c.userName || c.userEmail)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn("truncate text-sm", unread ? "font-bold" : "font-semibold")}>
                      {c.userName || c.userEmail || "Customer"}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">{relativeTime(c.lastMessageAt)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className={cn("truncate text-xs", unread ? "font-semibold text-ink" : "text-muted")}>
                      {c.lastSenderRole === "admin" && "You: "}
                      {c.lastMessage}
                    </span>
                    {unread > 0 && <Badge tone="info" className="!bg-primary !px-2 !py-0.5 !text-white">{unread}</Badge>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
