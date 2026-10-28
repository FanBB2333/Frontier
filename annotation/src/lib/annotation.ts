import type { EditState, SampleView } from "@/lib/api"

export function initialState(sample: SampleView): EditState {
  return {
    fields: Object.fromEntries(sample.fields.map((f) => [f.key, f.value])),
    checks: {},
    note: "",
  }
}

/** Saved state on top of the sample's defaults, so fields added later still get a value. */
export function loadState(sample: SampleView, saved: EditState): EditState {
  const base = initialState(sample)
  return {
    fields: { ...base.fields, ...saved.fields },
    checks: { ...saved.checks },
    note: saved.note ?? "",
  }
}

export function countChanges(sample: SampleView, state: EditState) {
  return sample.fields.filter(
    (f) => (state.fields[f.key] ?? f.value) !== f.value
  ).length
}

export function countIssues(sample: SampleView, state: EditState) {
  return sample.checks.filter((c) =>
    c.issues.includes(state.checks[c.id] ?? "")
  ).length
}

/** Why the sample cannot be marked done yet, or null when it can. */
export function completenessError(
  sample: SampleView,
  state: EditState
): string | null {
  const open = sample.checks.filter((c) => !state.checks[c.id])
  if (open.length)
    return `还有 ${open.length} 个检查项未作答：${open.map((c) => c.label).join("、")}`
  if (countIssues(sample, state) > 0 && !state.note.trim())
    return "存在问题项时请在备注中说明"
  return null
}
