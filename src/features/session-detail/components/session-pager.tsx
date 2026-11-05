import { useNavigate } from "react-router"

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { SESSIONS_PER_CYCLE } from "@/lib/program"
import { ROUTES } from "@/routes"

interface SessionPagerProps {
  /** Numéro de séance (1-6). */
  number: number
}

/** Navigation précédente / suivante entre les 6 séances. */
export function SessionPager({ number }: SessionPagerProps) {
  const navigate = useNavigate()
  const go = (n: number) => navigate(ROUTES.session(n), { replace: true })

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
        {number} / {SESSIONS_PER_CYCLE}
      </span>
      <Button
        variant="secondary"
        size="icon-md"
        aria-label="Séance suivante"
        disabled={number >= SESSIONS_PER_CYCLE}
        className="disabled:opacity-40"
        onClick={() => go(number + 1)}
      >
        <ChevronRightIcon size={18} strokeWidth={2.2} />
      </Button>
    </div>
  )
}
