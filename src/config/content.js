// src/config/content.js
/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SEA GO · PAGE CONTENT
 *  Marketing copy used across the public website. Edit freely.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const hero = {
  title: "From a gift box to a full container, tracked every mile.",
  subtitle:
    "Send a package to family, ship something you bought online or book a container. Get a clear price, follow every milestone and message our team whenever you need a person.",
  primaryCta: { label: "Get a quote", href: "/quote" },
  secondaryCta: { label: "Create an account", href: "/register" },
  trackLabel: "Track a shipment",
  trackPlaceholder: "Enter your booking number",
};

/**
 * The carousel at the very top of the home page.
 * To use your own photos: put the files in /public/carousel and change `image` (JPG, WebP or SVG, about 1600×700).
 * Keep titles short (under ~60 characters) and write-ups under ~170 characters.
 */
export const carousel = {
  label: "Sea Go highlights",
  intervalSeconds: 6,
  slides: [
    {
      image: "/carousel/ocean-freight.svg",
      width: 1600,
      height: 700,
      alt: "A container ship sailing into a golden sunset, stacked with colourful containers",
      kicker: "Ocean freight",
      title: "Containers and cargo, followed every mile",
      body: "Book a full container or a part load between ports across Europe, the Americas, Africa and Asia, and watch it sail on a live map.",
      cta: { label: "Get a quote", href: "/quote" },
    },
    {
      image: "/carousel/port-verification.svg",
      width: 1600,
      height: 700,
      alt: "An inspector in a hard hat and yellow vest with a clipboard at a port, under three yellow cranes",
      kicker: "Verified at the port",
      title: "Checked by people before it sails",
      body: "Every shipment is put on hold and inspected by our team. Only when it matches what you declared is it approved for transport.",
      cta: { label: "How verification works", href: "/faq" },
    },
    {
      image: "/carousel/packages-delivery.svg",
      width: 1600,
      height: 700,
      alt: "A Sea Go delivery van beside a pile of parcels and gifts on a quiet street at sunset",
      kicker: "Packages and gifts",
      title: "From a gift box to the receiver's door",
      body: "Send a gift, something you bought online or a box of belongings. Pick a size, add the receiver's address and we handle the rest.",
      cta: { label: "Send a package", href: "/portal/shipments/new?kind=parcel" },
    },
  ],
};

/** The tracking bar between the carousel and the hero. */
export const trackStrip = {
  title: "Track a shipment",
  subtitle: "Enter your booking number to see where it is right now. No account needed.",
};

/** Short reassurance points under the hero buttons. */
export const heroTrust = [
  "Verified by our team before it sails",
  "Live tracking on a real map",
  "Real people in chat",
];

/** The "checked by people" section on the home page. The checks themselves live in features/shipments/verification.js. */
export const verifyStory = {
  title: "Checked by people, before it sails.",
  body:
    "Every package and every container is placed on hold the moment you book. Our team inspects the real shipment and only approves it for transport once it matches what you declared. If something is wrong, we tell you what and why, instead of letting it travel.",
};

export const promises = [
  {
    title: "Prices you can read",
    body: "Every quote shows what you'll pay and what it covers, before you book.",
  },
  {
    title: "Milestones, not mysteries",
    body: "Each step is logged with a place and time. You and the receiver can follow it with one booking number.",
  },
  {
    title: "A person, not a ticket queue",
    body: "Message our team from inside your account. Replies land in the same thread.",
  },
];

export const services = [
  {
    slug: "packages-and-gifts",
    title: "Packages and gifts",
    summary: "Send a gift, a box of belongings or documents to someone overseas.",
    detail:
      "Pick a box size, tell us who it's going to and we handle the rest. Packages travel by sea with other parcels, which keeps the price low. Add a gift note and we'll include it with the delivery.",
    points: [
      "Standard box sizes from an envelope to extra large",
      "Optional gift note for the receiver",
      "Price based on weight and size, shown before you book",
      "Delivery to the receiver's address",
    ],
  },
  {
    slug: "online-purchases",
    title: "Your online purchases",
    summary: "Bought something and need it delivered to someone else, or to yourself abroad?",
    detail:
      "Send us what you've bought, or have the seller deliver it to our team, and we'll forward it to the receiver. Give us the order details when you book so customs paperwork matches the contents.",
    points: [
      "Forward a purchase to a friend, family member or yourself",
      "Declared value recorded for customs",
      "Same tracking number from our hands to the receiver's door",
      "Message us if the seller needs delivery instructions",
    ],
  },
  {
    slug: "container-shipping",
    title: "Container shipping",
    summary: "Full container loads in 20ft and 40ft standard and high-cube equipment.",
    detail:
      "Book whole containers between major ports. You choose the equipment and quantity, and we confirm the sailing, the cut-off dates and the discharge port details.",
    points: [
      "20ft, 40ft and 40ft high-cube containers",
      "Booking confirmation with cut-off dates",
      "Milestone updates from loading to discharge",
      "Dedicated booking number for every shipment",
    ],
  },
  {
    slug: "lcl-consolidation",
    title: "Pallets and part loads",
    summary: "Share container space when your goods don't fill a full box.",
    detail:
      "Part loads (LCL) let smaller commercial consignments travel economically. Goods are consolidated at origin and separated at destination, priced by volume or weight, whichever is greater.",
    points: [
      "Pay for the space you use",
      "Consolidation at origin, deconsolidation at destination",
      "Suitable for palletised and boxed goods",
      "Clear handling and storage notes up front",
    ],
  },
  {
    slug: "reefer",
    title: "Temperature-controlled cargo",
    summary: "Refrigerated containers for food, produce and pharmaceuticals.",
    detail:
      "Reefer containers hold a set temperature for the whole voyage. Tell us the required range when you book so the right equipment and plug-in schedule are arranged.",
    points: [
      "20ft and 40ft reefer equipment",
      "Set-point recorded on the booking",
      "Pre-trip inspection before loading",
      "Priority attention on delay or alarm",
    ],
  },
  {
    slug: "customs-support",
    title: "Customs documentation",
    summary: "Help preparing the paperwork that keeps shipments moving through ports.",
    detail:
      "We help you assemble the commercial invoice, packing list and bill of lading details, and flag anything missing before your shipment reaches the terminal. It applies to packages and cargo alike.",
    points: [
      "Document checklist per shipment",
      "Guidance on declared value and contents",
      "Early warning on missing information",
      "Guidance on Incoterms for commercial cargo",
    ],
  },
  {
    slug: "project-cargo",
    title: "Heavy and oversized cargo",
    summary: "Break-bulk and out-of-gauge cargo planned with our operations team.",
    detail:
      "Machinery, vehicles and other cargo that doesn't fit a standard container needs a plan. Tell us the dimensions and weight and an operations specialist will respond with options.",
    points: [
      "Open-top and flat-rack options",
      "Lifting and lashing coordination",
      "Route and vessel suitability review",
      "Single point of contact",
    ],
  },
];

