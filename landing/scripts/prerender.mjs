// Renders the page to HTML at build time and writes it into dist/index.html, so the page
// has its content without JavaScript (search engines, link previews, slow networks).

import { readFile, rm, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const ssrDir = resolve("dist-ssr")
const { render } = await import(pathToFileURL(resolve(ssrDir, "entry-server.js")).href)
const file = resolve("dist/index.html")
const html = await readFile(file, "utf8")
if (!html.includes("<!--app-->")) throw new Error("dist/index.html has no <!--app--> placeholder")
await writeFile(file, html.replace("<!--app-->", () => render()))
await rm(ssrDir, { recursive: true, force: true })
console.log("Prerendered dist/index.html")
