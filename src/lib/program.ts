import { addDays, formatLong, formatShort, isSameDay, parseIso, startOfToday } from "@/lib/dates"
import type { Exercise } from "@/lib/exercises"
import type { Level, Program, SessionPlan, SessionStatus } from "@/types/program"

/* ------------------------------------------------------------------ */
/* Niveaux & plan                                                     */
/* ------------------------------------------------------------------ */

export function clampReps(value: number, maxReps: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(maxReps, Math.round(value)))
}

export function getLevel(exercise: Exercise, max: number): Level {
  const { levels } = exercise
  let index = levels.findIndex(([min, top]) => max >= min && max <= top)
  if (index < 0) index = levels.length - 1
  const [min, top] = levels[index]
  const isLast = index === levels.length - 1
  return {
    index,
    min,
    max: top,
    label: String(index + 1).padStart(2, "0"),
    range: isLast ? `${min} et +` : `${min}–${top}`,
  }
}

/** Objectif de max à atteindre au prochain test : le niveau suivant, puis l'objectif final. */
export function getCycleGoal(exercise: Exercise, max: number): number {
  const level = getLevel(exercise, max)
  return level.index === exercise.levels.length - 1 ? exercise.goal : level.max + 1
}

export const sum = (values: (number | null)[]) => values.reduce<number>((acc, v) => acc + (v ?? 0), 0)

export const isLastSet = (setIndex: number, setCount: number) => setIndex === setCount - 1

/** La dernière série s'affiche avec un « + » : c'est un minimum. */
export function formatTarget(target: number, setIndex: number, setCount: number): string {
  return isLastSet(setIndex, setCount) ? `${target}+` : String(target)
}

export function formatRestDays(days: number): string {
  return `${days} ${days > 1 ? "jours" : "jour"}`
}

/** 120 → « 2 min », 90 → « 1 min 30 », 45 → « 45 s ». */
export function formatRest(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (!m) return `${s} s`
  return s ? `${m} min ${String(s).padStart(2, "0")}` : `${m} min`
}

/** Valeur unique, ou fourchette « a à b » si elle varie. */
function spread(values: number[], format: (v: number) => string): string {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? format(min) : `${format(min)} à ${format(max)}`
}

/** « 2 min » ou « 1 min à 2 min » selon que le repos varie d'une séance à l'autre. */
export const describeRest = (plan: SessionPlan[]) => spread(plan.map((s) => s.rest), formatRest)

/** « 5 » ou « 5 à 9 » séries par séance. */
export const describeSetCount = (plan: SessionPlan[]) => spread(plan.map((s) => s.sets.length), String)

export const restVaries = (plan: SessionPlan[]) => new Set(plan.map((s) => s.rest)).size > 1

/** « 1, 2, 4 et 5 » */
function joinFr(items: (string | number)[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`
}

/** « 1 jour après les séances 1, 2, 4 et 5. 2 jours après les séances 3 et 6. » */
export function describeRecovery(plan: SessionPlan[]): string {
  const byDays = new Map<number, number[]>()
  plan.forEach((s, i) => byDays.set(s.restDaysAfter, [...(byDays.get(s.restDaysAfter) ?? []), i + 1]))
  return [...byDays.entries()]
    .sort(([a], [b]) => a - b)
    .map(([days, sessions]) => `${formatRestDays(days)} après ${sessions.length > 1 ? "les séances" : "la séance"} ${joinFr(sessions)}.`)
    .join(" ")
}

/** Durée estimée d'une séance : les repos plus ~40 s par série. */
export function estimateDuration(session: SessionPlan): string {
  const n = session.sets.length
  return `≈ ${Math.round(((n - 1) * session.rest + n * 40) / 60)} min`
}

/* ------------------------------------------------------------------ */
/* Disponibilité des séances                                          */
/* ------------------------------------------------------------------ */

export interface Availability {
  /** Index de la prochaine séance à faire (= nombre de séances : cycle terminé, place au test). */
  nextIndex: number
  /** Vrai quand toutes les séances du cycle sont faites. */
  cycleDone: boolean
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
export function getAvailability(program: Program, plan: SessionPlan[], today: Date = startOfToday()): Availability {
  const done = program.done.slice(0, plan.length)
  let availableFrom = new Date(today)
  if (done.length) {
    const last = done[done.length - 1]
    availableFrom = addDays(parseIso(last.date), plan[done.length - 1].restDaysAfter + 1)
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
    cycleDone: done.length >= plan.length,
    availableFrom,
    resting,
    text: label(formatShort),
    longText: label(formatLong),
  }
}

export function getSessionStatus(program: Program, index: number, availability: Availability): SessionStatus {
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
