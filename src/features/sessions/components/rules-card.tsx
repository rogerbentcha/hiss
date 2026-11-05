import type { ReactNode } from "react"

import { ArrowUpIcon, CalendarIcon, CheckIcon, StopwatchIcon } from "@/components/icons"
import { Card, CardTitle } from "@/components/ui/card"

interface Rule {
  icon: ReactNode
  title: string
  description: string
}

const RULES: Rule[] = [
  {
    icon: <StopwatchIcon size={22} withButton={false} />,
    title: "2 minutes de repos",
    description: "Minimum entre deux séries. Prends plus si tu en as besoin.",
  },
  {
    icon: <CalendarIcon size={22} />,
    title: "Des jours de récupération",
    description: "1 jour après les séances 1, 2, 4 et 5. 2 jours après les séances 3 et 6.",
  },
  {
    icon: <ArrowUpIcon size={22} />,
    title: "Dernière série au max",
    description: "Le chiffre « + » est un minimum : va le plus loin possible.",
  },
  {
    icon: <CheckIcon size={22} />,
    title: "Seules les reps propres comptent",
    description: "Bras tendus en bas, menton au-dessus de la barre, sans élan.",
  },
]

/** Carte « Les règles » du programme. */
export function RulesCard() {
  return (
    <Card aria-labelledby="regles-title" className="flex min-w-0 flex-[1_1_370px] flex-col gap-5 p-4 md:p-5">
      <CardTitle id="regles-title" className="text-lg font-bold tracking-[-0.01em]">
        Les règles
      </CardTitle>
      <div className="flex flex-col gap-5">
        {RULES.map((rule) => (
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
