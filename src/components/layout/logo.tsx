import { Link } from "react-router"

import { HisseLogo } from "@/components/common/hisse-logo"
import { cn } from "@/lib/utils"

interface LogoProps {
  /** Lien vers l'accueil ; sans lien le logo est purement décoratif (étape de configuration). */
  to?: string
  /** `responsive` : plus petit sur mobile (onboarding) ; `large` : taille desktop partout. */
  size?: "responsive" | "large"
  className?: string
}

export function Logo({ to, size = "responsive", className }: LogoProps) {
  const large = size === "large"
  const content = (
    <>
      <HisseLogo animateOnHover className="size-5 -translate-y-px" />
      <span className={cn("font-display font-extrabold leading-none", large ? "text-[19px]" : "text-lg md:text-[19px]")}>
        hisse
      </span>
    </>
  )

  const classes = cn("flex items-center text-foreground no-underline", large ? "gap-2.5" : "gap-2 md:gap-2.5", className)

  if (!to) return <span className={classes}>{content}</span>

  return (
    <Link to={to} className={cn(classes, "hover:text-foreground")}>
      {content}
    </Link>
  )
}
