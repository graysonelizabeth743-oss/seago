// src/features/chat/ChatWindow.jsx
"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { Alert, Spinner } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { formatDate, formatTime, initials, toDate } from "@/lib/format";
import { contact } from "@/config/site";
import { isFirebaseConfigured } from "@/lib/firebase";
import { MAX_MESSAGE_LENGTH, markRead, sendMessage } from "@/features/chat/api";
import { useConversation, useMessages } from "@/features/chat/hooks";

function dayLabel(value) {
  const d = toDate(value);
  if (!d) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(d);
}

/**
 * Shared chat thread.
 *  viewerRole   "user" (customer) or "admin" (Sea Go staff)
 *  viewer       { uid, name }
 *  customer     { name, email } owner of the thread (used by admin when opening a thread)
 */
export default function ChatWindow({ conversationId, viewerRole, viewer, customer, title, subtitle, onBack }) {
  const { messages, loading, error } = useMessages(conversationId);
  const conversation = useConversation(conversationId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const stickToBottom = useRef(true);

  const unreadKey = viewerRole === "admin" ? "unreadAdmin" : "unreadUser";
  const unread = conversation?.[unreadKey] || 0;

  // Clear unread count while the thread is open
  useEffect(() => {
    if (unread > 0) markRead(conversationId, viewerRole);
  }, [unread, conversationId, viewerRole]);

  // Keep pinned to newest message unless the reader has scrolled up
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    stickToBottom.current = true;
  }, [conversationId]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  async function submit(e) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError("");
    stickToBottom.current = true;
    try {
      await sendMessage({
        conversationId,
        text: body,
        sender: { uid: viewer.uid, role: viewerRole, name: viewer.name },
        customer,
      });
      setText("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    } catch (err) {
      console.error("[chat] send failed", err);
      setSendError(err?.code === "permission-denied" ? "You don't have permission to send here." : "Message not sent. Please try again.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function onInput(e) {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  let lastDay = "";

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-soft lg:hidden"
          >
            <Icon name="arrowLeft" size={18} />
          </button>
        )}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-graphite-950">
          {viewerRole === "admin" ? initials(title) : <Icon name="anchor" size={18} />}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-bold leading-tight">{title}</h2>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="scroll-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto bg-soft px-3 py-4 sm:px-5"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {!isFirebaseConfigured && <Alert tone="warning">Chat needs Firebase credentials. See README.md.</Alert>}
        {error && <Alert>Couldn&apos;t load messages. Check your connection and permissions.</Alert>}

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : messages.length === 0 && !error ? (
          <div className="mx-auto mt-10 max-w-xs text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-link shadow-sm">
              <Icon name="message" size={22} />
            </span>
            <p className="font-display text-base font-bold">
              {viewerRole === "admin" ? "No messages yet" : "Start the conversation"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {viewerRole === "admin"
                ? "Send a message to open this thread."
                : `Ask about a booking, a quote or documents. ${contact.supportResponse} Hours: ${contact.hours}.`}
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderRole === viewerRole;
            const day = dayLabel(m.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            const prev = messages[i - 1];
            const grouped = prev && prev.senderRole === m.senderRole && !showDay;
            const who = m.senderRole === "admin" ? (viewerRole === "admin" ? m.senderName || "Sea Go" : "Sea Go support") : m.senderName || "Customer";

            return (
              <div key={m.id}>
                {showDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold text-muted shadow-sm">{day}</span>
                  </div>
                )}
                <div className={cn("flex pop-in", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-2.5")}>
                  <div className={cn("max-w-[85%] sm:max-w-[70%]", mine ? "items-end" : "items-start", "flex flex-col")}>
                    {!grouped && !mine && <span className="mb-1 px-1 text-[11px] font-semibold text-muted">{who}</span>}
                    <div
                      className={cn(
                        "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                        mine ? "rounded-br-md bg-primary text-on-primary" : "rounded-bl-md border border-line bg-surface text-ink",
                        m.pending && "opacity-70"
                      )}
                    >
                      {m.text}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-muted">{m.pending ? "Sending…" : formatTime(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-line bg-surface p-3 sm:p-4">
        {sendError && <Alert className="mb-3">{sendError}</Alert>}
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={text}
            onChange={onInput}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Write a message…"
            disabled={!isFirebaseConfigured}
            className="max-h-36 min-h-11 flex-1 resize-none rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/35"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending || !isFirebaseConfigured}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary transition-[background-color,transform] hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Icon name="loader" size={18} className="animate-spin" /> : <Icon name="send" size={18} />}
          </button>
        </div>
        <p className="mt-1.5 hidden text-[11px] text-muted sm:block">Enter to send · Shift+Enter for a new line</p>
      </form>
    </div>
  );
}
