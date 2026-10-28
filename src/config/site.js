/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SEA GO · SITE SETTINGS
 *  Edit this file to change brand details, contact information and navigation.
 *  Nothing else in the codebase hard-codes these values.
 *
 *  ⚠ Every value marked PLACEHOLDER must be replaced before launch.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Sea Go",
  legalName: "Sea Go Shipping Ltd", // PLACEHOLDER
  tagline: "Send anything by sea.",
  description:
    "Send a gift, a package or a full container by sea. Get a clear price, follow every milestone and message a real person whenever you need one.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  /**
   * Logo: drop your file into /public and set the path here.
   * Recommended: a horizontal logo (SVG or PNG, transparent background), ~150×40.
   * Optional: set `srcDark` to a light-coloured version used in dark mode / on the dark footer.
   * If the file can't be found, a built-in wordmark is shown instead.
   */
  logo: {
    src: "/logo.png",
    srcDark: "", // e.g. "/logo-light.png"; leave empty to reuse `src`
    alt: "Sea Go",
    width: 150,
    height: 40,
  },
};

export const contact = {
  email: "fasttrackservice1@outlook.com",
  salesEmail: "fasttrackservice1@outlook.com",
  phone: "+12568144813",
  whatsapp: "+12568144813",
  hours: "Mon–Fri, 8:00–18:00 (WAT)", // shown on the contact page and in chat
  supportResponse: "We usually reply within a few hours on working days.",
  offices: [
    {
      name: "Head office",
      lines: ["England"],
    },
  ],
};

export const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" }, // PLACEHOLDER
  { label: "X", href: "https://x.com/" }, // PLACEHOLDER
  { label: "Facebook", href: "https://www.facebook.com/" }, // PLACEHOLDER
  { label: "Instagram", href: "https://www.instagram.com/" }, // PLACEHOLDER
];

/** Public website navigation */
export const mainNav = [
  { label: "Services", href: "/services" },
  { label: "Get a quote", href: "/quote" },
  { label: "Track a shipment", href: "/track" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = [
  {
    title: "Shipping",
    links: [
      { label: "Services", href: "/services" },
      { label: "Get a quote", href: "/quote" },
      { label: "Track a shipment", href: "/track" },
      { label: "Send a shipment", href: "/portal/shipments/new" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

/** Customer portal sidebar. `icon` names map to components/ui/Icon.jsx */
export const portalNav = [
  { label: "Overview", href: "/portal", icon: "layout" },
  { label: "Shipments", href: "/portal/shipments", icon: "ship" },
  { label: "Send a shipment", href: "/portal/shipments/new", icon: "plus" },
  { label: "Messages", href: "/portal/messages", icon: "message", badge: "chat" },
  { label: "Settings", href: "/portal/settings", icon: "settings" },
];

/** Admin console sidebar */
export const adminNav = [
  { label: "Overview", href: "/admin", icon: "layout" },
  { label: "Shipments", href: "/admin/shipments", icon: "ship" },
  { label: "Inbox", href: "/admin/inbox", icon: "message", badge: "chat" },
  { label: "Customers", href: "/admin/users", icon: "users" },
  { label: "Enquiries", href: "/admin/enquiries", icon: "mail" },
];
