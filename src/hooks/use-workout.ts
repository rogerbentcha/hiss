import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"

import { buildPlan, clampReps, REST_BETWEEN_SETS, SESSIONS_PER_CYCLE, SETS_PER_SESSION } from "@/lib/program"
import { workoutStore } from "@/lib/stores"
import type { Program, RestTimerState, WorkoutProgress } from "@/types/program"

const IDLE_TIMER: RestTimerState = { left: 0, endsAt: null }

function remainingSeconds(timer: RestTimerState, now: number): number {
  if (timer.endsAt === null) return timer.left
  // `left` mémorise la durée au (re)démarrage : borne haute tant que `now` n'est pas rafraîchi.
  return Math.max(0, Math.min(timer.left, Math.ceil((timer.endsAt - now) / 1000)))
}

function freshProgress(program: Program, sessionIndex: number, plan: number[]): WorkoutProgress {
  return {
    sessionIndex,
    programStart: program.start,
    current: 0,
    reps: Array.from({ length: SETS_PER_SESSION }, () => null),
    value: plan[0],
    timer: IDLE_TIMER,
  }
}

/**
 * État de la séance du jour : séries validées, compteur de répétitions et
 * minuteur de repos. Tout est persisté dans le localStorage.
 */
export function useWorkout(program: Program) {
  const sessionIndex = Math.min(program.done.length, SESSIONS_PER_CYCLE - 1)
  const plan = useMemo(() => buildPlan(program.max)[sessionIndex], [program.max, sessionIndex])

  const stored = useSyncExternalStore(workoutStore.subscribe, workoutStore.get)
  const progress = useMemo(
    () =>
      stored && stored.sessionIndex === sessionIndex && stored.programStart === program.start
        ? stored
        : freshProgress(program, sessionIndex, plan),
    [stored, sessionIndex, program, plan],
  )

  const update = useCallback(
    (patch: (p: WorkoutProgress) => Partial<WorkoutProgress>) => {
      const base = workoutStore.get()
      const current =
        base && base.sessionIndex === sessionIndex && base.programStart === program.start
          ? base
          : freshProgress(program, sessionIndex, plan)
      workoutStore.set({ ...current, ...patch(current) })
    },
    [program, sessionIndex, plan],
  )

  /* --- Minuteur ---------------------------------------------------- */

  const [now, setNow] = useState(() => Date.now())
  const running = progress.timer.endsAt !== null
  const left = remainingSeconds(progress.timer, now)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [running])

  // Fin du repos : on arrête le minuteur et on fait vibrer l'appareil si possible.
  useEffect(() => {
    if (running && left === 0) {
      update(() => ({ timer: IDLE_TIMER }))
      navigator.vibrate?.([200, 100, 200])
    }
  }, [running, left, update])

  const startTimer = (seconds: number): RestTimerState => ({ left: seconds, endsAt: Date.now() + seconds * 1000 })

  const togglePause = () =>
    update((p) => {
      const t = Date.now()
      const rem = remainingSeconds(p.timer, t)
      if (rem <= 0) return { timer: startTimer(REST_BETWEEN_SETS) }
      return { timer: p.timer.endsAt !== null ? { left: rem, endsAt: null } : { left: rem, endsAt: t + rem * 1000 } }
    })

  const skipRest = () => update(() => ({ timer: IDLE_TIMER }))

  const adjustRest = (delta: number, forceRun = false) =>
    update((p) => {
      const t = Date.now()
      const rem = Math.max(0, remainingSeconds(p.timer, t) + delta)
      if (rem === 0) return { timer: IDLE_TIMER }
      return { timer: p.timer.endsAt !== null || forceRun ? { left: rem, endsAt: t + rem * 1000 } : { left: rem, endsAt: null } }
    })

  /* --- Séries ------------------------------------------------------ */

  const allDone = progress.current >= SETS_PER_SESSION
  const resting = left > 0

  const setValue = (value: number) => update(() => ({ value: clampReps(value) }))

  const validateSet = () => {
    if (allDone || resting) return
    update((p) => {
      const reps = [...p.reps]
      reps[p.current] = p.value
      const next = p.current + 1
      if (next >= SETS_PER_SESSION) return { reps, current: next }
      return { reps, current: next, value: plan[next], timer: startTimer(REST_BETWEEN_SETS) }
    })
  }

  const reset = () => workoutStore.set(null)

  const doneSets = progress.reps.filter((r) => r !== null).length

  return {
    sessionIndex,
    plan,
    current: progress.current,
    reps: progress.reps,
    value: progress.value,
    doneSets,
    allDone,
    timer: { left, running: running && left > 0, resting },
    setValue,
    validateSet,
    togglePause,
    skipRest,
    minus15: () => adjustRest(-15),
    plus30: () => adjustRest(30, true),
    reset,
  }
}

export type Workout = ReturnType<typeof useWorkout>