export const process = [
  {
    title: "Choose package or cargo",
    body: "Tell us what you're sending and between which ports. You see an indicative price straight away.",
  },
  {
    title: "Add sender and receiver",
    body: "Enter who it's from and exactly who and where it's going to. We issue a booking number, and our team verifies the shipment before it sails.",
  },
  {
    title: "Follow every milestone",
    body: "Collected, loaded, sailed, arrived, delivered. Each step is logged with a place and time, on a live map.",
  },
  {
    title: "Ask us anything",
    body: "Use Messages in your portal. Our team sees your shipments alongside your question.",
  },
];

export const about = {
  title: "Shipping should feel straightforward",
  intro:
    "Sea Go was built for people and businesses who send things across the sea and are tired of chasing updates. Whether it's a birthday gift or a container of goods, you get clear tools and a human team behind them.",
  values: [
    {
      title: "Plain language",
      body: "No jargon walls. If a term matters, we explain it where you need it.",
    },
    {
      title: "Honest estimates",
      body: "Quotes are labelled as indicative until a booking is confirmed, and we tell you what can change them.",
    },
    {
      title: "Accountable updates",
      body: "Every status change is recorded with who made it and when.",
    },
  ],
};

export const faqs = [
  {
    q: "What can I send?",
    a: "Anything legal that fits our limits: gifts, things you bought online, personal belongings and documents as packages, up to 70 kg each, or goods by the pallet and container as cargo. Cash, weapons, loose batteries, aerosols and perishable or flammable items can't go.",
  },
  {
    q: "How do I send a package to someone?",
    a: "Create an account, choose Send a shipment, pick Package, then enter the sender and the receiver's name, phone and full address. You get a booking number straight away that you can share with the receiver.",
  },
  {
    q: "Why is my shipment on hold?",
    a: "Every new booking is placed on hold while the Sea Go team verifies it. We inspect the actual package or cargo to confirm it matches what you declared, and approve it for transport once it's cleared. The status updates in your portal and on the tracking page, and we'll message you if we need anything.",
  },
  {
    q: "How long does a package take?",
    a: "Packages go by sea, so expect weeks rather than days. The quote shows a typical transit time for your route. Your confirmed time depends on the sailing.",
  },
  {
    q: "Is the online price final?",
    a: "The calculator gives an indicative estimate based on the sea route and the weight or equipment. Your confirmed price is issued with the booking and can change if the real weight, size or details differ.",
  },
  {
    q: "How do I track a shipment?",
    a: "Enter your booking number on the Track page. No account is needed, so the receiver can follow it too. Signed-in customers also see full details in their portal.",
  },
  {
    q: "Can I talk to someone about my shipment?",
    a: "Yes. Open Messages in your portal to chat with our team. You can also email or call using the details on the contact page.",
  },
  {
    q: "Which ports do you serve?",
    a: "The quote tool lists the ports currently available across Europe, the Americas, Africa and Asia. If yours isn't there, contact us and we will check options.",
  },
];

export const legal = {
  updated: "January 2026", // PLACEHOLDER
  privacy: [
    {
      heading: "What we collect",
      body: "Account details (name, email, company, phone), shipment details you submit (ports, cargo description, contacts) and messages you send to our team.",
    },
    {
      heading: "How we use it",
      body: "To arrange and track shipments, respond to your messages, prevent misuse of the service and meet legal obligations.",
    },
    {
      heading: "Who we share it with",
      body: "Carriers, terminals, customs authorities and service providers, only as needed to move your cargo and operate the platform.",
    },
    {
      heading: "Your choices",
      body: "You can update your profile in Settings and ask us to correct or delete your data by contacting us.",
    },
  ],
  terms: [
    {
      heading: "Using Sea Go",
      body: "You must provide accurate information and keep your sign-in details secure. You are responsible for activity on your account.",
    },
    {
      heading: "Quotes and bookings",
      body: "Online estimates are indicative. A booking is confirmed only when we issue a booking number and confirmation.",
    },
    {
      heading: "Cargo",
      body: "You must not ship prohibited goods and must declare cargo accurately. Misdeclaration may lead to delay, additional charges or refusal.",
    },
    {
      heading: "Liability",
      body: "Liability is limited as set out in your booking confirmation and applicable carrier terms.",
    },
  ],
  notice:
    "This is template text for development. Have it reviewed by a qualified lawyer before you publish.",
};