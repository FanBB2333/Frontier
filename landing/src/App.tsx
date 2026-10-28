import {
  Baseline,
  Compare,
  CtaBand,
  Footer,
  Hero,
  Limits,
  Nav,
  QuickStart,
  Templates,
} from "@/site/sections"
import { useScrollReveal } from "@/site/parts"

export default function App() {
  useScrollReveal()
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Templates />
        <Baseline />
        <QuickStart />
        <Compare />
        <Limits />
        <CtaBand />
      </main>
      <Footer />
    </>
  )
}
