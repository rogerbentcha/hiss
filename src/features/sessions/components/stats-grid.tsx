import { ProgressRing } from "@/components/common/progress-ring"
import { StatCard } from "@/components/common/stat-card"
import { useExercise } from "@/hooks/use-exercise"
import { getCycleGoal, getLevel } from "@/lib/program"
import type { Program } from "@/types/program"

interface StatsGridProps {
  program: Program
  /** Nombre de séances du cycle. */
  sessionCount: number
}

/** Les 4 indicateurs du cycle : niveau, max, objectif et séances faites. */
export function StatsGrid({ program, sessionCount }: StatsGridProps) {
  const exercise = useExercise()
  const level = getLevel(exercise, program.max)
  const doneCount = Math.min(program.done.length, sessionCount)

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] md:gap-2.5">
      <StatCard label="Niveau" value={level.label} caption={`${level.range} ${exercise.plural}`} valueClassName="text-primary" />
      <StatCard label="Max actuel" value={program.max} caption={`${exercise.plural} d'affilée`} />
      <StatCard label="Objectif" value={getCycleGoal(exercise, program.max)} caption="au prochain test" />
      <StatCard
        label="Séances"
        value={
          <>
            {doneCount}
            <span className="text-faint">/{sessionCount}</span>
          </>
        }
        aside={
          <ProgressRing
            value={doneCount / sessionCount}
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
