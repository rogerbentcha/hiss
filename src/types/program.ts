/** Date locale au format ISO `YYYY-MM-DD`. */
export type IsoDate = string

/** Exercices proposés par la plateforme (aussi utilisés comme segment d'URL). */
export type ExerciseId = "tractions" | "pompes"

/** Plan d'une séance : séries cibles (la dernière est un minimum), repos entre séries et jours de repos après. */
export interface SessionPlan {
  sets: number[]
  /** Repos minimum entre deux séries, en secondes. */
  rest: number
  /** Jours de repos minimum avant la séance suivante. */
  restDaysAfter: number
}

/** Une séance terminée : les répétitions de chacune des séries. */
export interface CompletedSession {
  reps: number[]
  date: IsoDate
}

/** Un cycle d'entraînement : un test de max suivi des séances du plan (6 pour les tractions, 3 ou 6 pour les pompes). */
export interface Program {
  max: number
  start: IsoDate
  done: CompletedSession[]
}

/** Données persistées dans le localStorage. */
export interface StoredState {
  /** Cycle en cours (null tant que l'onboarding n'est pas terminé). */
  program: Program | null
  /** Cycles précédents, conservés à chaque nouveau test. */
  history: Program[]
}

/** Séance en cours, persistée pour survivre à un rechargement de page. */
export interface WorkoutProgress {
  /** Index de la séance concernée et date du cycle, pour invalider un brouillon obsolète. */
  sessionIndex: number
  programStart: IsoDate
  /** Index de la série en cours (= nombre de séries : toutes faites). */
  current: number
  reps: (number | null)[]
  value: number
  timer: RestTimerState
}

export interface RestTimerState {
  /** Secondes restantes quand le minuteur est en pause. */
  left: number
  /** Horodatage (ms) de fin quand le minuteur tourne, sinon null. */
  endsAt: number | null
}

export type SessionStatus = "done" | "available" | "resting" | "locked"

export interface Level {
  /** Index 0-11. */
  index: number
  min: number
  max: number
  /** Libellé sur 2 chiffres, ex. « 05 ». */
  label: string
  /** Fourchette affichée, ex. « 12–15 » ou « 46 et + ». */  range: string
}
