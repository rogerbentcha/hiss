import { Navigate, Outlet, useLocation, useParams } from "react-router"

import { ExerciseContext } from "@/hooks/use-exercise"
import { findExercise } from "@/lib/exercises"
import { NotFoundPage } from "@/pages/not-found-page"

/**
 * Section d'un exercice (`/tractions/...`, `/pompes/...`) : fournit l'exercice aux pages et
 * applique sa couleur primaire via `data-exercise` (voir index.css).
 */
export function ExerciseLayout() {
  const exercise = findExercise(useParams().exercise)
  if (!exercise) return <NotFoundPage />

  return (
    <ExerciseContext.Provider value={exercise}>
      <div data-exercise={exercise.id} className="contents">
        <Outlet />
      </div>
    </ExerciseContext.Provider>
  )
}

/** Anciennes URL sans préfixe (`/seances`, `/onboarding/max`…) : c'étaient les tractions. */
export function LegacyRedirect() {
  const { pathname, search, hash } = useLocation()
  return <Navigate to={`/tractions${pathname}${search}${hash}`} replace />
}
