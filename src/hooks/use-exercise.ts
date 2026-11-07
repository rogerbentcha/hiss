import { createContext, useContext } from "react"

import { TRACTIONS, type Exercise } from "@/lib/exercises"

/** Exercice de la section en cours, fourni par `ExerciseLayout` à partir de l'URL. */
export const ExerciseContext = createContext<Exercise>(TRACTIONS)

export function useExercise(): Exercise {
  return useContext(ExerciseContext)
}
