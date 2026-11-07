import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"

import { DevResetButton } from "@/components/dev/dev-reset-button"
import { findExercise } from "@/lib/exercises"

/** Titres des pages d'un exercice, d'après le chemin sans le préfixe `/tractions` ou `/pompes`. */
const TITLES: [RegExp, string][] = [
  [/^\/?$/, "bienvenue"],
  [/^\/onboarding\/max/, "ton max actuel"],
  [/^\/onboarding\/configuration/, "configuration des séances"],
  [/^\/seances\/\d+/, "détail d'une séance"],
  [/^\/seances/, "mes séances"],
  [/^\/seance-du-jour/, "séance du jour"],
]

function documentTitle(pathname: string): string {
  if (pathname === "/") return "Hisse, choisis ton programme"
  const [, id, rest = ""] = pathname.match(/^\/([^/]+)(\/.*)?$/) ?? []
  const exercise = findExercise(id)
  const page = TITLES.find(([re]) => re.test(rest))?.[1]
  return exercise && page ? `Hisse ${exercise.plural}, ${page}` : "Hisse"
}

/** Racine des routes : titre du document, remise en haut de page à chaque navigation et outils de dev. */
export function RootLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = documentTitle(pathname)
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <DevResetButton />}
    </>
  )
}
