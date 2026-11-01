// src/app/(marketing)/contact/page.js
import PageIntro from "@/components/layout/PageIntro";
import ContactForm from "@/features/contact/ContactForm";
import Icon from "@/components/ui/Icon";
import { contact } from "@/config/site";

export const metadata = { title: "Contact", description: "Reach the Sea Go team by form, email, phone or WhatsApp." };

export default function ContactPage() {
  const waDigits = contact.whatsapp.replace(/[^\d]/g, "");
  const items = [
    { icon: "mail", label: "General", value: contact.email, href: `mailto:${contact.email}` },
    { icon: "mail", label: "Sales", value: contact.salesEmail, href: `mailto:${contact.salesEmail}` },
    { icon: "phone", label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    ...(waDigits ? [{ icon: "message", label: "WhatsApp", value: contact.whatsapp, href: `https://wa.me/${waDigits}` }] : []),
  ];

  return (
    <>
      <PageIntro title="Contact us" description={`${contact.supportResponse} Already a customer? Sign in and use Messages for the fastest reply.`} />
      <section className="container-x grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <ContactForm />
        <div className="space-y-6">
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.label + i.value}>
                <a href={i.href} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand-500">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                    <Icon name={i.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-muted">{i.label}</span>
                    <span className="block truncate text-sm font-bold group-hover:text-link">{i.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {contact.offices.map((o) => (
            <div key={o.name} className="rounded-2xl bg-soft p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="pin" size={16} className="text-link" /> {o.name}</h2>
              <address className="mt-2 text-sm not-italic leading-relaxed text-muted">
                {o.lines.map((l) => <span key={l} className="block">{l}</span>)}
              </address>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Icon name="clock" size={14} /> {contact.hours}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
