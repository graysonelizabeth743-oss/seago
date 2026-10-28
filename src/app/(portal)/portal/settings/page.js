"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { saveProfile, requestPasswordReset, logoutUser, authErrorMessage } from "@/features/auth/api";
import PageHeader from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/forms";
import { Alert, Badge } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, role } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || user?.displayName || "",
    company: profile?.company || "",
    phone: profile?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSave(e) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setNotice({ tone: "error", text: "Enter your name." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await saveProfile(user.uid, { name: form.name.trim(), company: form.company.trim(), phone: form.phone.trim() });
      setNotice({ tone: "success", text: "Profile saved." });
    } catch (err) {
      setNotice({ tone: "error", text: authErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    setNotice(null);
    try {
      await requestPasswordReset(user.email);
      setNotice({ tone: "success", text: `Password reset link sent to ${user.email}.` });
    } catch (err) {
      setNotice({ tone: "error", text: authErrorMessage(err) });
    }
  }

  async function onSignOut() {
    await logoutUser();
    router.push("/");
  }

  return (
    <>
      <PageHeader title="Settings" description="Your profile and account." />
      <div className="max-w-2xl space-y-6">
        {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

        <form onSubmit={onSave} className="card space-y-5 p-6" noValidate>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Profile</h2>
            <Badge tone={role === "admin" ? "info" : "neutral"}>{role === "admin" ? "Administrator" : "Customer"}</Badge>
          </div>
          <Input label="Full name" name="name" value={form.name} onChange={set("name")} autoComplete="name" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Company" name="company" value={form.company} onChange={set("company")} autoComplete="organization" />
            <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
          <Input label="Email" name="email" value={user?.email || ""} disabled hint="Contact support to change your email address." readOnly />
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>

        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">Security</h2>
          <p className="text-sm text-muted">We&apos;ll email you a link to choose a new password.</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onReset}>Send password reset email</Button>
            <Button variant="ghost" onClick={onSignOut}>Sign out</Button>
          </div>
        </section>
      </div>
    </>
  );
}
