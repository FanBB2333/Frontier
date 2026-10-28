# Product page

A product or project home page: sticky nav, hero with a tabbed terminal, feature cards, a bento grid, steps with copyable code, a comparison table, a limits callout, a CTA band and a footer. It is prerendered to static HTML at build time. Part of [Frontier](../README.md).

```bash
pnpm install
pnpm dev           # http://localhost:5173/
pnpm build         # dist/ with prerendered index.html
pnpm export:html   # dist/frontier-landing.html, one self-contained file
```

## Make it yours

- All copy lives in `src/site/content.ts` as `{ en, zh }` pairs. Change it there; `src/site/sections.tsx` only lays it out.
- Colors are in `src/index.css` (light and dark). The theme tokens follow shadcn's names, so `pnpm dlx shadcn add <component>` fits in.
- Set `APP_ID` and `REPO_URL` in `src/lib/app.ts`, and the storage keys, title and description in `index.html`.

## How the prerender works

`pnpm build` builds the client bundle, then an SSR bundle of `src/entry-server.tsx`. `scripts/prerender.mjs` renders the page in its default theme and language into the `<!--app-->` placeholder of `dist/index.html`. In the browser, `src/main.tsx` hydrates that markup. The theme is applied by a class on `<html>` before first paint, and theme icons switch by CSS, so the markup is the same in light and dark and hydration doesn't mismatch. A visitor who picked Chinese sees the prerendered English until the script loads.
