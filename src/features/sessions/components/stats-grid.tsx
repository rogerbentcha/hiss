import { ProgressRing } from "@/components/common/progress-ring"
import { StatCard } from "@/components/common/stat-card"
import { getCycleGoal, getLevel, SESSIONS_PER_CYCLE } from "@/lib/program"
import type { Program } from "@/types/program"

interface StatsGridProps {
  program: Program
}

/** Les 4 indicateurs du cycle : niveau, max, objectif et séances faites. */
export function StatsGrid({ program }: StatsGridProps) {
  const level = getLevel(program.max)
  const doneCount = Math.min(program.done.length, SESSIONS_PER_CYCLE)

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] md:gap-2.5">
      <StatCard label="Niveau" value={level.label} caption={`${level.range} tractions`} valueClassName="text-primary" />
      <StatCard label="Max actuel" value={program.max} caption="tractions d'affilée" />
      <StatCard label="Objectif" value={getCycleGoal(program.max)} caption="au prochain test" />
      <StatCard
        label="Séances"
        value={
          <>
            {doneCount}
            <span className="text-faint">/{SESSIONS_PER_CYCLE}</span>
          </>
        }
        aside={
          <ProgressRing
            value={doneCount / SESSIONS_PER_CYCLE}
            viewBox={64}
            radius={26}
            strokeWidth={8}
            className="size-11 md:size-16"
          />
        }
      />
    </div>
  )
}
