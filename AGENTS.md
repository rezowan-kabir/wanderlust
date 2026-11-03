<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wanderlust

Single Next.js App Router site at the repo root. Routes: `/`, `/destinations`, `/destinations/[id]`, `/destinations/[id]/edit`, `/add-destination`, `/bookings`. There are no API routes, tests, or CI in this repo — package data lives in a separate backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`), documented in README.md. That backend is a separate repo at `../wanderlust-server` (Express + MongoDB); restart it after editing its routes.

## Commands

- `npm run dev` — dev server (Turbopack).
- `npm run lint` — ESLint 9 flat config, currently clean. Use `npx eslint <path>` to check only the files you touched.
- `npx next typegen`, then `npx tsc --noEmit` — fast typecheck without a full build. `typegen` is required first: it creates the gitignored `next-env.d.ts` and the route types behind the global `PageProps` / `LayoutProps` helpers. Run it on a fresh checkout and again after adding, renaming, or deleting a route — stale `.next/types` makes `tsc` fail with `TS2307: Cannot find module '../../src/app/...'` for routes that no longer exist.
- `npm run build` / `npm start` — production build and serve.

There is no `test` or `typecheck` script.

## Next.js 16 settings that change how you write code

`next.config.ts` enables all three of these; don't add redundant experimental flags:

- `cacheComponents: true` — PPR is the default and data fetching is dynamic by default. Cache deliberately with `"use cache"` plus `cacheLife` / `cacheTag`. Do not add route `runtime` exports (`nodejs` or `edge`); they are unsupported with Cache Components.
- `partialPrefetching: true` — requires `cacheComponents`; removing either breaks config validation.
- `reactCompiler: true` — don't add manual `useMemo` / `useCallback` purely for render optimization.

Route props are async: `params` and `searchParams` are Promises. Prefer the generated global helpers, e.g. `PageProps<'/blog/[slug]'>` and `LayoutProps<'/'>` (the root layout already uses `LayoutProps<"/">`), rather than hand-written prop types.

Turbopack is the default bundler for dev and build, but the dev server does **not** typecheck (`next build` does). Run the typecheck commands above before considering work done.

## Data model

- `src/lib/travel-packages.ts` owns package data: the `TravelPackage` type, `fetchTravelPackages()` (GET `{API_BASE_URL}/destination`, singular; accepts a bare array or `{ packages: [...] }`), and `useTravelPackages()` — a `useSyncExternalStore` + localStorage store with a cross-tab `storage` listener. When the API is unreachable it falls back to this browser's saved copies and returns an error string.
- `/destinations/[id]` fetches GET `{API_BASE_URL}/destination/{id}` on the server. With `cacheComponents` this is the pattern: the page render must `await` `params` / `fetch` only inside a `<Suspense>`-wrapped child, or prerendering fails with `blocking-prerender-dynamic`. The route builds as a Partial Prerender (◐).
- **API quirk:** `GET /destination/{id}` answers a missing id with `200` and a `null` body, not `404` (see `wanderlust-server/index.js`). Treat `null` as not-found, and call `notFound()` *outside* the `try` that wraps the fetch — it works by throwing.
- Edit/delete call `PUT` / `DELETE {API_BASE_URL}/destination/{id}` (added to `wanderlust-server`), then keep the browser copy in sync with `updateTravelPackage()` / `removeTravelPackage()`.
- `src/app/not-found.tsx` is the app-wide 404 (used by `notFound()` and unmatched URLs); `src/app/loading.tsx` is the app-wide Suspense fallback. A `notFound()` thrown after a Suspense fallback has streamed still renders the 404 UI, but the HTTP status is already sent.
- `Navbar` calls `usePathname()`, which also can't run in a dynamic route's static shell — it is streamed via `<Suspense fallback={null}>` in `layout.tsx` (absolute positioning makes a null fallback layout-safe).
- `src/lib/bookings.ts` repeats that store pattern for bookings. Both stores are browser-local only — they are never shared between devices or browsers.
- `/add-destination` POSTs to `{API_BASE_URL}/add-destination` itself, then calls `saveTravelPackage()` for the local copy, so packages created while the API is down still render.
- `rating` is optional on `TravelPackage`; never assume a destination card has one.
- Import `API_BASE_URL` from `@/lib/api` in Server Components. `travel-packages.ts` is `"use client"`, so importing the value from there in a server file yields a client-reference stub rather than the string (client components may use either).
- `<Toaster>` wraps the whole app in `layout.tsx`, so `toast.add({...})` works from any component.

## UI and styling

- Tailwind CSS v4 is CSS-first: there is no `tailwind.config.*`. Theme tokens and dark-mode variables live in `src/app/globals.css` (`@theme inline`, `:root`, `.dark`). CSS is processed by the `@tailwindcss/turbopack` loader configured in `next.config.ts`, not PostCSS.
- Components use shadcn **base-nova** style with `@base-ui/react` (Base UI), not Radix. Add components with the repo-local CLI (`npx shadcn add <component>`) so `components.json` style/aliases are respected; don't introduce Radix primitives alongside them.
- Vendored shadcn components in `src/components/ui` are expected to be edited in place when customizing.
- Class merging uses the `cn` package (shadcn's `clsx` + `tailwind-merge` replacement), not those two libraries. `src/lib/utils.ts` re-exports it, but generated components import `cn` from `"cn"` directly.
- Page imagery is in `public/assets` and `public/assets/destinations`; reference it as `/assets/...`.
