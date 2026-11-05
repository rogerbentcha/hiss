import { Link } from "react-router"

import { HisseLogo } from "@/components/common/hisse-logo"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/routes"

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 bg-background px-4 text-center text-foreground">
      <HisseLogo className="size-16" />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">Page introuvable</h1>
        <p className="m-0 text-[15px] text-muted-foreground md:text-base">Cette page n'existe pas ou plus.</p>
      </div>
      <Button asChild>
        <Link to={ROUTES.sessions}>Retour à mes séances</Link>
      </Button>
    </main>
  )
}
