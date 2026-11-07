import { useNavigate } from "react-router"

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useExercise } from "@/hooks/use-exercise"

interface SessionPagerProps {
  /** Numéro de séance (à partir de 1). */
  number: number
  /** Nombre de séances du cycle. */
  count: number
}

/** Navigation précédente / suivante entre les séances du cycle. */
export function SessionPager({ number, count }: SessionPagerProps) {
  const navigate = useNavigate()
  const { routes } = useExercise()
  const go = (n: number) => navigate(routes.session(n), { replace: true })

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon-md"
        aria-label="Séance précédente"
        disabled={number <= 1}
        className="disabled:opacity-40"
        onClick={() => go(number - 1)}
      >
        <ChevronLeftIcon size={18} strokeWidth={2.2} />
      </Button>
      <span className="min-w-12 text-center text-[13px] text-muted-foreground tabular-nums">
        {number} / {count}
      </span>
      <Button
        variant="secondary"
        size="icon-md"
        aria-label="Séance suivante"
        disabled={number >= count}
        className="disabled:opacity-40"
        onClick={() => go(number + 1)}
      >
        <ChevronRightIcon size={18} strokeWidth={2.2} />
      </Button>
    </div>
  )
}
