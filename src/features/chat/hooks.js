"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { subscribeConversation, subscribeConversations, subscribeMessages } from "@/features/chat/api";

export function useMessages(conversationId) {
  const [state, setState] = useState({ id: null, messages: [], error: null });

  useEffect(() => {
    if (!conversationId) return undefined;
    return subscribeMessages(
      conversationId,
      (messages) => setState({ id: conversationId, messages, error: null }),
      (error) => setState({ id: conversationId, messages: [], error })
    );
  }, [conversationId]);

  const ready = state.id === conversationId;
  return { messages: ready ? state.messages : [], loading: !!conversationId && !ready, error: ready ? state.error : null };
}

export function useConversation(conversationId) {
  const [state, setState] = useState({ id: null, conversation: null });

  useEffect(() => {
    if (!conversationId) return undefined;
    return subscribeConversation(
      conversationId,
      (conversation) => setState({ id: conversationId, conversation }),
      () => setState({ id: conversationId, conversation: null })
    );
  }, [conversationId]);

  return state.id === conversationId ? state.conversation : null;
}

export function useConversations() {
  const [state, setState] = useState({ conversations: [], loading: true, error: null });

  useEffect(
    () =>
      subscribeConversations(
        (conversations) => setState({ conversations, loading: false, error: null }),
        (error) => setState({ conversations: [], loading: false, error })
      ),
    []
  );

  return state;
}

/** Number of unread conversations / messages for the current viewer (sidebar badge). */
export function useChatBadge() {
  const { user, isAdmin } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return undefined;
    if (isAdmin) {
      return subscribeConversations(
        (list) => setCount(list.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0)),
        () => setCount(0)
      );
    }
    return subscribeConversation(
      user.uid,
      (c) => setCount(c?.unreadUser || 0),
      () => setCount(0)
    );
  }, [user, isAdmin]);

  return user ? count : 0;
}
