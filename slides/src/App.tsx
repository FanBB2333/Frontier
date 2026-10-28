import { TooltipProvider } from "@/components/ui/tooltip"
import { Deck } from "@/deck/Deck"

export default function App() {
  return (
    <TooltipProvider delay={300}>
      <Deck />
    </TooltipProvider>
  )
}
