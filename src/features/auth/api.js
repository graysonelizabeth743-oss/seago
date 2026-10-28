import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

function assertConfigured() {
  if (!isFirebaseConfigured) {
    const err = new Error("Firebase is not configured. Add your credentials to .env.local.");
    err.code = "app/not-configured";
    throw err;
  }
}

export async function registerUser({ name, email, password, company = "", phone = "" }) {
  assertConfigured();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  // Role is always "user" here. Security rules reject anything else.
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email: email.toLowerCase(),
    company,
    phone,
    role: "user",
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

export async function loginUser(email, password) {
  assertConfigured();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function requestPasswordReset(email) {
  assertConfigured();
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  await signOut(auth);
}

/** Update the editable parts of a profile. `role` can never be changed from here. */
export async function saveProfile(uid, { name, company, phone }) {
  assertConfigured();
  await updateDoc(doc(db, "users", uid), { name, company, phone });
  if (auth.currentUser && auth.currentUser.uid === uid && name) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
}

export function authErrorMessage(error) {
  const code = error?.code || "";
  const map = {
    "app/not-configured": error?.message,
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "Email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
    "auth/weak-password": "Choose a stronger password (at least 8 characters).",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network problem. Check your connection and try again.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "permission-denied": "You don't have permission to do that.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
