<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wanderlust

Single Next.js App Router site at the repo root. Routes live in `src/app`; there is no backend, API layer, test suite, or CI yet.

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

## UI and styling

- Tailwind CSS v4 is CSS-first: there is no `tailwind.config.*`. Theme tokens and dark-mode variables live in `src/app/globals.css` (`@theme inline`, `:root`, `.dark`). CSS is processed by the `@tailwindcss/turbopack` loader configured in `next.config.ts`, not PostCSS.
- Components use shadcn **base-nova** style with `@base-ui/react` (Base UI), not Radix. Add components with the repo-local CLI (`npx shadcn add <component>`) so `components.json` style/aliases are respected; don't introduce Radix primitives alongside them.
- Vendored shadcn components in `src/components/ui` are expected to be edited in place when customizing.
- Class merging uses the `cn` package (shadcn's `clsx` + `tailwind-merge` replacement), not those two libraries. `src/lib/utils.ts` re-exports it, but generated components import `cn` from `"cn"` directly.
- Page imagery is in `public/assets` and `public/assets/destinations`; reference it as `/assets/...`.
