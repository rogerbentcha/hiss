import type { Key, ReactNode } from "react"
import { AnimatePresence, MotionConfig, motion, type TargetAndTransition } from "motion/react"

import { cn } from "@/lib/utils"

const HIDDEN: TargetAndTransition = { scale: 0.25, opacity: 0, filter: "blur(4px)" }
const SHOWN: TargetAndTransition = { scale: 1, opacity: 1, filter: "blur(0px)" }

interface IconSwapProps {
  /** Change de valeur quand l'icône change : l'ancienne s'efface pendant que la nouvelle apparaît. */
  swapKey: Key
  children: ReactNode
  className?: string
}

/**
 * Remplace une icône par une autre en fondu (échelle, opacité, flou) au lieu d'un changement sec.
 * Les deux icônes sont superposées dans la même cellule de grille pendant la transition.
 * Pas d'animation au premier rendu ; « réduire les animations » ne garde que le fondu.
 */
export function IconSwap({ swapKey, children, className }: IconSwapProps) {
  return (
    <MotionConfig reducedMotion="user">
      <span className={cn("grid place-items-center *:col-start-1 *:row-start-1", className)}>
        <AnimatePresence initial={false}>
          <motion.span
            key={swapKey}
            initial={HIDDEN}
            animate={SHOWN}
            exit={HIDDEN}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="flex items-center justify-center"
          >
            {children}
          </motion.span>
        </AnimatePresence>
      </span>
    </MotionConfig>
  )
}
