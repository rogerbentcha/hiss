import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"

import { ChevronLeftIcon } from "@/components/icons"
import { OnboardingItem, OnboardingLayout } from "@/components/layout/onboarding-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LevelMeter } from "@/features/onboarding/components/level-meter"
import { MaxStepper } from "@/features/onboarding/components/max-stepper"
import { useProgram } from "@/hooks/use-program"
import { DEFAULT_MAX } from "@/lib/program"
import { ROUTES } from "@/routes"

/** Étape 2 — Saisie du max (aussi utilisée pour « Refaire le test »). */
export function MaxPage() {
  const { program, startCycle } = useProgram()
  const navigate = useNavigate()
  const [max, setMax] = useState(program?.max ?? DEFAULT_MAX)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    startCycle(max)
    navigate(ROUTES.config)
  }

  return (
    <OnboardingLayout
      step={2}
      mainClassName="max-w-[560px] md:gap-7 md:pt-5"
      footer={
        <div className="flex gap-2.5 md:gap-2.5">
          <Button asChild variant="secondary" className="flex-none gap-1.5 pr-4 pl-3 md:pr-5 md:pl-4">
            <Link to={ROUTES.welcome}>
              <ChevronLeftIcon size={20} />
              Retour
            </Link>
          </Button>
          <Button type="submit" form="max-form" className="flex-auto">
            Continuer
          </Button>
        </div>
      }
    >
      <OnboardingItem className="flex flex-col gap-2.5 text-center md:gap-2.5">
        <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">
          Combien de tractions fais-tu&nbsp;?
        </h1>
        <p className="m-0 text-[15px] leading-normal text-muted-foreground md:text-base">
          D'affilée, sans lâcher la barre : bras tendus en bas, menton au-dessus de la barre.
        </p>
      </OnboardingItem>

      <OnboardingItem>
        <form id="max-form" onSubmit={submit} className="m-0">
          <Card className="flex flex-col gap-4 p-4 md:gap-5 md:p-6">
            <MaxStepper value={max} onChange={setMax} />
            <LevelMeter max={max} />
          </Card>
        </form>
      </OnboardingItem>
    </OnboardingLayout>
  )
}
