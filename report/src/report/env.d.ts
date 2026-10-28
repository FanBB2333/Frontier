// "@report" is aliased in vite.config.ts to the report selected at build time.
declare module "@report" {
  import type { Report } from "@/report/types"
  const report: Report
  export default report
}

declare const __REPORT_ID__: string
