import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { useExercise } from "@/hooks/use-exercise"
import type { Availability } from "@/lib/program"

interface ProgramHeroProps {
  availability: Availability
  isDemo: boolean
}

/** En-tête « Ton programme » et CTA vers la prochaine séance ou le test. */
export function ProgramHero({ availability, isDemo }: ProgramHeroProps) {
  const { routes } = useExercise()
  const cycleDone = availability.cycleDone
  const ctaTo = cycleDone ? routes.max : routes.session(availability.nextIndex + 1)
  const ctaLabel = cycleDone ? "Passer le test" : `Voir la séance ${availability.nextIndex + 1}`

  return (
    <section aria-labelledby="recap-title" className="flex flex-col gap-5">
      {isDemo && (
        <p className="surface-card m-0 px-3.5 py-2.5 text-[13px] text-subtle">
          Exemple de programme. <Link to={routes.welcome}>Fais l'onboarding</Link> pour générer le tien.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          id="recap-title"
          className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl"
        >
          Ton programme
        </h1>
        <Button asChild size="md">
          <Link to={ctaTo}>{ctaLabel}</Link>
        </Button>
      </div>
    </section>
  )
}
