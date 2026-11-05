import { Link } from "react-router"

import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes"

/** En-tête du tableau de bord : logo, ancres de section (desktop) et accès au test. */
export function AppHeader() {
  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3.5 px-4 py-3.5 md:px-7 md:py-5">
      <Logo to={ROUTES.welcome} size="large" />
      <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-2">
        <a href="#seances" className="hidden px-2.5 py-2.5 text-[13px] text-subtle no-underline hover:text-foreground md:inline">
          Séances
        </a>
        <a href="#calendrier" className="hidden px-2.5 py-2.5 text-[13px] text-subtle no-underline hover:text-foreground md:inline">
          Calendrier
        </a>
        <Button asChild variant="secondary" size="nav" className="px-3.5">
          <Link to={ROUTES.max}>Refaire le test</Link>
        </Button>
      </nav>
    </header>
  )
}
