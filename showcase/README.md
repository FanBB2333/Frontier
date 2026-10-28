# Showcase (Pages gallery)

Not a template. This is the page GitHub Pages serves at the site root: a left drawer listing the templates, with the selected one running in a frame next to it. Templates are registered in `src/templates.ts` with their path relative to the gallery, for example `annotation/?as=admin#/tasks`.

It only works next to the template builds, so preview it from the repository root:

```bash
pnpm build:pages && pnpm preview:pages
```
