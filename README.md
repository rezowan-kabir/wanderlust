# Wanderlust

A travel booking site built with **Next.js 16 (App Router)**, **Better Auth**, and **MongoDB**.
Browse curated destinations, sign up, book trips, and manage your bookings from a
personal dashboard.

The repository contains two cooperating applications:

| App | Location | Purpose |
| --- | --- | --- |
| **Frontend + auth/booking API** | this repo | Next.js site, Better Auth endpoints, booking route handlers |
| **Package API** | `../wanderlust-server` | Express server exposing the `destination` collection |

They share one MongoDB database, so both must run for the site to work end to end.

---

## Features

- **Home page** — hero banner, *Featured Destinations* carousel (shadcn + embla),
  *Why Choose Us*, testimonials, and a call-to-action band.
- **Destinations** — searchable/filterable list with category and price-range filters,
  plus a detail page per package.
- **Add / edit / delete destinations** — forms backed by the Express API.
- **Authentication** — email/password sign-up and sign-in via Better Auth
  (MongoDB adapter), with JWTs issued to the browser and verified server-side.
- **Bookings** — "Book Now" stores the package *and* the signed-in user's
  name/email in MongoDB; **My Bookings** lists them with a status pill,
  cancel, and a details dialog.
- **Profile** — edit display name, avatar, location, and nationality; travel
  statistics grid.
- **Route protection** — `src/proxy.ts` redirects signed-out users away from
  protected paths.
- **Responsive UI** — Tailwind CSS v4, shadcn *base-nova* components on Base UI,
  dark-mode-ready theme tokens, toasts via `<Toaster>`.

## Tech stack

- **Framework:** Next.js 16.4.3, React 19.3, App Router + Cache Components (PPR)
- **Language:** TypeScript (strict checks via `tsc`)
- **Styling:** Tailwind CSS v4 (CSS-first, no `tailwind.config.*`), shadcn/ui
  base-nova components built on `@base-ui/react`
- **Auth:** Better Auth + `@better-auth/mongo-adapter` + `better-auth/plugins/jwt`
- **Database:** MongoDB (driver v7)
- **Carousels:** `embla-carousel-react` through the vendored shadcn `Carousel`
- **Icons:** `lucide-react`
- **Backend:** Express 5 + `jose` (JWT verification) in `../wanderlust-server`

---

## Prerequisites

- **Node.js 20+** and npm
- A **MongoDB** database (local or Atlas)
- Two free ports: **3000** (frontend) and **8000** (package API)

## Getting started

### 1. Install dependencies

```bash
# frontend
cd wanderlust
npm install

# package API (separate directory)
cd ../wanderlust-server
npm install
```

### 2. Configure environment variables

Neither project ships a `.env`; create one in each directory. **Never commit
`.env` values.**

**`wanderlust/.env` (frontend)**

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | ✅ | `mongodb://localhost:27017` | Used by Better Auth and the booking routes. Without it every page still renders, but sign-in and bookings fail. |
| `BETTER_AUTH_SECRET` | ✅ | long random string | Better Auth refuses to start without it. |
| `BETTER_AUTH_URL` | ✅ | `http://localhost:3000` | Base URL the auth *client* calls. |
| `NEXT_PUBLIC_API_URL` | ⬜ | `http://localhost:8000` | Package API base URL. Defaults to `http://localhost:8000`; trailing slashes are stripped automatically. |

**`../wanderlust-server/.env` (package API)**

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | ✅ | `mongodb://localhost:27017` | The server throws on boot if missing. |
| `FRONTEND_BASE_URL` | ✅ | `http://localhost:3000` | No trailing slash. Authenticated routes fetch `{FRONTEND_BASE_URL}/api/auth/jwks` to verify tokens. |
| `PORT` | ⬜ | `8000` | Defaults to `8000`. |

### 3. Start both servers

