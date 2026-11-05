import { Link, Navigate } from "react-router"

import { HisseLogo } from "@/components/common/hisse-logo"
import { OnboardingItem, OnboardingLayout } from "@/components/layout/onboarding-layout"
import { Button } from "@/components/ui/button"
import { FeatureList } from "@/features/onboarding/components/feature-list"
import { useProgram } from "@/hooks/use-program"
import { ROUTES } from "@/routes"

/** Étape 1 — Bienvenue. Si l'onboarding est déjà fait, on va directement aux séances. */
export function WelcomePage() {
  const { program } = useProgram()

  if (program) return <Navigate to={ROUTES.sessions} replace />

  return (
    <OnboardingLayout
      step={1}
      mainClassName="max-w-[560px] md:gap-10 md:pt-8"
      footer={
        <Button asChild className="w-full">
          <Link to={ROUTES.max}>Commencer</Link>
        </Button>
      }
    >
      <OnboardingItem className="flex flex-col items-center gap-3.5 text-center md:gap-4">
        <HisseLogo
          animated
          label="Logo Hisse : un bonhomme saute, attrape la barre et enchaîne trois tractions"
          className="h-36 w-auto md:h-44"
        />
        <div className="flex flex-col items-center gap-2">
          <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">
            Bienvenue sur Hisse
          </h1>
          <p className="m-0 text-[15px] leading-normal text-muted-foreground md:w-[544px] md:text-base">
            Ton programme de tractions, de ta première répétition jusqu'à 50.
          </p>
        </div>
      </OnboardingItem>

      <OnboardingItem>
        <FeatureList />
      </OnboardingItem>
    </OnboardingLayout>
  )
}
