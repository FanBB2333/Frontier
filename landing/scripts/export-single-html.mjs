// Inlines a Vite build (one entry script, one stylesheet) into a single self-contained HTML
// file: scripts, styles, fonts and images become inline code and data: URLs.
// Usage (after a `vite build` with the default base "/"): node scripts/export-single-html.mjs [outfile]

import { readFile, readdir, writeFile } from "node:fs/promises"
import { extname, resolve } from "node:path"

const dist = resolve("dist")
const { name } = JSON.parse(await readFile("package.json", "utf8"))
const output = resolve(process.argv[2] ?? `dist/${name}.html`)
const mime = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
}

const dataUrl = async (file) => `data:${mime[extname(file)]};base64,${(await readFile(file)).toString("base64")}`

const assets = new Map()
for (const file of await readdir(resolve(dist, "assets"))) {
  if (mime[extname(file)]) assets.set(file, await dataUrl(resolve(dist, "assets", file)))
}
const inlineAssets = (code) => code.replace(/\/assets\/([\w.-]+)/g, (m, file) => assets.get(file) ?? m)

let html = await readFile(resolve(dist, "index.html"), "utf8")
const script = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
const style = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)
if (!script || !style) throw new Error("Could not locate the built script and stylesheet")
const local = (url) => resolve(dist, "assets", url.split("/assets/").pop())
const js = inlineAssets(await readFile(local(script[1]), "utf8")).replaceAll("</script", "<\\/script")
const css = inlineAssets(await readFile(local(style[1]), "utf8")).replaceAll("</style", "<\\/style")
html = html.replace(script[0], () => `<script type="module">${js}</script>`)
html = html.replace(style[0], () => `<style>${css}</style>`)

// The favicon, copied from public/.
for (const [attr, href] of html.matchAll(/href="(\/[\w.-]+\.svg)"/g)) {
  html = html.replace(attr, `href="${await dataUrl(resolve(dist, href.slice(1)))}"`)
}

if (/["'(]\/assets\//.test(html)) throw new Error("Export still references an external build asset")
await writeFile(output, html)
console.log(`Exported ${output} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`)
