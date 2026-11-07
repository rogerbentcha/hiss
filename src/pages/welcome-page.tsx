import { Link, Navigate } from "react-router"

import { HisseLogo } from "@/components/common/hisse-logo"
import { OnboardingItem, OnboardingLayout } from "@/components/layout/onboarding-layout"
import { Button } from "@/components/ui/button"
import { FeatureList } from "@/features/onboarding/components/feature-list"
import { ChevronLeftIcon } from "@/components/icons"
import { useProgram } from "@/hooks/use-program"
import { HOME } from "@/routes"

/** Étape 1 — Bienvenue. Si l'onboarding est déjà fait, on va directement aux séances. */
export function WelcomePage() {
  const { program, exercise } = useProgram()

  if (program) return <Navigate to={exercise.routes.sessions} replace />

  return (
    <OnboardingLayout
      step={1}
      mainClassName="max-w-[560px] md:gap-10 md:pt-8"
      footer={
        <div className="flex gap-2.5 md:gap-2.5">
          <Button asChild variant="secondary" className="flex-none gap-1.5 pr-4 pl-3 md:pr-5 md:pl-4">
            <Link to={HOME}>
              <ChevronLeftIcon size={20} />
              Retour
            </Link>
          </Button>
          <Button asChild className="flex-auto">
            <Link to={exercise.routes.max}>Commencer</Link>
          </Button>
        </div>
      }
    >
      <OnboardingItem className="flex flex-col items-center gap-3.5 text-center md:gap-4">
        <HisseLogo
          animated
          label={exercise.copy.logoLabel}
          className="h-36 w-auto md:h-44"
        />
        <div className="flex flex-col items-center gap-2">
          <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">
            {exercise.name} avec Hisse
          </h1>
          <p className="m-0 text-[15px] leading-normal text-muted-foreground md:w-[544px] md:text-base">
            {exercise.copy.tagline}
          </p>
        </div>
      </OnboardingItem>

      <OnboardingItem>
        <FeatureList />
      </OnboardingItem>
    </OnboardingLayout>
  )
}
