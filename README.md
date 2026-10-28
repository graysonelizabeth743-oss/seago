# Sea Go

Send anything by sea, from a gift box to a full container. Customers get an instant quote, book a package or
cargo, follow every milestone on a real map and chat with the operations team. Staff run shipments, customers, enquiries and
the chat inbox from an admin console.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS 4 · Firebase (Auth + Firestore) · self-hosted fonts
(Manrope for headings, Public Sans for body, installed from npm so nothing is fetched at build time).

## Quick start

```bash
npm install
cp .env.example .env.local      # then add your Firebase web-app config
npm run dev                     # http://localhost:3000
```

Production: `npm run build && npm start`.
The site builds and renders without Firebase credentials (auth, chat and tracking show a notice until you add them).

## 1. Set up Firebase (once)

Create a **new** Firebase project for Sea Go. Don't reuse another app's project: deploying these rules would replace its rules.

1. Console → **Authentication → Sign-in method** → enable **Email/Password**.
2. Console → **Firestore Database** → create a database (production mode).
3. Console → **Project settings → Your apps → Web app** → copy the config into `.env.local`.
4. Deploy the security rules (this is where access control is enforced):
   ```bash
   npx firebase login
   npx firebase use --add          # pick your project
   npx firebase deploy --only firestore:rules,firestore:indexes
   ```
5. Register an account on the site, then make yourself the first admin:
   Firestore console → `users` → your document → set `role` to `admin`. Sign out and in again.
   (Rules stop anyone granting themselves this role. Later admins can be promoted from **Admin → Customers**.)

No composite indexes are needed.

## 2. Edit your content (no code changes needed)

| File | What it controls |
|---|---|
| `src/config/site.js` | Brand name, **logo path**, **contact details** (email, phone, WhatsApp, hours, address), social links, all navigation |
| `src/config/content.js` | Home hero, services, process steps, FAQ, About and legal text |
| `src/config/logistics.js` | Ports, **package sizes and contents**, container types, cargo types, Incoterms and the **pricing for both packages and cargo** |

Everything marked `PLACEHOLDER` in these files must be replaced before launch (contact details, company name,
addresses, prices, legal text).

### Logo

Put your file in `public/` (default `public/logo.png`; see `public/README.txt`). If you have a light version for
dark backgrounds, set `site.logo.srcDark`. Until the file exists a built-in wordmark is shown.

## 3. How it fits together

```
src/
  app/            routes (route groups: (marketing) (auth) (portal) (admin))
  components/     ui/ (Button, forms, Waves, RouteArc…) and layout/ (Navbar, Footer, PortalShell)
  features/       auth/ chat/ shipments/ quotes/ contact/ admin/  (each owns its API, hooks and UI)
  config/         site.js · content.js · logistics.js
  lib/            firebase, formatting, theme
firestore.rules   security rules
```

- **Roles:** `users/{uid}.role` is `user` or `admin`. Route guards redirect in the browser; **Firestore rules are the real enforcement**.
- **Chat:** one thread per customer at `conversations/{uid}` with a `messages` subcollection. Live updates via Firestore listeners,
  unread counters for both sides, sidebar badges. Customers use **Portal → Messages**; staff use **Admin → Inbox**
  (opening a customer from Customers or a shipment starts a thread).
- **Public tracking:** the private shipment record is never world-readable. A sanitised copy (route, status, timeline, no names or
  cargo details) is stored in `trackingLookup/{bookingNumber}`; it can be fetched by exact booking number but never listed.
- **Packages and cargo:** every booking is a `Package` (gifts, online purchases, personal items, documents; priced by the larger of
  actual and volumetric weight) or `Cargo` (containers). The booking flow is What → Details → **Sender & receiver** → Review.
  The receiver's name, phone, email, address, city, postal code and country are stored on the shipment and shown to staff and the sender.
- **Quotes:** an indicative estimate from the real sea-route distance (see `logistics.js`). Confirmed prices are issued by your team.
- **Route map:** an offline SVG map built from Natural Earth coastlines covering the Americas, Europe, Africa and Asia up to East Asia.
  Routes follow real shipping lanes (Suez, Gibraltar, Cape of Good Hope, Panama, Malacca…) defined in `src/features/map/seaGraph.js`,
  not straight lines over land. No tile server or API key is needed.
- **Themes:** light and dark, chosen from the system or the toggle, applied before first paint.
- **Accessibility and motion:** keyboard-friendly, visible focus, reduced-motion respected.

## Adding a port

1. Add it to `ports` in `src/config/logistics.js` (code, name, country, lat, lng).
2. Say which sea-lane waypoints it connects to in `PORT_LINKS` in `src/features/map/seaGraph.js`.
3. Run `npm run validate:routes`. It checks every route against real coastline data and fails if any leg crosses land or a port is unreachable.

`npm run build:map` regenerates `src/features/map/mapData.js` if you change the map area or projection (in `scripts/build-map.mjs`).

## Before you launch

- Replace every `PLACEHOLDER` (contact details, legal entity, prices, legal text) and have the legal pages reviewed.
- Set `NEXT_PUBLIC_SITE_URL` to your real domain.
- Add your domain under Firebase Authentication → Settings → Authorized domains.
- Decide how you'll notify customers by email when a status changes (not included; a Cloud Function is the usual route).
- Payments, document upload and email notifications are not included.
