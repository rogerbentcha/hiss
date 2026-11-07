import { addDays, startOfToday, toIso } from "@/lib/dates"
import { exerciseRoutes, type ExerciseRoutes } from "@/routes"
import type { ExerciseId, Program, SessionPlan } from "@/types/program"

/**
 * Définition d'un exercice : objectif, niveaux, génération du plan et textes propres.
 * Tout le reste de l'application (séances, minuteur, suivi) est commun.
 */
export interface Exercise {
  id: ExerciseId
  /** « Tractions » */
  name: string
  /** « traction » (les deux noms sont féminins : « une traction », « une pompe »). */
  singular: string
  /** « tractions » */
  plural: string
  /** Objectif final, en répétitions d'affilée. */
  goal: number
  /** Fourchettes de max des 12 niveaux. */
  levels: readonly (readonly [number, number])[]
  /** Borne haute des saisies de répétitions. */
  maxReps: number
  /** Valeur proposée par défaut au test. */
  defaultMax: number
  /** Séances du cycle, calculées à partir du max testé. */
  buildPlan: (max: number) => SessionPlan[]
  /** Programme d'exemple affiché tant que l'onboarding n'a pas été fait. */
  createDemo: (today?: Date) => Program
  copy: {
    /** Sous-titre de l'écran de bienvenue. */
    tagline: string
    /** Accroche de la carte sur la page de choix. */
    pitch: string
    /** Question du test. */
    testQuestion: string
    /** Règle d'exécution rappelée au test et dans « Les règles ». */
    form: string
    /** Promesse « Suis ta progression » de l'écran de bienvenue. */
    progress: string
    /** Libellé accessible du logo animé. */
    logoLabel: string
  }
  routes: ExerciseRoutes
  /** Clés localStorage du programme et de la séance en cours. */
  storageKeys: { state: string; workout: string }
}

/* ------------------------------------------------------------------ */
/* Tractions                                                          */
/* ------------------------------------------------------------------ */

/** Jours de repos après chaque séance (1, 2, 4, 5 → 1 jour ; 3, 6 → 2 jours). */
const SIX_DAY_REST = [1, 1, 2, 1, 1, 2] as const

function buildTractionsPlan(max: number): SessionPlan[] {
  const pct = (p: number) => Math.max(1, Math.round(max * p))
  return SIX_DAY_REST.map((restDaysAfter, k) => {
    const core = pct(0.45 + 0.04 * k)
    return {
      sets: [pct(0.45 + 0.05 * k), pct(0.6 + 0.05 * k), core, core, pct(0.6 + 0.04 * k)],
      rest: 120,
      restDaysAfter,
    }
  })
}

export const TRACTIONS: Exercise = {
  id: "tractions",
  name: "Tractions",
  singular: "traction",
  plural: "tractions",
  goal: 50,
  levels: [
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
  ],
  maxReps: 99,
  defaultMax: 8,
  buildPlan: buildTractionsPlan,
  createDemo: (today = startOfToday()) => {
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
  },
  copy: {
    tagline: "Ton programme de tractions, de ta première répétition jusqu'à 50.",
    pitch: "De ta première répétition jusqu'à 50 d'affilée.",
    testQuestion: "Combien de tractions fais-tu ?",
    form: "Bras tendus en bas, menton au-dessus de la barre, sans élan.",
    progress: "Un calendrier de suivi et un test tous les 15 jours pour monter de niveau.",
    logoLabel: "Logo Hisse : un bonhomme saute, attrape la barre et enchaîne trois tractions",
  },
  routes: exerciseRoutes("tractions"),
  // Clés historiques, conservées pour ne pas perdre les programmes déjà enregistrés.
  storageKeys: { state: "hisse:state", workout: "hisse:workout" },
}

/* ------------------------------------------------------------------ */
/* Pompes (tableaux du programme 100pompes.com)                       */
/* ------------------------------------------------------------------ */

/** Cycle de 6 jours à 5 séries : repos de 60, 90 puis 120 s, deux fois. */
const sixDays = (days: number[][]): SessionPlan[] =>
  days.map((sets, k) => ({ sets, rest: [60, 90, 120][k % 3], restDaysAfter: SIX_DAY_REST[k] }))

/** Cycle de 3 jours : 5 séries à 60 s le jour 1, puis 8 ou 9 séries courtes à 45 s. */
const threeDays = (day1: number[], day2: number[], day3: number[]): SessionPlan[] => [
  { sets: day1, rest: 60, restDaysAfter: 1 },
  { sets: day2, rest: 45, restDaysAfter: 1 },
  { sets: day3, rest: 45, restDaysAfter: 2 },
]

