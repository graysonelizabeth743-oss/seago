"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GuestOnly } from "@/features/auth/guards";
import { registerUser, authErrorMessage } from "@/features/auth/api";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function RegisterForm() {
  const params = useSearchParams();
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({ ...form, name: form.name.trim(), email: form.email.trim() });
      // GuestOnly redirects once signed in.
    } catch (err) {
      setError(authErrorMessage(err));
      setLoading(false);
    }
  }

  const loginHref = params.get("next") ? `/login?next=${encodeURIComponent(params.get("next"))}` : "/login";

  return (
    <>
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-muted">Book shipments, track cargo and chat with our team.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {error && <Alert>{error}</Alert>}
        <Input label="Full name" name="name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Company (optional)" name="company" autoComplete="organization" value={form.company} onChange={set("company")} />
          <Input label="Phone (optional)" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
        </div>
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} hint="At least 8 characters" />
        <Button type="submit" size="lg" loading={loading} className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        By creating an account you agree to our <Link href="/terms" className="font-semibold text-link hover:underline">Terms</Link> and <Link href="/privacy" className="font-semibold text-link hover:underline">Privacy policy</Link>.
      </p>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account? <Link href={loginHref} className="font-semibold text-link hover:underline">Sign in</Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  );
}
