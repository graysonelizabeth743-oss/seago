"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GuestOnly } from "@/features/auth/guards";
import { loginUser, authErrorMessage } from "@/features/auth/api";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      // GuestOnly redirects once the auth state arrives; this is a fallback.
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  const registerHref = params.get("next") ? `/register?next=${encodeURIComponent(params.get("next"))}` : "/register";

  return (
    <>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-muted">Sign in to manage shipments and message our team.</p>

      {!configured && !isFirebaseConfigured && <Alert tone="warning" className="mt-6">Firebase isn&apos;t configured yet. Add your credentials to <code>.env.local</code>.</Alert>}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {error && <Alert>{error}</Alert>}
        <Input label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div>
          <Input label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm font-semibold text-link hover:underline">Forgot password?</Link>
          </div>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full">Sign in</Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to Sea Go? <Link href={registerHref} className="font-semibold text-link hover:underline">Create an account</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}
