import { SetDot } from "@/components/common/set-dot"
import { useExercise } from "@/hooks/use-exercise"
import { formatRest, formatTarget, isLastSet } from "@/lib/program"
import { cn } from "@/lib/utils"

interface SetPlanListProps {
  plan: number[]
  /** Repos entre séries, en secondes. */
  rest: number
  /** Répétitions réalisées si la séance est faite. */
  reps: number[] | null
}

/** Section « Au programme » : les séries cibles et, si faite, le résultat de chacune. */
export function SetPlanList({ plan, rest, reps }: SetPlanListProps) {
  const { plural } = useExercise()
  return (
    <section aria-labelledby="prog-title" className="surface-card px-4 py-2 md:px-5">
      <h2 id="prog-title" className="mt-3.5 mb-1 font-display text-lg font-bold">
        Au programme
      </h2>
      <ol className="m-0 list-none p-0">
        {plan.map((target, j) => {
          const last = isLastSet(j, plan.length)
          return (
            <li key={j} className={cn("flex items-center gap-3.5 py-3.5", j > 0 && "border-t border-surface-2")}>
              <SetDot state={reps ? "done" : last ? "active" : "pending"} className="size-9 text-[13px]">
                {j + 1}
              </SetDot>
              <div className="flex flex-auto flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{formatTarget(target, j, plan.length)} {plural}</span>
                <span className="text-[13px] text-muted-foreground">
                  {last ? "Dernière série : au maximum" : `Puis ${formatRest(rest)} de repos`}
                </span>
              </div>
              {reps && (
                <span className="text-[13px] font-medium text-primary tabular-nums">{reps[j] ?? 0} faites</span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

