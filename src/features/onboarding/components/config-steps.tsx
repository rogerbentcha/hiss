import type { ReactNode } from "react"

import { CheckIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

export interface ConfigStep {
  /** Pourcentage à partir duquel l'étape est terminée. */
  at: number
  label: string
  detail: string
}

interface ConfigStepsProps {
  steps: ConfigStep[]
  progress: number
}

/** Liste des étapes de génération du programme, cochées au fil de la progression. */
export function ConfigSteps({ steps, progress }: ConfigStepsProps) {
  return (
    <CardList>
      {steps.map((step, i) => {
        const done = progress >= step.at
        const active = !done && (i === 0 || progress >= steps[i - 1].at)
        return (
          <li
            key={step.label}
            className={cn(
              "flex items-center gap-2.5 text-sm md:gap-3",
              i > 0 && "border-t border-surface-2 pt-3",
              done || active ? "text-foreground" : "text-faint",
            )}
          >
            <span
              className={cn(
                "flex size-6 flex-none items-center justify-center rounded-full md:size-[26px]",
                done ? "bg-primary" : "border-2",
                !done && (active ? "border-primary" : "border-surface-3"),
              )}
            >
              {done && <CheckIcon strokeWidth={3.2} className="size-[13px] text-primary-foreground md:size-3.5" />}
            </span>
            <span className="flex-auto">{step.label}</span>
            <span className="text-[13px] text-muted-foreground">{done ? step.detail : ""}</span>
          </li>
        )
      })}
    </CardList>
  )
}

/* Petite variante de carte rendue en <ul>. */
function CardList({ children }: { children: ReactNode }) {
  return (
    <ul className="surface-card m-0 flex w-full list-none flex-col gap-3 px-4 py-4 md:px-5 md:py-4">{children}</ul>
  )
}
