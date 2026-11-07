import { Card, CardTitle } from "@/components/ui/card"
import { useExercise } from "@/hooks/use-exercise"
import { getCycleGoal } from "@/lib/program"
import { cn } from "@/lib/utils"

interface GoalProgressProps {
  max: number
}

function LegendRow({ swatch, label, value }: { swatch: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("w-3 flex-none", swatch)} />
      <span className="flex-auto text-[13px] text-subtle">{label}</span>
      <span className="text-[13px] font-semibold tabular-nums">{value}</span>
    </div>
  )
}

/** Carte « Vers 50 tractions » (ou 100 pompes) : max actuel, objectif du cycle et reste à faire. */
export function GoalProgress({ max }: GoalProgressProps) {
  const exercise = useExercise()
  const target = exercise.goal
  const goal = getCycleGoal(exercise, max)
  const pct = (v: number) => `${Math.min(100, (v / target) * 100)}%`

  return (
    <Card className="flex min-w-0 flex-[1_1_370px] flex-col gap-4 p-4 md:p-5">
      <CardTitle>
        Vers {target} {exercise.plural}
      </CardTitle>
      <div className="flex flex-col gap-2.5">
        <div className="relative h-3 rounded-md bg-surface-2">
          <div className="absolute inset-y-0 left-0 rounded-md bg-primary" style={{ width: pct(max) }} />
          <div
            aria-hidden="true"
            className="absolute -top-1.5 -bottom-1.5 -ml-px w-[3px] rounded-[2px] bg-foreground"
            style={{ left: pct(goal) }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>0</span>
          <span>{target / 2}</span>
          <span>{target}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <LegendRow swatch="h-3 rounded-full bg-primary" label="Max actuel" value={max} />
        <LegendRow swatch="h-[3px] rounded-[2px] bg-foreground" label="Objectif du cycle" value={goal} />
        <LegendRow swatch="h-3 rounded-full bg-surface-2" label={`Reste jusqu'à ${target}`} value={Math.max(0, target - max)} />
      </div>
    </Card>
  )
}
