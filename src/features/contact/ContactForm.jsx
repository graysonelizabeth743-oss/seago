"use client";

import { useState } from "react";
import { Input, Select, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import Button from "@/components/ui/Button";
import { submitEnquiry } from "@/features/contact/api";

const TOPICS = ["Request a quote", "Booking help", "Tracking a shipment", "Customs & documents", "Something else"];
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: TOPICS[0], message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Tell us a little more (at least 10 characters).";
    if (form.message.length > 4000) next.message = "Please keep your message under 4,000 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      await submitEnquiry(form);
      setStatus("sent");
    } catch (err) {
      console.error("[contact] submit failed", err);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-8 text-center">
        <Alert tone="success" className="text-left">
          Thanks, {form.name.split(" ")[0] || "we"} got your message. We&apos;ll reply to {form.email} soon.
        </Alert>
        <Button variant="secondary" className="mt-5" onClick={() => { setForm({ name: "", email: "", phone: "", topic: TOPICS[0], message: "", website: "" }); setStatus("idle"); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8">
      {status === "error" && <Alert>We couldn&apos;t send your message. Please try again, or email us directly.</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Full name" name="name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Phone (optional)" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
        <Select label="Topic" name="topic" value={form.topic} onChange={set("topic")}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </div>
      <Textarea label="Message" name="message" rows={5} value={form.message} onChange={set("message")} error={errors.message} />
      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={set("website")} />
        </label>
      </div>
      <Button type="submit" size="lg" loading={status === "sending"} className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
