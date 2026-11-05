import { useEffect, useRef } from "react"

import { LOGO_STILL_VIEWBOX, LOGO_VIEWBOX, mountLogoRig } from "@/lib/logo-rig"
import { cn } from "@/lib/utils"

interface HisseLogoProps {
  /** Animation complète (saut + trois tractions, boucle de 8 s) ; sinon pose fixe suspendue à la barre. */
  animated?: boolean
  /**
   * Pose fixe qui enchaîne des tractions au survol (ou au focus clavier) du lien qui la contient,
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

/** Logo Hisse : bonhomme à la barre de traction (rig vectoriel de design/hisse-logo-animation.html). */
export function HisseLogo({ animated = false, animateOnHover = false, surface = "background", label, className }: HisseLogoProps) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const css = getComputedStyle(document.documentElement)
    const colors = {
      fg: css.getPropertyValue("--primary").trim() || "#c8f53b",
      bg: css.getPropertyValue(`--${surface}`).trim() || "#1c1c1e",
    }
    // Avec « réduire les animations », le logo reste suspendu à la barre, même au survol.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const rig = mountLogoRig(svg, colors, { still: !animated || reduced })
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
  }, [animated, animateOnHover, surface])

  return (
    <svg
      ref={ref}
      viewBox={animated ? LOGO_VIEWBOX : LOGO_STILL_VIEWBOX}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      // En pose fixe, la tête dépasse du cadre serré quand le menton passe la barre.
      className={cn("block flex-none overflow-visible", className)}
    />
  )
}
