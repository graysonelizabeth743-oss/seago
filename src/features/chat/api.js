import {
  collection,
  doc,
  increment,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Data model
 *   conversations/{customerUid}            one thread per customer
 *     userId, userName, userEmail, lastMessage, lastMessageAt, lastSenderRole,
 *     unreadAdmin, unreadUser
 *   conversations/{customerUid}/messages/{id}
 *     text, senderId, senderRole ("user" | "admin"), senderName, createdAt
 */

export const MAX_MESSAGE_LENGTH = 2000;
const noop = () => {};

const convRef = (cid) => doc(db, "conversations", cid);
const messagesCol = (cid) => collection(db, "conversations", cid, "messages");

export function subscribeMessages(cid, onData, onError = noop) {
  if (!isFirebaseConfigured || !cid) return noop;
  const q = query(messagesCol(cid), orderBy("createdAt", "asc"), limitToLast(300));
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          // "estimate" gives pending (just-sent) messages a usable timestamp straight away
          ...d.data({ serverTimestamps: "estimate" }),
          pending: d.metadata.hasPendingWrites,
        }))
      ),
    onError
  );
}

export function subscribeConversation(cid, onData, onError = noop) {
  if (!isFirebaseConfigured || !cid) return noop;
  return onSnapshot(convRef(cid), (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
}

/** Admin: all conversations, most recent activity first. */
export function subscribeConversations(onData, onError = noop) {
  if (!isFirebaseConfigured) return noop;
  const q = query(collection(db, "conversations"), orderBy("lastMessageAt", "desc"), limit(100));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

/**
 * Send a message and update the conversation summary atomically.
 * `sender`   { uid, role: "user" | "admin", name }
 * `customer` { name, email } of the conversation owner (needed when an admin opens a new thread)
 */
export async function sendMessage({ conversationId, text, sender, customer }) {
  const body = String(text || "").trim();
  if (!body) return;
  if (body.length > MAX_MESSAGE_LENGTH) throw new Error(`Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`);

  const msgRef = doc(messagesCol(conversationId));
  const batch = writeBatch(db);

  batch.set(msgRef, {
    text: body,
    senderId: sender.uid,
    senderRole: sender.role,
    senderName: sender.name || "",
    createdAt: serverTimestamp(),
  });

  const summary = {
    userId: conversationId,
    lastMessage: body.slice(0, 140),
    lastMessageAt: serverTimestamp(),
    lastSenderRole: sender.role,
    // The *other* side gets an unread count
    [sender.role === "admin" ? "unreadUser" : "unreadAdmin"]: increment(1),
  };
  if (customer?.name) summary.userName = customer.name;
  if (customer?.email) summary.userEmail = customer.email;

  batch.set(convRef(conversationId), summary, { merge: true });
  await batch.commit();
}

/** Clear the unread counter for the person currently looking at the thread. */
export async function markRead(conversationId, role) {
  try {
    await updateDoc(convRef(conversationId), { [role === "admin" ? "unreadAdmin" : "unreadUser"]: 0 });
  } catch (err) {
    // Thread may not exist yet; nothing to mark.
    if (err?.code !== "not-found") console.warn("[chat] markRead", err?.code);
  }
}
