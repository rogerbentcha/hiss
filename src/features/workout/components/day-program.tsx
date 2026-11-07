import { SetDot } from "@/components/common/set-dot"
import { useExercise } from "@/hooks/use-exercise"
import { formatTarget } from "@/lib/program"
import { cn } from "@/lib/utils"

interface DayProgramProps {
  plan: number[]
  reps: (number | null)[]
  current: number
}

/** « Programme du jour » : les séries avec leur état (faite, en cours, à venir). */
export function DayProgram({ plan, reps, current }: DayProgramProps) {
  const { plural } = useExercise()
  return (
    <section
      aria-labelledby="prog-title"
      className="surface-card flex min-w-0 flex-[1_1_430px] flex-col gap-2 p-4 md:p-5"
    >
      <h2 id="prog-title" className="m-0 mb-1.5 font-display text-lg font-semibold md:mb-2">
        Programme du jour
      </h2>
      <ol className="m-0 flex list-none flex-col gap-1 p-0 md:gap-1.5">
        {plan.map((target, i) => {
          const done = reps[i] !== null
          const isCurrent = i === current
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2.5 rounded-[14px] px-2.5 py-2.5 md:gap-3 md:px-3 md:py-2.5",
                isCurrent && "bg-surface-2",
              )}
            >
              <SetDot state={done ? "done" : isCurrent ? "active" : "pending"} className="size-[30px] text-xs md:size-8 md:text-[13px]">
                {i + 1}
              </SetDot>
              <span className={cn("flex-auto text-sm", done ? "text-muted-foreground" : "text-foreground")}>
                {formatTarget(target, i, plan.length)} {plural}
              </span>
              <span className={cn("text-[13px] font-medium", done ? "text-primary" : "text-foreground")}>
                {done ? `${reps[i]} faites` : isCurrent ? "En cours" : ""}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
