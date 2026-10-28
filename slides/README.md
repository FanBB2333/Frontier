# Slide deck

A presentation engine on a fixed 1920×1080 canvas, with in-page steps, an overview grid, four color themes, English and Chinese, and a line that morphs from page to page. Part of [Frontier](../README.md).

```bash
pnpm install
pnpm dev           # http://localhost:5173/#/1
pnpm export:html   # dist/frontier-slides.html, one self-contained file
```

## Write your talk

The engine (`src/deck/`) renders whatever `src/slides/index.tsx` exports as `DECK`:

| File | What goes in it |
| --- | --- |
| `src/slides/content.ts` | Title, sections and every string as `{ en, zh }` |
| `src/slides/layout.ts` | Geometry shared by a page and its thread (rects, rings, plot areas) |
| `src/slides/pages.tsx` | One component per page, using `Reveal`, `RevealImage`, `Lead`, `Emphasis` |
| `src/slides/index.tsx` | The registry: `{ id, section, stages, Component, thread }` per page |

A page with `stages: n` receives `stage` (0…n−1). → walks through the stages before turning the page, and `thread(stage)` can return a different outline for each one. Thread outlines come from `src/deck/shapes.ts`: `circle`, `frame`, `curve`, `steps`, `axes`, `spine` and `rule`.

## Keys

→ / Space next · ← previous · Home / End · O overview · T theme · L language · F fullscreen · ? help

## Themes

Palettes are in `src/index.css` under `:root[data-theme="…"]` and are listed in `src/lib/theme.ts`. Each palette sets the shadcn tokens plus the deck's own: `--signal` and `--signal-2` (thread and accents), `--canvas` (letterbox), `--grid-dot`, `--vignette` and `--glow`. Keep the theme ids in the inline script in `index.html` in sync.
