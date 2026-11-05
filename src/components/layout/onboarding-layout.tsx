import type { ReactNode } from "react"

import { Logo } from "@/components/layout/logo"
import { cn } from "@/lib/utils"

interface OnboardingLayoutProps {
  step: 1 | 2 | 3
  children: ReactNode
  /** Boutons de navigation, fixés en bas de l'écran. */
  footer?: ReactNode
  /** Le logo n'est pas cliquable pendant la configuration. */
  logoLink?: boolean
  mainClassName?: string
  /** Largeur du pied de page (alignée sur celle du contenu). */
  footerClassName?: string
}

/**
 * Gabarit des 3 étapes d'onboarding : en-tête logo + « Étape X sur 3 », contenu centré,
 * et barre de navigation fixée en bas de l'écran.
 */
export function OnboardingLayout({
  step,
  children,
  footer,
  logoLink = true,
  mainClassName,
  footerClassName = "max-w-[560px]",
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-2.5 px-4 py-3.5 md:gap-3.5 md:px-7 md:py-5">
        <Logo to={logoLink ? "/" : undefined} />
        <span className="text-[13px] text-muted-foreground">Étape {step} sur 3</span>
      </header>
      <main
        className={cn(
          "mx-auto flex w-full flex-auto flex-col justify-center gap-6 px-4 pt-2 pb-6 md:px-5 md:pb-8",
          mainClassName,
        )}
      >
        {children}
      </main>
      {footer && (
        <footer className="sticky bottom-0 z-10 bg-background px-4 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-5 md:pt-3.5 md:pb-7">
          <div className={cn("mx-auto w-full", footerClassName)}>{footer}</div>
        </footer>
      )}
    </div>
  )
}
