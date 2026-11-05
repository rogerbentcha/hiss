import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"

import { DevResetButton } from "@/components/dev/dev-reset-button"

const TITLES: [RegExp, string][] = [
  [/^\/$/, "Hisse, bienvenue"],
  [/^\/onboarding\/max/, "Hisse, ton max actuel"],
  [/^\/onboarding\/configuration/, "Hisse, configuration des séances"],
  [/^\/seances\/\d+/, "Hisse, détail d'une séance"],
  [/^\/seances/, "Hisse, mes séances"],
  [/^\/seance-du-jour/, "Hisse, séance du jour"],
]

/** Racine des routes : titre du document, remise en haut de page à chaque navigation et outils de dev. */
export function RootLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? "Hisse"
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <DevResetButton />}
    </>
  )
}
