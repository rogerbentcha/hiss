import { useCallback, useMemo, useSyncExternalStore } from "react"

import { startOfToday, toIso } from "@/lib/dates"
import { clampReps, createDemoProgram, SESSIONS_PER_CYCLE } from "@/lib/program"
import { programStore, workoutStore } from "@/lib/stores"
import type { Program } from "@/types/program"

export interface UseProgram {
  /** Programme enregistré, ou null si l'onboarding n'a pas été fait. */
  program: Program | null
  /** Programme à afficher : l'enregistré, sinon un exemple. */
  displayProgram: Program
  isDemo: boolean
  history: Program[]
  /** Démarre un nouveau cycle à partir d'un max testé (l'ancien est archivé). */
  startCycle: (max: number) => void
  /** Enregistre une séance terminée dans le cycle en cours. */
  completeSession: (reps: number[]) => void
}

export function useProgram(): UseProgram {
  const state = useSyncExternalStore(programStore.subscribe, programStore.get)
  const demo = useMemo(() => createDemoProgram(), [])

  const startCycle = useCallback((max: number) => {
    programStore.set((prev) => ({
      program: { max: clampReps(max), start: toIso(startOfToday()), done: [] },
      // Un cycle sans aucune séance (ex. retour arrière dans l'onboarding) n'est pas archivé.
      history: prev.program?.done.length ? [...prev.history, prev.program] : prev.history,
    }))
    workoutStore.set(null)
  }, [])

  const completeSession = useCallback((reps: number[]) => {
    programStore.set((prev) => {
      if (!prev.program || prev.program.done.length >= SESSIONS_PER_CYCLE) return prev
      return {
        ...prev,
        program: {
          ...prev.program,
          done: [...prev.program.done, { reps: reps.map(clampReps), date: toIso(new Date()) }],
        },
      }
    })
    workoutStore.set(null)
  }, [])

  return {
    program: state.program,
    displayProgram: state.program ?? demo,
    isDemo: state.program === null,
    history: state.history,
    startCycle,
    completeSession,
  }
}
