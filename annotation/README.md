# Annotation console

A data review and labeling console: sign-in, a task list beside a sample editor with autosave and inline diffs, and an admin area with an overview and user management. Part of [Frontier](../README.md).

```bash
pnpm install
pnpm dev        # http://localhost:5173/, signed out: use admin / admin
pnpm build      # dist/
```

## Data

By default every `api()` call is answered in the browser by `src/lib/mock.ts`. It serves 42 made-up samples of an LLM-response review task, saved to localStorage, so edits survive a reload. Reset them from the user menu. Demo accounts: `admin`, `alice`, `bob`, `carol`, each with its username as the password. `?as=<username>` in the URL signs that account in.

To use a real backend:

```bash
echo "VITE_API_MOCK=false" > .env.local
API_SERVER=http://127.0.0.1:8090 pnpm dev   # /api is proxied there
```

The endpoints and types the UI expects are in `src/lib/api.ts`. The mock in `src/lib/mock.ts` is a working reference implementation of them.

## Layout

| Path | What |
| --- | --- |
| `src/lib/api.ts` | `api()` fetch wrapper, `ApiError`, all request/response types |
| `src/lib/mock.ts` | In-browser backend with sample data |
| `src/lib/annotation.ts` | Draft state helpers: initial state, change/issue counts, completeness |
| `src/hooks/use-draft.ts` | Debounced autosave with serialized saves and conflict handling |
| `src/components/sample-editor.tsx` | The editor: conversation, fields, checks, notes, actions |
| `src/components/editable-text.tsx`, `diff-text.tsx` | Click-to-edit text with word-level diffs |
| `src/pages/` | Login, workspace, admin overview and users |

## Options

| Variable | Effect |
| --- | --- |
| `VITE_API_MOCK=false` | Use the real `/api` instead of the mock |
| `VITE_ROUTER=hash` | Hash routing, for static hosts without SPA fallback |
| `VITE_BASE=/prefix/` | Serve under a path prefix (`./` for any folder) |
| `API_SERVER` | Dev proxy target for `/api` |

Rename the app in `src/lib/app.ts` (`APP_ID`, `APP_NAME`) and the storage key in `index.html`.
