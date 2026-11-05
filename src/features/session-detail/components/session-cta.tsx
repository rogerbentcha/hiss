import { Link } from "react-router"

import { LockIcon, PlayFilledIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import type { Availability } from "@/lib/program"
import { ROUTES } from "@/routes"
import type { SessionStatus } from "@/types/program"

interface SessionCtaProps {
  status: SessionStatus
  number: number
  availability: Availability
  /** En mode exemple, le CTA renvoie vers l'onboarding. */
  isDemo: boolean
}

/** Bas de page du détail : lancer la séance, ou rappel qu'elle est verrouillée. */
export function SessionCta({ status, number, availability, isDemo }: SessionCtaProps) {
  if (status === "available" || status === "resting") {
    return (
      <div className="flex flex-col items-start gap-2.5">
        <Button asChild size="lg" className="max-[600px]:self-stretch">
          <Link to={isDemo ? ROUTES.welcome : ROUTES.workout}>
            <PlayFilledIcon size={20} />
            Commencer la séance
          </Link>
        </Button>
        {status === "resting" && (
          <p className="m-0 text-[13px] text-muted-foreground">
            Ton repos n'est pas terminé : la séance est {availability.longText}.
          </p>
        )}
      </div>
    )
  }

  if (status === "locked") {
    return (
      <div className="flex h-[60px] items-center justify-center gap-2.5 self-start rounded-[28px] border-2 border-dashed border-surface-3 px-7 text-[13px] text-muted-foreground max-[600px]:self-stretch">
        <LockIcon size={20} />
        Termine d'abord la séance {number - 1}
      </div>
    )
  }

  return null
}
