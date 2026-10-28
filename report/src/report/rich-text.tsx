import { Fragment } from "react"

// Inline markup used in report text: **bold** and `code`.
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          )
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code
              key={i}
              className="rounded bg-kumo-recessed px-1 py-0.5 font-mono text-[0.85em] break-all"
            >
              {p.slice(1, -1)}
            </code>
          )
        return <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}
