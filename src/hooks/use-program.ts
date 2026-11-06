import { useCallback, useMemo, useSyncExternalStore } from "react"

import { useExercise } from "@/hooks/use-exercise"
import { startOfToday, toIso } from "@/lib/dates"
import type { Exercise } from "@/lib/exercises"
import { clampReps } from "@/lib/program"
import { getStores } from "@/lib/stores"
import type { Program, SessionPlan } from "@/types/program"

export interface UseProgram {
  exercise: Exercise
  /** Programme enregistré, ou null si l'onboarding n'a pas été fait. */
  program: Program | null
  /** Programme à afficher : l'enregistré, sinon un exemple. */
  displayProgram: Program
  /** Séances du programme affiché. */
  plan: SessionPlan[]
  isDemo: boolean
  history: Program[]
  /** Démarre un nouveau cycle à partir d'un max testé (l'ancien est archivé). */
  startCycle: (max: number) => void
  /** Enregistre une séance terminée dans le cycle en cours. */
  completeSession: (reps: number[]) => void
}

/** Programme de l'exercice en cours (tractions ou pompes). */
export function useProgram(): UseProgram {
  const exercise = useExercise()
  const stores = getStores(exercise.id)
  const state = useSyncExternalStore(stores.program.subscribe, stores.program.get)
  const demo = useMemo(() => exercise.createDemo(), [exercise])
  const displayProgram = state.program ?? demo
  const plan = useMemo(() => exercise.buildPlan(displayProgram.max), [exercise, displayProgram.max])

  const startCycle = useCallback(
    (max: number) => {
      stores.program.set((prev) => ({
        program: { max: clampReps(max, exercise.maxReps), start: toIso(startOfToday()), done: [] },
        // Un cycle sans aucune séance (ex. retour arrière dans l'onboarding) n'est pas archivé.
        history: prev.program?.done.length ? [...prev.history, prev.program] : prev.history,
      }))
      stores.workout.set(null)
    },
    [exercise, stores],
  )

  const completeSession = useCallback(
    (reps: number[]) => {
      stores.program.set((prev) => {
        if (!prev.program || prev.program.done.length >= exercise.buildPlan(prev.program.max).length) return prev
        return {
          ...prev,
          program: {
            ...prev.program,
            done: [
              ...prev.program.done,
              { reps: reps.map((r) => clampReps(r, exercise.maxReps)), date: toIso(new Date()) },
            ],
          },
        }
      })
      stores.workout.set(null)
    },
    [exercise, stores],
  )

  return {
    exercise,
    program: state.program,
    displayProgram,
    plan,
    isDemo: state.program === null,
    history: state.history,
    startCycle,
    completeSession,
  }
}
