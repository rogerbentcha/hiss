import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { MotionConfig, motion, type HTMLMotionProps, type Transition, type Variants } from "motion/react"

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

/* ---------- Animations ---------- */

/** Sens d'arrivée : 0 = première ouverture, 1 = étape suivante, -1 = retour. */
type Direction = -1 | 0 | 1

const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1]

/** Ressort discret pour les déplacements ; l'opacité garde une courbe simple (pas de rebond). */
function spring(visualDuration: number, delay = 0): Transition {
  return {
    type: "spring",
    visualDuration,
    bounce: 0.25,
    delay,
    opacity: { duration: visualDuration * 0.8, ease: EASE_OUT, delay },
  }
}

/*
 * Chaque page monte son propre gabarit : on mémorise la dernière étape affichée au niveau
 * du module pour connaître le sens de navigation. Si on quitte l'onboarding (aucun gabarit
 * monté), on oublie l'étape : la prochaine ouverture rejoue l'animation d'arrivée.
 */
let lastStep: number | null = null
let mountedLayouts = 0

function useStepDirection(step: number): Direction {
  const [direction] = useState<Direction>(() =>
    lastStep === null || lastStep === step ? 0 : step > lastStep ? 1 : -1,
  )

  useEffect(() => {
    mountedLayouts++
    lastStep = step
    return () => {
      mountedLayouts--
      // Le gabarit de l'étape suivante est monté dans le même rendu : on attend un tick.
      setTimeout(() => {
        if (mountedLayouts === 0) lastStep = null
      })
    }
  }, [step])

  return direction
}

function containerVariants(direction: Direction): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: direction === 0 ? 0.08 : 0.05, delayChildren: direction === 0 ? 0.1 : 0 } },
  }
}

function itemVariants(direction: Direction): Variants {
  return {
    hidden: { opacity: 0, x: direction * 24, y: direction === 0 ? 12 : 0 },
    show: { opacity: 1, x: 0, y: 0, transition: spring(direction === 0 ? 0.5 : 0.4) },
  }
}

const ItemVariantsContext = createContext<Variants>(itemVariants(0))

/** Bloc de contenu d'une étape : apparaît en cascade avec les autres blocs. */
export function OnboardingItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={useContext(ItemVariantsContext)} {...props} />
}

/* ---------- Gabarit ---------- */

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
  const direction = useStepDirection(step)
  const firstLoad = direction === 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <motion.header
          initial={firstLoad ? { opacity: 0, y: -8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={spring(0.45)}
          className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-2.5 px-4 py-3.5 md:gap-3.5 md:px-7 md:py-5"
        >
          <Logo to={logoLink ? "/" : undefined} />
          <motion.span
            key={step}
            initial={firstLoad ? false : { opacity: 0, y: direction * 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring(0.35)}
            className="text-[13px] text-muted-foreground"
          >
            Étape {step} sur 3
          </motion.span>
        </motion.header>
        <ItemVariantsContext.Provider value={itemVariants(direction)}>
          <motion.main
            variants={containerVariants(direction)}
            initial="hidden"
            animate="show"
            className={cn(
              "mx-auto flex w-full flex-auto flex-col justify-center gap-6 px-4 pt-2 pb-6 md:px-5 md:pb-8",
              mainClassName,
            )}
          >
            {children}
          </motion.main>
        </ItemVariantsContext.Provider>
        {footer && (
          <footer className="sticky bottom-0 z-10 bg-background px-4 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-5 md:pt-3.5 md:pb-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring(0.45, firstLoad ? 0.4 : 0.1)}
              className={cn("mx-auto w-full", footerClassName)}
            >
              {footer}
            </motion.div>
          </footer>
        )}
      </div>
    </MotionConfig>
  )
}
