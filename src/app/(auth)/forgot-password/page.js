"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset, authErrorMessage } from "@/features/auth/api";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists
      if (err?.code === "auth/user-not-found") setSent(true);
      else setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold">Reset your password</h1>
      {sent ? (
        <div className="mt-6 space-y-5">
          <Alert tone="success">If an account exists for {email.trim()}, a reset link is on its way. Check your inbox and spam folder.</Alert>
          <Button href="/login" variant="secondary">Back to sign in</Button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">Enter your email and we&apos;ll send you a link to choose a new password.</p>
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            {error && <Alert>{error}</Alert>}
            <Input label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" size="lg" loading={loading} className="w-full">Send reset link</Button>
          </form>
          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/login" className="font-semibold text-link hover:underline">Back to sign in</Link>
          </p>
        </>
      )}
    </>
  );
}
