import { Link, Navigate } from "react-router"

import { ProgressRing } from "@/components/common/progress-ring"
import { CheckIcon, ChevronLeftIcon } from "@/components/icons"
import { OnboardingLayout } from "@/components/layout/onboarding-layout"
import { Button } from "@/components/ui/button"
import { ConfigSteps, type ConfigStep } from "@/features/onboarding/components/config-steps"
import { useProgram } from "@/hooks/use-program"
import { useProgressAnimation } from "@/hooks/use-progress-animation"
import { getLevel, SESSIONS_PER_CYCLE, SETS_PER_SESSION } from "@/lib/program"
import { ROUTES } from "@/routes"

/** Étape 3 — Génération animée du programme. */
export function ConfigPage() {
  const { program } = useProgram()
  const progress = useProgressAnimation()

  if (!program) return <Navigate to={ROUTES.max} replace />

  const ready = progress >= 100
  const steps: ConfigStep[] = [
    { at: 25, label: "Calcul de ton niveau", detail: `Niveau ${getLevel(program.max).label}` },
    { at: 50, label: "Répartition des séries", detail: `${SESSIONS_PER_CYCLE} × ${SETS_PER_SESSION} séries` },
    { at: 75, label: "Planification des repos", detail: "2 min / série" },
    { at: 100, label: "Préparation du suivi", detail: `${SESSIONS_PER_CYCLE} séances` },
  ]

  return (
    <OnboardingLayout
      step={3}
      logoLink={false}
      mainClassName="max-w-[520px] items-center md:gap-7 md:pt-5"
      footerClassName="max-w-[520px]"
      footer={
        ready && (
          <div className="flex w-full gap-2.5 md:gap-2.5">
            <Button asChild variant="secondary" className="flex-none gap-1.5 pr-4 pl-3 md:pr-5 md:pl-4">
              <Link to={ROUTES.max}>
                <ChevronLeftIcon size={20} />
                Retour
              </Link>
            </Button>
            <Button asChild className="flex-auto">
              <Link to={ROUTES.sessions}>Voir mes séances</Link>
            </Button>
          </div>
        )
      }
    >
      <div className="relative size-24">
        <ProgressRing value={progress / 100} viewBox={168} radius={72} strokeWidth={12} className="size-24" />
        <div className="absolute inset-0 flex items-center justify-center">
          {ready ? (
            <CheckIcon strokeWidth={2.4} className="size-8 text-primary" role="img" aria-label="Terminé" aria-hidden={false} />
          ) : (
            <span className="text-lg font-semibold tracking-[-0.02em] tabular-nums md:text-[19px]">{progress}%</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center md:gap-2.5">
        <h1
          aria-live="polite"
          className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl"
        >
          {ready ? "Ton programme est prêt" : "Configuration de tes séances…"}
        </h1>
        <p className="m-0 text-[15px] leading-normal text-muted-foreground md:text-base">
          {ready
            ? "6 séances à faire à ton rythme, en respectant les repos. Puis un nouveau test."
            : `On adapte chaque série à ton max de ${program.max} tractions.`}
        </p>
      </div>

      <ConfigSteps steps={steps} progress={progress} />
    </OnboardingLayout>
  )
}
