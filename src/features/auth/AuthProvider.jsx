"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  loading: true,
  configured: false,
});

/**
 * Provides the signed-in Firebase user plus their Firestore profile (`users/{uid}`).
 * `loading` stays true until both the auth state and the profile have resolved,
 * so guards never flash the wrong screen.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [profileReady, setProfileReady] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthReady(true);
      setProfileReady(!next);
      if (!next) setProfile(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setProfileReady(true);
      },
      (err) => {
        console.error("[auth] profile listener failed", err);
        setProfile(null);
        setProfileReady(true);
      }
    );
  }, [user]);

  const value = useMemo(() => {
    const role = profile?.role === "admin" ? "admin" : user ? "user" : null;
    return {
      user,
      profile,
      role,
      isAdmin: role === "admin",
      loading: !authReady || !profileReady,
      configured: isFirebaseConfigured,
    };
  }, [user, profile, authReady, profileReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
