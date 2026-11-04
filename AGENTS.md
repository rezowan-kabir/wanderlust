<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wanderlust

Single Next.js 16 App Router site at the repo root. Routes: `/`, `/destinations`, `/destinations/[id]`, `/destinations/[id]/edit`, `/add-destination`, `/bookings`, `/login`, `/signup`. `/login` and `/signup` are placeholders, and the Navbar/Footer link to `/admin` and `/profile`, which have no route files yet. There are no tests or CI. Package data lives in a separate Express + MongoDB backend at `../wanderlust-server` (run it locally on `:8000`; restart it after editing its routes); it is documented in README.md.

## Commands

- `npm run dev` — dev server (Turbopack); does **not** typecheck.
- `npm run lint` — ESLint 9 flat config, currently clean. Use `npx eslint <path>` to check only the files you touched.
- `npx next typegen`, then `npx tsc --noEmit` — fast typecheck without a full build. `typegen` is required first: it creates the gitignored `next-env.d.ts` and the route types behind the global `PageProps` / `LayoutProps` helpers. Run it on a fresh checkout and again after adding, renaming, or deleting a route — stale `.next/types` makes `tsc` fail with `TS2307: Cannot find module '../../src/app/...'` for routes that no longer exist.
- `npm run build` / `npm start` — production build and serve (`next build` is what actually typechecks).

There is no `test` or `typecheck` script. Run `typegen` + `tsc` and lint before considering work done.

## Environment

`.env` is gitignored and absent from a fresh clone. Keys the app reads:

- `NEXT_PUBLIC_API_URL` — package API base URL, default `http://localhost:8000` (see `src/lib/api.ts`).
- `BETTER_AUTH_URL` — Better Auth base URL (`http://localhost:3000` locally).
- `BETTER_AUTH_SECRET` — required by Better Auth.
- `MONGODB_URI` — required by the auth route. Every page still renders without it; only Better Auth requests fail.

Don't commit values from `.env` or paste them into docs/tests.

## Auth (Better Auth + MongoDB)

- `src/lib/auth.ts` — server config (`mongodbAdapter`, email/password enabled; GitHub social provider is commented out). The database name is hardcoded as `"wamderlust"` (typo included); renaming it orphans existing auth collections.
- `src/lib/auth-client.ts` — client helpers. It creates **two** clients: `authClient` with `baseURL`, and `signIn` / `signUp` / `useSession` destructured from a separate default client. If you change client options, change both or use one consistently.
- `src/app/api/auth/[...all]/route.ts` — the catch-all handler, and the repo's only API route. Add Better Auth endpoints by configuring `src/lib/auth.ts`, not by adding routes.
- Nothing consumes the session yet and no page is protected. Don't assume guards, middleware, or a user model exist; add them when wiring `/login`, `/signup`, `/profile`, or `/admin`.

## Next.js 16 settings that change how you write code

`next.config.ts` enables all three of these; don't add redundant experimental flags:

- `cacheComponents: true` — PPR is the default and data fetching is dynamic by default. Cache deliberately with `"use cache"` plus `cacheLife` / `cacheTag`. Do not add route `runtime` exports (`nodejs` or `edge`); they are unsupported with Cache Components.
- `partialPrefetching: true` — requires `cacheComponents`; removing either breaks config validation.
- `reactCompiler: true` — don't add manual `useMemo` / `useCallback` purely for render optimization.

Route props are async: `params` and `searchParams` are Promises. Prefer the generated global helpers, e.g. `PageProps<'/destinations/[id]'>` and `LayoutProps<'/'>`, rather than hand-written prop types. In both destination pages the `await params` + `fetch` work sits in a `<Suspense>`-wrapped child, which is required for these routes to prerender.

## Data model

- `src/lib/travel-packages.ts` owns package data: the `TravelPackage` type, `fetchTravelPackages()` (GET `{API_BASE_URL}/destination`, singular; accepts a bare array or an object containing one, and maps Mongo `_id` to `id`), and `useTravelPackages()` — a `useSyncExternalStore` + localStorage store with a cross-tab `storage` listener. When the API is unreachable it falls back to this browser's saved copies and returns an error string.
- `/destinations/[id]` fetches GET `{API_BASE_URL}/destination/{id}` on the server. **API quirk:** a missing id returns `200` and a `null` body, not `404` (see `wanderlust-server/index.js`). Treat `null` as not-found, and call `notFound()` *outside* the `try` that wraps the fetch — it works by throwing. The route builds as a Partial Prerender (◐).
- Edit/delete call `PUT` / `DELETE {API_BASE_URL}/destination/{id}` (added to `wanderlust-server`), then keep the browser copy in sync with `updateTravelPackage()` / `removeTravelPackage()`.
- `src/app/not-found.tsx` is the app-wide 404 (used by `notFound()` and unmatched URLs); `src/app/loading.tsx` is the app-wide Suspense fallback. A `notFound()` thrown after a Suspense fallback has streamed still renders the 404 UI, but the HTTP status is already sent.
- `Navbar` calls `usePathname()`, which can't run in a dynamic route's static shell — it is streamed via `<Suspense fallback={null}>` in `layout.tsx` (absolute positioning makes a null fallback layout-safe).
- `src/lib/bookings.ts` repeats that store pattern for bookings. Bookings copy the package fields at booking time and both stores are browser-local only — never shared between devices or browsers.
- `/add-destination` POSTs to `{API_BASE_URL}/add-destination` itself, then calls `saveTravelPackage()` for the local copy, so packages created while the API is down still render. The real form is inline in `src/app/add-destination/page.tsx`; `src/components/add-destination-form.tsx` is an empty leftover.
- `rating` is optional on `TravelPackage`; never assume a destination card has one (the detail page substitutes `4.9`).
- Import `API_BASE_URL` from `@/lib/api` in Server Components. `travel-packages.ts` is `"use client"`, so importing the value from there in a server file yields a client-reference stub rather than the string (client components may use either).
- `<Toaster>` wraps the whole app in `layout.tsx`, so `toast.add({...})` works from any component.

## UI and styling

- Tailwind CSS v4 is CSS-first: there is no `tailwind.config.*`. Theme tokens and dark-mode variables live in `src/app/globals.css` (`@theme inline`, `:root`, `.dark`), including `--color-brand` used as `bg-brand` / `text-brand`. CSS is processed by the `@tailwindcss/turbopack` loader configured in `next.config.ts`, not PostCSS.
- Components use shadcn **base-nova** style with `@base-ui/react` (Base UI), not Radix. Add components with the repo-local CLI (`npx shadcn add <component>`) so `components.json` style/aliases are respected; don't introduce Radix primitives alongside them.
- Vendored shadcn components in `src/components/ui` are expected to be edited in place when customizing.
- Class merging uses the `cn` package (shadcn's `clsx` + `tailwind-merge` replacement), not those two libraries. `src/lib/utils.ts` re-exports it, but generated components import `cn` from `"cn"` directly.
- API image URLs use `next/image` with `unoptimized`, because they can come from arbitrary hosts and `images.remotePatterns` only allows `images.unsplash.com`. Don't drop `unoptimized` unless you also allow the host in `next.config.ts`.
- Page imagery is in `public/assets` and `public/assets/destinations`; reference it as `/assets/...`.
