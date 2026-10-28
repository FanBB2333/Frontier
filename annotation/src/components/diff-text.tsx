import { diffWords, type ChangeObject } from "diff"
import { useMemo } from "react"

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("zh", { granularity: "word" })
    : undefined

/** Inline word-level diff (Chinese-aware via Intl.Segmenter): deletions struck through, insertions highlighted. */
export function DiffText({ before, after }: { before: string; after: string }) {
  const parts = useMemo<ChangeObject<string>[]>(
    () =>
      diffWords(before, after, segmenter ? { intlSegmenter: segmenter } : {}),
    [before, after]
  )
  return (
    <>
      {parts.map((p, i) =>
        p.added ? (
          <ins key={i} className="diff-add">
            {p.value}
          </ins>
        ) : p.removed ? (
          <del key={i} className="diff-del">
            {p.value}
          </del>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </>
  )
}
