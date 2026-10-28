# Progress report

An interactive, top-down tree report built into one self-contained HTML file that opens offline. Part of [Frontier](../README.md).

A report is a tree. The first levels hold plain-language findings; deeper levels hold the specifics: numbers, tables, file paths, commits and decisions. The page offers:

- a tree view with zoom and pan, and an outline view
- a detail panel
- search and status filters
- a walk mode that presents the nodes one by one in depth-first order

```bash
pnpm install
pnpm dev                                # latest report, hot reload
pnpm build                              # latest report by date suffix
REPORT=atlas-demo-2026-10-28 pnpm build # a specific report
```

`pnpm build` writes `dist/index.html` and copies it to `out/<report-id>.html`, so every report keeps its own snapshot.

## Write a report

1. Copy `src/reports/atlas-demo-2026-10-28.ts` to `src/reports/<topic>-<YYYY-MM-DD>.ts` and edit the tree. The demo describes a made-up course project.
2. The schema is in `src/report/types.ts`. Each node has these fields:
   - `title`
   - `summary`: one line, shown on the card
   - `status` (optional): `done`, `doing`, `decision`, `risk` or `info`
   - `body`, `points`, `metrics`, `table` (with optional `highlight` rows), `sources`
   - `children`

   `levels` names the depths below the root, from plain to specific. Inline text may use `**bold**` and `` `code` ``.
3. Build, then open `out/<report-id>.html`.

## Controls

| Key | Action |
| --- | --- |
| ↑ / ↓ | parent / first child |
| ← / → | previous / next sibling |
| Enter | expand or collapse |
| / | search (Enter: next match, Shift+Enter: previous) |
| p | walk mode; ← / → or Space to step, Esc to leave |
| d | light / dark |

Double-click a node to expand it; drag the empty canvas to pan.

## Appearance

The gear button opens the settings in three tabs:

- 外观: colour mode and theme colour
- 组件: node width, detail panel width, card style, corner radius, spacing, summary lines and detail text size
- 快捷键: the keyboard shortcuts

Sizes reach the CSS as variables on `<html>` (`--node-width`, `--card-radius`, `--tree-gap-x`, `--tree-gap-y`, `--elbow-top`), set in `src/components/theme-provider.tsx`.

A theme colour is a `data-theme` override of Kumo's `--color-kumo-brand` token in `src/index.css`. To add one, add the override there and list it in `src/components/theme-provider.tsx` and `src/components/report/settings-menu.tsx`. `index.html` applies the saved mode and accent before first paint; keep its storage keys in sync with `APP_ID` in `src/lib/app.ts`.
