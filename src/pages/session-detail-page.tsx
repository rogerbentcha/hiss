import { useMemo } from "react"
import { Navigate, useParams } from "react-router"

import { StatCard } from "@/components/common/stat-card"
import { BackLink } from "@/components/layout/back-link"
import { SessionCta } from "@/features/session-detail/components/session-cta"
import { SessionPager } from "@/features/session-detail/components/session-pager"
import { SetPlanList } from "@/features/session-detail/components/set-plan-list"
import { StatusBadge } from "@/features/session-detail/components/status-badge"
import { useProgram } from "@/hooks/use-program"
import { formatLong, parseIso } from "@/lib/dates"
import {
  buildPlan,
  formatRestDays,
  getAvailability,
  getSessionStatus,
  REST_DAYS,
  SESSIONS_PER_CYCLE,
  sum,
} from "@/lib/program"
import { ROUTES } from "@/routes"

/** Détail d'une séance (1 à 6). */
export function SessionDetailPage() {
  const { numero } = useParams()
  const { displayProgram: program, isDemo } = useProgram()
  const availability = useMemo(() => getAvailability(program), [program])

  const number = Number(numero)
  if (!Number.isInteger(number) || number < 1 || number > SESSIONS_PER_CYCLE) {
    return <Navigate to={ROUTES.sessions} replace />
  }

  const index = number - 1
  const plan = buildPlan(program.max)[index]
  const done = program.done[index]
  const reps = done?.reps ?? null
  const status = getSessionStatus(program, index, availability)

  const sub =
    status === "done"
      ? `Faite le ${formatLong(parseIso(done.date))}.`
      : status === "locked"
        ? `Se débloque après la séance ${index}.`
        : `Prochaine séance, ${availability.longText}.`

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex max-w-[880px] items-center justify-between gap-3.5 px-4 py-3.5 md:px-7 md:py-5">
        <BackLink to={ROUTES.sessions} label="Mes séances" />
        <SessionPager number={number} />
      </header>

      <main className="mx-auto flex max-w-[880px] flex-col gap-6 px-4 pt-2 pb-8 md:px-7 md:pb-12">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">
              Séance {number}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="m-0 text-[15px] text-muted-foreground md:text-base">{sub}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:gap-2.5">
          <StatCard
            size="md"
            label={reps ? "Réalisé" : "Total minimum"}
            value={reps ? `${sum(reps)} / ${sum(plan)}` : `${sum(plan)} tractions`}
          />
          <StatCard size="md" label="Repos entre séries" value="2 min" />
          <StatCard size="md" label="Durée estimée" value="≈ 11 min" />
          <StatCard size="md" label="Repos après" value={formatRestDays(REST_DAYS[index])} />
        </div>

        <SetPlanList plan={plan} reps={reps} />

        <SessionCta status={status} number={number} availability={availability} isDemo={isDemo} />
      </main>
    </div>
  )
}
