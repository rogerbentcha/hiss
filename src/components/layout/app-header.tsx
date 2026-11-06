import { Link } from "react-router"

import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { useExercise } from "@/hooks/use-exercise"
import { HOME } from "@/routes"

/** En-tête du tableau de bord : logo (retour au choix d'exercice), exercice, ancres de section (desktop) et accès au test. */
export function AppHeader() {
  const exercise = useExercise()

  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3.5 px-4 py-3.5 md:px-7 md:py-5">
      <div className="flex items-center gap-3">
        <Logo to={HOME} size="large" />
        <Link
          to={HOME}
          aria-label={`Programme ${exercise.name.toLowerCase()} : changer d'exercice`}
          className="rounded-full bg-primary-muted px-2.5 py-1 text-xs font-semibold text-primary no-underline hover:bg-primary-muted-hover hover:text-primary"
        >
          {exercise.name}
        </Link>
      </div>
      <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-2">
        <a href="#seances" className="hidden px-2.5 py-2.5 text-[13px] text-subtle no-underline hover:text-foreground md:inline">
          Séances
        </a>
        <a href="#calendrier" className="hidden px-2.5 py-2.5 text-[13px] text-subtle no-underline hover:text-foreground md:inline">
          Calendrier
        </a>
        <Button asChild variant="secondary" size="nav" className="px-3.5">
          <Link to={exercise.routes.max}>Refaire le test</Link>
        </Button>
      </nav>
    </header>
  )
}