/** Un plan par niveau ; la dernière valeur de chaque séance est le minimum de la série « max ». */
const POMPES_PLANS: SessionPlan[][] = [
  // Moins de 5
  sixDays([[2, 3, 2, 2, 3], [3, 4, 2, 3, 4], [4, 5, 4, 4, 5], [5, 6, 4, 4, 6], [5, 6, 4, 4, 7], [5, 7, 5, 5, 7]]),
  // 6 à 10
  sixDays([[5, 6, 4, 4, 5], [6, 7, 6, 6, 7], [8, 10, 7, 7, 10], [9, 11, 8, 8, 11], [10, 12, 9, 9, 13], [12, 13, 10, 10, 15]]),
  // 11 à 20
  sixDays([[8, 9, 7, 7, 8], [9, 10, 8, 8, 10], [11, 13, 9, 9, 13], [12, 14, 10, 10, 15], [13, 15, 11, 11, 17], [14, 16, 13, 13, 19]]),
  // 21 à 25
  sixDays([[12, 17, 13, 13, 17], [14, 19, 14, 14, 19], [16, 21, 15, 15, 21], [18, 22, 16, 16, 21], [20, 25, 20, 20, 23], [23, 28, 22, 22, 25]]),
  // 26 à 30
  sixDays([[14, 18, 14, 14, 20], [20, 25, 15, 15, 23], [20, 27, 18, 18, 25], [21, 25, 21, 21, 27], [25, 29, 25, 25, 30], [29, 33, 29, 29, 33]]),
  // 31 à 35
  threeDays([17, 19, 15, 15, 20], [10, 10, 13, 13, 10, 10, 9, 25], [13, 13, 15, 15, 12, 12, 10, 30]),
  // 36 à 40
  threeDays([22, 24, 20, 20, 25], [15, 15, 18, 18, 15, 15, 14, 30], [18, 18, 20, 20, 17, 17, 15, 35]),
  // 41 à 45
  threeDays([27, 29, 25, 25, 35], [19, 19, 22, 22, 18, 18, 22, 35], [20, 20, 24, 24, 20, 20, 22, 40]),
  // 46 à 50
  threeDays([30, 34, 30, 30, 40], [19, 19, 23, 23, 19, 19, 22, 37], [20, 20, 27, 27, 21, 21, 21, 44]),
  // 51 à 55
  threeDays([30, 39, 35, 35, 42], [20, 20, 23, 23, 20, 20, 18, 18, 53], [22, 22, 30, 30, 25, 25, 18, 18, 55]),
  // 56 à 60
  threeDays([30, 44, 40, 40, 55], [22, 22, 27, 27, 24, 23, 18, 18, 58], [26, 26, 33, 33, 26, 26, 22, 22, 60]),
  // Plus de 60
  threeDays([35, 49, 45, 45, 55], [22, 22, 30, 30, 24, 24, 18, 18, 59], [28, 28, 35, 35, 27, 27, 23, 23, 60]),
]

const POMPES_LEVELS: Exercise["levels"] = [
  [0, 5],
  [6, 10],
  [11, 20],
  [21, 25],
  [26, 30],
  [31, 35],
  [36, 40],
  [41, 45],
  [46, 50],
  [51, 55],
  [56, 60],
  [61, 100],
]

export const POMPES: Exercise = {
  id: "pompes",
  name: "Pompes",
  singular: "pompe",
  plural: "pompes",
  goal: 100,
  levels: POMPES_LEVELS,
  maxReps: 199,
  defaultMax: 12,
  buildPlan: (max) => {
    const index = POMPES_LEVELS.findIndex(([, top]) => max <= top)
    return POMPES_PLANS[index < 0 ? POMPES_PLANS.length - 1 : index]
  },
  createDemo: (today = startOfToday()) => {
    const first = toIso(addDays(today, -4))
    const second = toIso(addDays(today, -2))
    return {
      max: 14,
      start: first,
      done: [
        { reps: [8, 9, 7, 7, 10], date: first },
        { reps: [9, 10, 8, 8, 11], date: second },
      ],
    }
  },
  copy: {
    tagline: "Ton programme de pompes, jusqu'à 100 d'affilée.",
    pitch: "Jusqu'à 100 pompes d'affilée, en 6 à 10 semaines.",
    testQuestion: "Combien de pompes fais-tu ?",
    form: "Corps gainé et aligné, poitrine près du sol, bras tendus en haut.",
    progress: "Un calendrier de suivi et un test à la fin de chaque cycle pour monter de niveau.",
    logoLabel: "Logo Hisse : un bonhomme pose les mains au sol, se met en planche et enchaîne trois pompes",
  },
  routes: exerciseRoutes("pompes"),
  storageKeys: { state: "hisse:pompes:state", workout: "hisse:pompes:workout" },
}

export const EXERCISES: readonly Exercise[] = [TRACTIONS, POMPES]

export function findExercise(id: string | undefined): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}
