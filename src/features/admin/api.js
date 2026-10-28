import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

const noop = () => {};

function subscribeList(name, max, onData, onError) {
  if (!isFirebaseConfigured) return noop;
  const q = query(collection(db, name), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

/** Customers (newest first). Documents created by hand without `createdAt` are not listed. */
export const subscribeUsers = (onData, onError = noop) => subscribeList("users", 300, onData, onError);

export const subscribeEnquiries = (onData, onError = noop) => subscribeList("enquiries", 200, onData, onError);

export function setUserRole(uid, role) {
  if (role !== "user" && role !== "admin") throw new Error("Invalid role");
  return updateDoc(doc(db, "users", uid), { role });
}

export function setEnquiryStatus(id, status) {
  return updateDoc(doc(db, "enquiries", id), { status });
}
