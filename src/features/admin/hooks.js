"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { subscribeEnquiries, subscribeUsers } from "@/features/admin/api";

function useList(subscribe) {
  const [state, setState] = useState({ items: [], loading: true, error: null });
  useEffect(
    () =>
      subscribe(
        (items) => setState({ items, loading: false, error: null }),
        (error) => {
          console.error("[admin] listener failed", error);
          setState({ items: [], loading: false, error });
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return state;
}

export const useUsers = () => useList(subscribeUsers);
export const useEnquiries = () => useList(subscribeEnquiries);

/** One-off profile fetch (used when an admin opens a thread for a customer with no messages yet). */
export function useUserProfile(uid) {
  const [state, setState] = useState({ uid: null, profile: null });
  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return undefined;
    let cancelled = false;
    getDoc(doc(db, "users", uid))
      .then((snap) => !cancelled && setState({ uid, profile: snap.exists() ? snap.data() : null }))
      .catch(() => !cancelled && setState({ uid, profile: null }));
    return () => {
      cancelled = true;
    };
  }, [uid]);
  return state.uid === uid ? state.profile : null;
}
