import { useEffect, useRef } from "react"

import { useExercise } from "@/hooks/use-exercise"
import { TRACTIONS_RIG } from "@/lib/logo-rig"
import { POMPES_RIG } from "@/lib/pushup-rig"
import type { RigDefinition } from "@/lib/rig-kit"
import { cn } from "@/lib/utils"
import type { ExerciseId } from "@/types/program"

/** Un bonhomme par exercice : à la barre de traction, ou en planche pour les pompes. */
const RIGS: Record<ExerciseId, RigDefinition> = { tractions: TRACTIONS_RIG, pompes: POMPES_RIG }

interface HisseLogoProps {
  /** Bonhomme à afficher ; par défaut celui de l'exercice de la section en cours (tractions hors section). */
  exercise?: ExerciseId
  /** Animation complète (boucle de 8 s : trois tractions ou trois pompes) ; sinon pose fixe. */
  animated?: boolean
  /**
   * Pose fixe qui enchaîne des répétitions au survol (ou au focus clavier) du lien qui la contient,
   * à défaut du logo lui-même.
   */
  animateOnHover?: boolean
  /**
   * Couleur du fond sur lequel le logo est posé : les séparations entre la tête,
   * la barre et les poings sont peintes de cette couleur.
   */
  surface?: "background" | "card"
  /** Libellé accessible ; sans libellé le logo est décoratif. */
  label?: string
  className?: string
}

/** Logo Hisse : le bonhomme à la barre de traction (design/hisse-logo-animation.html) ou qui fait des pompes. */
export function HisseLogo({ exercise, animated = false, animateOnHover = false, surface = "background", label, className }: HisseLogoProps) {
  const ref = useRef<SVGSVGElement>(null)
  const current = useExercise().id
  const rigDef = RIGS[exercise ?? current]

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    // Lu sur le SVG lui-même : la couleur primaire dépend de la section (data-exercise).
    const css = getComputedStyle(svg)
    const colors = {
      fg: css.getPropertyValue("--primary").trim() || "#c8f53b",
      bg: css.getPropertyValue(`--${surface}`).trim() || "#1c1c1e",
    }
    // Avec « réduire les animations », le logo reste en pose fixe, même au survol.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const rig = rigDef.mount(svg, colors, { still: !animated || reduced })
    if (!animateOnHover || animated || reduced) return rig.destroy

    const target: Element = svg.closest("a, button") ?? svg
    const on = () => rig.hover(true)
    const off = () => rig.hover(false)
    target.addEventListener("pointerenter", on)
    target.addEventListener("pointerleave", off)
    target.addEventListener("focusin", on)
    target.addEventListener("focusout", off)
    return () => {
      target.removeEventListener("pointerenter", on)
      target.removeEventListener("pointerleave", off)
      target.removeEventListener("focusin", on)
      target.removeEventListener("focusout", off)
      rig.destroy()
    }
  }, [rigDef, animated, animateOnHover, surface])

  return (
    <svg
      ref={ref}
      viewBox={animated ? rigDef.viewBox : rigDef.stillViewBox}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      // En pose fixe, la tête des tractions dépasse du cadre serré quand le menton passe la barre.
      className={cn("block flex-none overflow-visible", className)}
    />
  )
}
