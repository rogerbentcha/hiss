import type { ReactNode } from "react"

import { ArrowUpIcon, CalendarIcon, CheckIcon, StopwatchIcon } from "@/components/icons"
import { Card, CardTitle } from "@/components/ui/card"
import { useExercise } from "@/hooks/use-exercise"
import type { Exercise } from "@/lib/exercises"
import { describeRecovery, describeRest, restVaries } from "@/lib/program"
import type { SessionPlan } from "@/types/program"

interface Rule {
  icon: ReactNode
  title: string
  description: string
}

const rules = (exercise: Exercise, plan: SessionPlan[]): Rule[] => [
  {
    icon: <StopwatchIcon size={22} withButton={false} />,
    title: `${describeRest(plan)} de repos`,
    description: `Minimum entre deux séries${restVaries(plan) ? ", selon la séance" : ""}. Prends plus si tu en as besoin.`,
  },
  {
    icon: <CalendarIcon size={22} />,
    title: "Des jours de récupération",
    description: describeRecovery(plan),
  },
  {
    icon: <ArrowUpIcon size={22} />,
    title: "Dernière série au max",
    description: "Le chiffre « + » est un minimum : va le plus loin possible.",
  },
  {
    icon: <CheckIcon size={22} />,
    title: "Seules les reps propres comptent",
    description: exercise.copy.form,
  },
]

/** Carte « Les règles » du programme. */
export function RulesCard({ plan }: { plan: SessionPlan[] }) {
  const exercise = useExercise()

  return (
    <Card aria-labelledby="regles-title" className="flex min-w-0 flex-[1_1_370px] flex-col gap-5 p-4 md:p-5">
      <CardTitle id="regles-title" className="text-lg font-bold tracking-[-0.01em]">
        Les règles
      </CardTitle>
      <div className="flex flex-col gap-5">
        {rules(exercise, plan).map((rule) => (
          <div key={rule.title} className="flex items-start gap-3">
            <span className="flex size-10 flex-none items-center justify-center rounded-full bg-surface-2 text-primary">
              {rule.icon}
            </span>
            <div className="flex flex-col gap-[3px]">
              <h3 className="m-0 font-display text-[15px] font-semibold">{rule.title}</h3>
              <p className="m-0 text-[13px] leading-[1.45] text-muted-foreground">{rule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
