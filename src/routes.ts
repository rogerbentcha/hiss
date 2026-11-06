import type { ExerciseId } from "@/types/program"

/** Page d'accueil de la plateforme : choix entre tractions et pompes. */
export const HOME = "/"

/** Chemins d'un programme, préfixés par l'exercice (`/tractions/...`, `/pompes/...`). */
export function exerciseRoutes(id: ExerciseId) {
  const base = `/${id}`
  return {
    welcome: base,
    max: `${base}/onboarding/max`,
    config: `${base}/onboarding/configuration`,
    sessions: `${base}/seances`,
    session: (n: number) => `${base}/seances/${n}`,
    workout: `${base}/seance-du-jour`,
  } as const
}

export type ExerciseRoutes = ReturnType<typeof exerciseRoutes>
