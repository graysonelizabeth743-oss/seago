// src/components/layout/Footer.jsx
import Link from "next/link";
import { site, contact, socials, footerNav } from "@/config/site";
import Logo from "@/components/ui/Logo";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  const office = contact.offices[0];
  const waDigits = contact.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer className="bg-graphite-950 text-graphite-100">
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Logo onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-graphite-300">{site.tagline} {site.description}</p>

          <address className="mt-6 space-y-2.5 text-sm not-italic text-graphite-200">
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 hover:text-white">
              <Icon name="mail" size={16} className="text-brand-400" /> {contact.email}
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-white">
              <Icon name="phone" size={16} className="text-brand-400" /> {contact.phone}
            </a>
            {waDigits && (
              <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-white">
                <Icon name="message" size={16} className="text-brand-400" /> WhatsApp
              </a>
            )}
            {office && (
              <p className="flex items-start gap-2.5">
                <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-brand-400" />
                <span>{office.lines.join(", ")}</span>
              </p>
            )}
            <p className="flex items-center gap-2.5 text-graphite-300">
              <Icon name="clock" size={16} className="text-brand-400" /> {contact.hours}
            </p>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-graphite-300 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-graphite-400">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer noopener" className="text-xs font-semibold text-graphite-300 hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