```bash
# terminal 1 — package API
cd ../wanderlust-server
npm start          # http://localhost:8000

# terminal 2 — frontend
cd wanderlust
npm run dev        # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

> **Order matters for the home page.** The featured carousel is baked in at
> build time with a 15-minute revalidate. If the package API is down when you
> build, the section silently renders as an empty list (the band is omitted).

---

## Commands

Run these from the repository root (`wanderlust/`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with Turbopack. Does **not** typecheck. |
| `npm run lint` | ESLint 9 flat config. |
| `npx eslint <path>` | Lint only the files you touched. |
| `npx next typegen` | Regenerates `next-env.d.ts` and the route types behind `PageProps<>` / `LayoutProps<>`. **Run after adding, renaming, or deleting a route.** |
| `npx tsc --noEmit` | Fast typecheck (run `typegen` first). |
| `npm run build` | Production build — this is what actually typechecks. |
| `npm start` | Serve the production build. |

There is **no `test` script and no CI**; the gate before considering work done is
`typegen` → `tsc` → `eslint` → `build`.

---

## Routes

### Pages

| Route | Access | Description |
| --- | --- | --- |
| `/` | public | Banner, featured carousel, why-us, testimonials, CTA. |
| `/destinations` | protected | All packages with search, category, and price filters. |
| `/destinations/[id]` | protected | Package detail with **Book Now** and delete. |
| `/destinations/[id]/edit` | protected | Edit form for a package. |
| `/add-destination` | protected | Create a package. |
| `/bookings` | protected | My Bookings — rows, status pill, cancel, details dialog. |
| `/profile` | protected | Account settings, location/nationality, travel statistics. |
| `/login`, `/signup` | public | Better Auth email/password forms. |

"Protected" is enforced by `src/proxy.ts`, which redirects signed-out visitors to
`/login`. `/admin` is linked from the navbar/footer but **has no route file yet**
and currently 404s.

### Route handlers (this app)

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `GET/POST /api/auth/[...all]` | — | Better Auth catch-all (sign-up, sign-in, session, `jwks`, `token`, …). |
| `GET /api/bookings` | session | List the current user's bookings. |
| `POST /api/bookings` | session | Create a booking (client sends package fields only). |
| `DELETE /api/bookings/[id]` | session | Remove a booking owned by the current user. |

Booking identity (`userId`, `userName`, `userEmail`) is read from the verified
session server-side, so a client cannot spoof it.

### Package API (`../wanderlust-server`, port 8000)

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `GET /destination` | — | All packages. |
| `GET /featured-destinations` | — | First 5 packages (used by the home page). |
| `GET /destination/:id` | Bearer JWT | One package. A missing id answers `200` with a `null` body, **not** `404`. |
| `POST /add-destination` | Bearer JWT | Create a package. |
| `PUT /destination/:id` | Bearer JWT | Update a package. |
| `DELETE /destination/:id` | Bearer JWT | Delete a package. |

---

## How authentication works

```
┌─────────────┐  sign-up / sign-in   ┌──────────────┐
│  Browser     │ ──────────────────▶ │  Better Auth  │  /api/auth/*
│  (React)     │ ◀────────────────── │  (Next.js)    │
└──────┬──────┘   session cookie     └──────┬───────┘
       │                                    │
       │ authClient.token()                │ mongodbAdapter
       │  → JWT                            ▼
       │                            ┌──────────────────┐
       │  Authorization: Bearer     │  MongoDB         │
       ├──────────────────────────▶ │  db "wamderlust" │
       │                            └──────────────────┘
       │                                    ▲
┌──────▼──────────┐  verifies against       │  shared database
│  Express API     │  {FRONTEND_BASE_URL}    │
│  (port 8000)     │  /api/auth/jwks         │
└─────────────────┘                         │
                                            │
       ┌──────────────────┐                │
       │ Booking routes    │ ───────────────┘
       │ (Next.js)         │  read session directly via getSessionUser()
       └──────────────────┘
```

- **Client-side token** — `src/lib/getTokenFromClient.ts` calls
  `authClient.token()` (from the `jwtClient()` plugin) and throws if the user is
  not signed in. Used by the add/edit/delete forms before calling Express.
- **Server-side token** — `src/lib/getTokenFromServer.ts` calls
  `auth.api.getToken({ headers })` inside Server Components.
- **Express verification** — `verifyToken` middleware in
  `../wanderlust-server/index.js` builds a remote JWKS from
  `FRONTEND_BASE_URL/api/auth/jwks` and validates the bearer token with `jose`.
- **Booking routes** skip JWTs entirely and read the session directly, which is
  why they live in Next.js rather than Express.

Both sides must agree on the database name — see the caveat below.

---

## Data & storage

| Store | Where | Contents |
| --- | --- | --- |
| `destination` | MongoDB (Express) | Travel packages (`_id`, name, country, category, price, duration, departureDate, imageUrl, description, optional `rating`). |
| `bookings` | MongoDB (Next.js route handlers) | One document per booking; copies package fields at booking time plus `userId` / `userName` / `userEmail`. |
| `user`, `session`, `account`, `verification` | MongoDB (Better Auth) | Auth collections. |
| `wanderlust.travel-packages` | Browser `localStorage` | Offline fallback for the destinations list. Only shared across tabs of the **same** browser — never between devices. |

Other things worth knowing:

- **Database name is `wamderlust`** (a typo that shipped early). It is hardcoded
  in `src/lib/auth.ts` and `src/lib/mongodb.ts`; renaming it orphans the existing
  auth collections.
- **Booking status is derived, not stored.** Departure ahead → `Confirmed`,
  departure passed → `Completed`, unparseable → `Pending`.
- **`rating` is optional.** Cards only render the rating badge when the field
  exists; currently no package in the database has one.
- **Images use `next/image` with `unoptimized`** because package images come from
  arbitrary hosts while `images.remotePatterns` only allows `images.unsplash.com`.
- **Fetches that must not go stale** (the featured carousel) carry `"use cache"`;
  without it the home page degrades from static (`○`) to partial prerender (`◐`).

## Project structure

```
wanderlust/
├── public/assets/            page imagery (banner, icons, destination photos)
├── src/
│   ├── app/
│   │   ├── page.tsx          home: Banner → FeaturedDestinations → …
│   │   ├── layout.tsx        Navbar (streamed), Footer, Toaster, Josefin Sans
│   │   ├── destinations/     list, [id] detail, [id]/edit
│   │   ├── add-destination/  create form
│   │   ├── bookings/         My Bookings UI
│   │   ├── profile/          account + statistics
│   │   ├── login/, signup/   Better Auth forms
│   │   └── api/
│   │       ├── auth/[...all]/   Better Auth catch-all
│   │       └── bookings/        booking route handlers
│   ├── components/
│   │   ├── featured-destinations.tsx   server fetch + section header
│   │   ├── featured-carousel.tsx       client carousel
│   │   ├── navbar.tsx, footer.tsx, banner.tsx, testimonials.tsx, …
│   │   └── ui/                         vendored shadcn components
│   ├── lib/
│   │   ├── auth.ts / auth-client.ts    Better Auth server + client
│   │   ├── session.ts, booking-store.ts, mongodb.ts
│   │   ├── travel-packages.ts          package store (localStorage fallback)
│   │   ├── getTokenFromClient.ts / getTokenFromServer.ts
│   │   └── api.ts                      normalized API base URL
│   ├── proxy.ts                        route protection
│   └── app/globals.css                 Tailwind v4 theme tokens
└── next.config.ts                      cacheComponents, PPR, React Compiler
```

---

## Deployment

**Frontend** — deploy this directory as a standard Next.js project. Set every
variable from the table above; for a hosted backend set `NEXT_PUBLIC_API_URL` to
the deployed package API origin.

**Package API** — see `../wanderlust-server/README.md`: import it as its own Vercel
project with `MONGODB_URI` and `FRONTEND_BASE_URL`, and make sure the deployed
frontend exposes `/api/auth/jwks` so tokens can be verified.

---

## Known limitations / TODOs

- `/admin` is linked in the navigation but has no route.
- The signup/login **Google** buttons and the **"Forgot password?"** link are
  non-functional placeholders.
- `layout.tsx` metadata still says `"Create Next App"`.
- No automated tests, no CI.
- `src/proxy.ts` and some debug logging (`console.log`) are works in progress.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Featured Destinations band missing from `/` | Package API not reachable when the page was built. Start it on `:8000` and rebuild. |
| `401 Unauthorized!` from Express | Missing/expired `Authorization: Bearer …` header, or `FRONTEND_BASE_URL` doesn't point at the frontend. |
| Sign-in or bookings fail but pages render | `MONGODB_URI` missing or unreachable — check the terminal running `npm run dev`. |
| `TS2307: Cannot find module '../../src/app/…'` | Stale route types. Run `npx next typegen`. |
| Token works locally, fails deployed | `BETTER_AUTH_URL` / `BETTER_AUTH_SECRET` differ between environments. |
| Port already in use | Frontend expects `3000`, API expects `8000`; change `PORT` on the API side if needed. |


## Live Preview

Experience the live application here:

🔗 **[Visit Live Website](https://wanderlust-rk.vercel.app/)**

## License

Private project — no license file yet.


