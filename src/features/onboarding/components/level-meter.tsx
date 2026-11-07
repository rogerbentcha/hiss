import { useExercise } from "@/hooks/use-exercise"
import { getLevel } from "@/lib/program"
import { cn } from "@/lib/utils"

interface LevelMeterProps {
  max: number
}

/** Niveau calculé à partir du max, jauge à 12 segments et distance jusqu'à l'objectif final. */
export function LevelMeter({ max }: LevelMeterProps) {
  const exercise = useExercise()
  const { goal } = exercise
  const level = getLevel(exercise, max)
  const goalText =
    max >= goal ? `Objectif ${goal} atteint. Bravo.` : `Encore ${goal - max} ${exercise.plural} avant l'objectif ${goal}.`

  return (
    <div className="flex flex-col gap-2.5 border-t border-surface-2 pt-4 md:pt-4">
      <div className="flex items-baseline justify-between gap-2.5">
        <span className="text-[15px] font-semibold tabular-nums">Niveau {level.label}</span>
        <span className="text-[13px] text-muted-foreground tabular-nums">{level.range} {exercise.plural}</span>
      </div>
      <div aria-hidden="true" className="flex gap-1">
        {exercise.levels.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-[3px] transition-colors",
              i <= level.index ? "bg-primary" : "bg-surface-3",
            )}
          />
        ))}
      </div>
      <p aria-live="polite" className="m-0 text-[13px] text-muted-foreground tabular-nums">
        {goalText}
      </p>
    </div>
  )
}
