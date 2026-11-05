import { useMemo } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { GoalProgress } from "@/features/sessions/components/goal-progress"
import { ProgramHero } from "@/features/sessions/components/program-hero"
import { RepsChart } from "@/features/sessions/components/reps-chart"
import { RulesCard } from "@/features/sessions/components/rules-card"
import { SessionList } from "@/features/sessions/components/session-list"
import { StatsGrid } from "@/features/sessions/components/stats-grid"
import { TrackingCalendar } from "@/features/sessions/components/tracking-calendar"
import { buildSessionViews } from "@/features/sessions/session-view"
import { useProgram } from "@/hooks/use-program"
import { getAvailability } from "@/lib/program"

/** Tableau de bord « Mes séances ». */
export function SessionsPage() {
  const { displayProgram: program, isDemo } = useProgram()
  const availability = useMemo(() => getAvailability(program), [program])
  const sessions = useMemo(() => buildSessionViews(program, availability), [program, availability])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 pt-2 pb-8 md:gap-11 md:px-7 md:pt-3.5 md:pb-16">
        <ProgramHero availability={availability} isDemo={isDemo} />

        <section aria-labelledby="suivi-title" className="flex flex-col gap-4">
          <h2 id="suivi-title" className="m-0 font-display text-xl font-bold tracking-[-0.01em]">
            Suivis
          </h2>
          <StatsGrid program={program} />
          <div className="flex flex-wrap items-start gap-2.5">
            <RepsChart sessions={sessions} defaultIndex={availability.nextIndex} />
            <GoalProgress max={program.max} />
          </div>
        </section>

        <SessionList sessions={sessions} />

        <section className="flex flex-wrap items-start gap-2.5">
          <TrackingCalendar program={program} availability={availability} />
          <RulesCard />
        </section>
      </main>
    </div>
  )
}
