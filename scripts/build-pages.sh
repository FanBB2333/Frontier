#!/usr/bin/env bash
# Builds the GitHub Pages site into _site/: the gallery (showcase/) at the root and each
# template in a folder of its own name, all with relative asset paths so the site works under
# any path prefix (https://<user>.github.io/<repo>/ or a custom domain).
set -euo pipefail
cd "$(dirname "$0")/.."

TEMPLATES=(annotation slides landing report)
OUT=_site

for app in showcase "${TEMPLATES[@]}"; do
  pnpm -C "$app" install --frozen-lockfile
done

rm -rf "$OUT"
VITE_BASE=./ pnpm -C showcase build
cp -R showcase/dist "$OUT"

for app in "${TEMPLATES[@]}"; do
  # Pages has no SPA fallback, so the annotation console routes by hash there.
  VITE_BASE=./ VITE_ROUTER=hash pnpm -C "$app" build
  cp -R "$app/dist" "$OUT/$app"
done

echo "Built $OUT/ with: showcase ${TEMPLATES[*]}"
