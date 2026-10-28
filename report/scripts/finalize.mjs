// Copy the single-file build to out/<report>.html so every report keeps its own snapshot.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const html = readFileSync(resolve(root, "dist/index.html"), "utf8")
const id = html.match(/<meta name="report-id" content="([^"]+)"/)?.[1]
if (!id) throw new Error("dist/index.html has no report-id meta tag")

mkdirSync(resolve(root, "out"), { recursive: true })
const target = resolve(root, "out", `${id}.html`)
copyFileSync(resolve(root, "dist/index.html"), target)
console.log(`report written to ${target}`)
