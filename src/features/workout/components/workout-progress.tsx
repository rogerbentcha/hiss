import { cn } from "@/lib/utils"

interface WorkoutProgressProps {
  sessionNumber: number
  doneSets: number
  totalReps: number
  reps: (number | null)[]
  current: number
}

/** Titre de la séance, compteur de séries et barre segmentée de progression. */
export function WorkoutProgress({ sessionNumber, doneSets, totalReps, reps, current }: WorkoutProgressProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-3.5">
      <div className="flex items-end justify-between gap-2.5 md:flex-wrap">
        <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">
          Séance {sessionNumber}
        </h1>
        <span className="text-[13px] text-subtle tabular-nums">
          {doneSets} / {reps.length} séries&nbsp; {totalReps} tractions
        </span>
      </div>
      <div aria-hidden="true" className="flex gap-1.5">
        {reps.map((r, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-[3px] transition-colors",
              r !== null ? "bg-primary" : i === current ? "bg-planned" : "bg-surface-2",
            )}
          />
        ))}
      </div>
    </div>
  )
}
