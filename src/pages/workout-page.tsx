import { Navigate, useNavigate } from "react-router"

import { CheckIcon } from "@/components/icons"
import { BackLink } from "@/components/layout/back-link"
import { Button } from "@/components/ui/button"
import { CurrentSetCard } from "@/features/workout/components/current-set-card"
import { DayProgram } from "@/features/workout/components/day-program"
import { RestTimer } from "@/features/workout/components/rest-timer"
import { WorkoutProgress } from "@/features/workout/components/workout-progress"
import { useProgram } from "@/hooks/use-program"
import { useWorkout } from "@/hooks/use-workout"
import { SESSIONS_PER_CYCLE, sum } from "@/lib/program"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/routes"
import type { Program } from "@/types/program"

/** Séance du jour : garde-fous avant d'afficher la séance guidée. */
export function WorkoutPage() {
  const { program } = useProgram()

  if (!program) return <Navigate to={ROUTES.welcome} replace />
  // Les 6 séances sont faites : place au nouveau test.
  if (program.done.length >= SESSIONS_PER_CYCLE) return <Navigate to={ROUTES.max} replace />

  return <WorkoutSession program={program} />
}

function WorkoutSession({ program }: { program: Program }) {
  const navigate = useNavigate()
  const { completeSession } = useProgram()
  const workout = useWorkout(program)
  const totalReps = sum(workout.reps)

  const restLabel =
    workout.timer.left > 0 ? "Repos" : workout.current > 0 && !workout.allDone ? "Prêt pour la série" : "Minuteur"

  const finish = () => {
    // Une séance sans aucune série validée n'est pas enregistrée.
    if (workout.doneSets > 0) completeSession(workout.reps.map((r) => r ?? 0))
    navigate(ROUTES.sessions)
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex max-w-[1120px] items-center justify-between gap-2.5 px-4 py-3.5 md:gap-3.5 md:px-7 md:py-5">
        <BackLink to={ROUTES.sessions} label="Mes séances" />
      </header>

      <main className="mx-auto flex max-w-[1120px] flex-col gap-5 px-4 pt-2 pb-8 md:gap-6 md:px-7 md:pb-12">
        <WorkoutProgress
          sessionNumber={workout.sessionIndex + 1}
          doneSets={workout.doneSets}
          totalReps={totalReps}
          reps={workout.reps}
          current={workout.current}
        />

        <RestTimer
          left={workout.timer.left}
          running={workout.timer.running}
          label={restLabel}
          onTogglePause={workout.togglePause}
          onSkip={workout.skipRest}
          onMinus15={workout.minus15}
          onPlus30={workout.plus30}
        />

        <div className="flex flex-wrap items-start gap-5 md:gap-3.5">
          <CurrentSetCard
            current={workout.current}
            target={workout.plan[Math.min(workout.current, workout.plan.length - 1)]}
            value={workout.value}
            resting={workout.timer.resting}
            allDone={workout.allDone}
            totalReps={totalReps}
            onChange={workout.setValue}
            onValidate={workout.validateSet}
          />
          <DayProgram plan={workout.plan} reps={workout.reps} current={workout.current} />
        </div>

        <Button
          size="lg"
          variant={workout.allDone ? "default" : "secondary"}
          className={cn("h-11 font-semibold md:h-12")}
          onClick={finish}
        >
          <CheckIcon size={20} strokeWidth={2.2} />
          Terminer la séance
        </Button>
      </main>
    </div>
  )
}
