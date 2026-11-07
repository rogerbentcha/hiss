import { EXERCISES } from "@/lib/exercises"
import { createLocalStore, type LocalStore } from "@/lib/storage"
import type { CompletedSession, ExerciseId, Program, StoredState, WorkoutProgress } from "@/types/program"

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null

const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)

const isCompletedSession = (v: unknown): v is CompletedSession =>
  isObject(v) && Array.isArray(v.reps) && v.reps.every((r) => typeof r === "number") && isIsoDate(v.date)

export const isProgram = (v: unknown): v is Program =>
  isObject(v) &&
  typeof v.max === "number" &&
  isIsoDate(v.start) &&
  Array.isArray(v.done) &&
  v.done.every(isCompletedSession)

const isStoredState = (v: unknown): v is StoredState =>
  isObject(v) && (v.program === null || isProgram(v.program)) && Array.isArray(v.history) && v.history.every(isProgram)

const isWorkoutProgress = (v: unknown): v is WorkoutProgress =>
  isObject(v) &&
  typeof v.sessionIndex === "number" &&
  isIsoDate(v.programStart) &&
  typeof v.current === "number" &&
  Array.isArray(v.reps) &&
  typeof v.value === "number" &&
  isObject(v.timer) &&
  typeof v.timer.left === "number"

export const EMPTY_STATE: StoredState = { program: null, history: [] }

export interface ExerciseStores {
  /** Programme et historique des cycles. */
  program: LocalStore<StoredState>
  /** Séance en cours (brouillon). */
  workout: LocalStore<WorkoutProgress | null>
}

/** Chaque exercice a ses propres données : on peut suivre les deux programmes en parallèle. */
const STORES = Object.fromEntries(
  EXERCISES.map((e) => [
    e.id,
    {
      program: createLocalStore<StoredState>(e.storageKeys.state, EMPTY_STATE, isStoredState),
      workout: createLocalStore<WorkoutProgress | null>(
        e.storageKeys.workout,
        null,
        (v): v is WorkoutProgress | null => v === null || isWorkoutProgress(v),
      ),
    },
  ]),
) as Record<ExerciseId, ExerciseStores>

export const getStores = (id: ExerciseId): ExerciseStores => STORES[id]
