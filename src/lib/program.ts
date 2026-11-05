import { addDays, formatLong, formatShort, isSameDay, parseIso, startOfToday, toIso } from "@/lib/dates"
import type { Level, Program, SessionStatus } from "@/types/program"

/* ------------------------------------------------------------------ */
/* Constantes du programme                                            */
/* ------------------------------------------------------------------ */

export const GOAL = 50
export const SESSIONS_PER_CYCLE = 6
export const SETS_PER_SESSION = 5
export const REST_BETWEEN_SETS = 120 // secondes
export const MAX_REPS = 99
export const DEFAULT_MAX = 8

/** Jours de repos après chaque séance (1, 2, 4, 5 → 1 jour ; 3, 6 → 2 jours). */
export const REST_DAYS = [1, 1, 2, 1, 1, 2] as const

/** Fourchettes de max pour chacun des 12 niveaux. */
export const LEVEL_RANGES: readonly (readonly [number, number])[] = [
  [0, 3],
  [4, 5],
  [6, 8],
  [9, 11],
  [12, 15],
  [16, 20],
  [21, 25],
  [26, 30],
  [31, 35],
  [36, 40],
  [41, 45],
  [46, 50],
]

/* ------------------------------------------------------------------ */
/* Niveaux & plan                                                     */
/* ------------------------------------------------------------------ */

export function clampReps(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(MAX_REPS, Math.round(value)))
}

export function getLevel(max: number): Level {
  let index = LEVEL_RANGES.findIndex(([min, top]) => max >= min && max <= top)
  if (index < 0) index = LEVEL_RANGES.length - 1
  const [min, top] = LEVEL_RANGES[index]
  const isLast = index === LEVEL_RANGES.length - 1
  return {
    index,
    min,
    max: top,
    label: String(index + 1).padStart(2, "0"),
    range: isLast ? "46 et +" : `${min}–${top}`,
  }
}

/** Objectif de max à atteindre au prochain test. */
export function getCycleGoal(max: number): number {
  const level = getLevel(max)
  return level.index === LEVEL_RANGES.length - 1 ? GOAL : level.max + 1
}

/** Séries cibles des 6 séances d'un cycle, calculées à partir du max. */
export function buildPlan(max: number): number[][] {
  const pct = (p: number) => Math.max(1, Math.round(max * p))
  return Array.from({ length: SESSIONS_PER_CYCLE }, (_, k) => {
    const core = pct(0.45 + 0.04 * k)
    return [pct(0.45 + 0.05 * k), pct(0.6 + 0.05 * k), core, core, pct(0.6 + 0.04 * k)]
  })
}

export const sum = (values: (number | null)[]) => values.reduce<number>((acc, v) => acc + (v ?? 0), 0)

export const isLastSet = (setIndex: number) => setIndex === SETS_PER_SESSION - 1

/** La dernière série s'affiche avec un « + » : c'est un minimum. */
export function formatTarget(target: number, setIndex: number): string {
  return isLastSet(setIndex) ? `${target}+` : String(target)
}

export function formatRestDays(days: number): string {
  return `${days} ${days > 1 ? "jours" : "jour"}`
}

/* ------------------------------------------------------------------ */
/* Disponibilité des séances                                          */
/* ------------------------------------------------------------------ */

export interface Availability {
  /** Index de la prochaine séance à faire (6 = cycle terminé, place au test). */
  nextIndex: number
  /** Date à partir de laquelle la prochaine séance est possible. */
  availableFrom: Date
  /** Vrai si le repos n'est pas encore terminé. */
  resting: boolean
  /** « disponible aujourd'hui », « disponible demain », « disponible le lun. 3 nov. » */
  text: string
  /** Même texte mais avec la date en toutes lettres. */
  longText: string
}

/**
 * Pas de dates fixes : une séance reçoit sa date quand elle est faite.
 * La suivante devient disponible une fois le repos après la précédente terminé.
 */
export function getAvailability(program: Program, today: Date = startOfToday()): Availability {
  const done = program.done.slice(0, SESSIONS_PER_CYCLE)
  let availableFrom = new Date(today)
  if (done.length) {
    const last = done[done.length - 1]
    availableFrom = addDays(parseIso(last.date), REST_DAYS[done.length - 1] + 1)
  }
  const resting = availableFrom > today
  const tomorrow = addDays(today, 1)
  const label = (format: (d: Date) => string) =>
    !resting
      ? "disponible aujourd'hui"
      : isSameDay(availableFrom, tomorrow)
        ? "disponible demain"
        : `disponible le ${format(availableFrom)}`

  return {
    nextIndex: done.length,
    availableFrom,
    resting,
    text: label(formatShort),
    longText: label(formatLong),
  }
}

export function getSessionStatus(program: Program, index: number, availability = getAvailability(program)): SessionStatus {
  if (index < program.done.length) return "done"
  if (index === availability.nextIndex) return availability.resting ? "resting" : "available"
  return "locked"
}

export const STATUS_LABELS: Record<SessionStatus, string> = {
  done: "Faite",
  available: "Disponible",
  resting: "En repos",
  locked: "À venir",
}

/* ------------------------------------------------------------------ */
/* Programme d'exemple                                                */
/* ------------------------------------------------------------------ */

/** Programme de démonstration affiché tant que l'onboarding n'a pas été fait. */
export function createDemoProgram(today: Date = startOfToday()): Program {
  const first = toIso(addDays(today, -4))
  const second = toIso(addDays(today, -2))
  return {
    max: 13,
    start: first,
    done: [
      { reps: [6, 8, 6, 6, 10], date: first },
      { reps: [7, 8, 6, 6, 9], date: second },
    ],
  }
}
