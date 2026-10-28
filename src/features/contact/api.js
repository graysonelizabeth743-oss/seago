import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

/** Stores a website enquiry in `enquiries` (readable by admins only). */
export async function submitEnquiry({ name, email, phone, topic, message, website }) {
  // Honeypot: real visitors never see or fill the hidden `website` field.
  if (website) return;
  if (!isFirebaseConfigured) {
    const err = new Error("Firebase is not configured. Add your credentials to .env.local.");
    err.code = "app/not-configured";
    throw err;
  }
  await addDoc(collection(db, "enquiries"), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    topic,
    message: message.trim(),
    status: "new",
    createdAt: serverTimestamp(),
  });
}
