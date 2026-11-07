/* ==========================================================================
   Hisse — outils communs aux rigs vectoriels du bonhomme (tractions, pompes).
   Gabarit du personnage, pistes d'animation, cinématique inverse, construction
   SVG et lecteur (boucle complète, pose fixe, répétitions au survol).
   ========================================================================== */

export const NS = "http://www.w3.org/2000/svg"
export const D2R = Math.PI / 180

export interface Point {
  x: number
  y: number
}

export interface Colors {
  fg: string
  bg: string
}

// ---- Gabarit du personnage (unités du viewBox) ----------------------------
export const GAP = 0.55 // épaisseur des séparations
export const TW = 3.6 // torse
export const AW = 2.2 // bras
export const LW = 2.5 // jambes
export const HR = 2.0 // rayon de la tête
export const TL = 5.2 // longueur du torse (axe)
export const HEAD_OFF = TW / 2 + 0.5 + HR // haut du torse -> centre de la tête
export const GOO = 0.45 // rayon de lissage des raccords entre membres

// ---- Easing & pistes d'animation ------------------------------------------
export const EASE = {
  lin: (t: number) => t,
  in2: (t: number) => t * t, // chute libre
  out2: (t: number) => 1 - (1 - t) * (1 - t), // montée balistique
  io: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
}
export type Ease = keyof typeof EASE
export type Key = [time: number, value: number, ease?: Ease]

/** Piste interpolée entre des clés `[temps, valeur, easing du segment qui y mène]`. */
export function track(keys: Key[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1]
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = "io"] = keys[i]
      if (t <= t1) {
        const [t0, v0] = keys[i - 1]
        const u = t1 > t0 ? (t - t0) / (t1 - t0) : 1
        return v0 + (v1 - v0) * EASE[e](u)
      }
    }
    return keys[keys.length - 1][1]
  }
}

// ---- Cinématique inverse 2 segments ---------------------------------------
/** Articulation intermédiaire (coude, genou) du côté indiqué par `pref`. */
export function ik(root: Point, target: Point, l1: number, l2: number, pref: Point) {
  let dx = target.x - root.x
  let dy = target.y - root.y
  let d = Math.hypot(dx, dy)
  const max = l1 + l2 - 1e-4
  if (d < 1e-4) {
    dx = 0
    dy = 1
    d = 1e-4
  }
  if (d > max) {
    dx *= max / d
    dy *= max / d
    d = max
  }
  const ux = dx / d
  const uy = dy / d
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  let px = -uy
  let py = ux
  if (px * pref.x + py * pref.y < 0) {
    px = -px
    py = -py
  }
  return {
    mid: { x: root.x + ux * a + px * h, y: root.y + uy * a + py * h },
    end: { x: root.x + dx, y: root.y + dy },
  }
}
export const lerp = (a: Point, b: Point, w: number): Point => ({ x: a.x + (b.x - a.x) * w, y: a.y + (b.y - a.y) * w })
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const smooth = (v: number) => {
  v = clamp(v, 0, 1)
  return v * v * (3 - 2 * v)
}

// ---- Construction SVG -------------------------------------------------------
export function el(parent: Element, name: string, attrs: Record<string, string | number>) {
  const e = document.createElementNS(NS, name)
  for (const k in attrs) e.setAttribute(k, String(attrs[k]))
  parent.appendChild(e)
  return e
}
export const pts = (p: Point[]) => "M" + p.map((q) => q.x.toFixed(3) + " " + q.y.toFixed(3)).join("L")

let gooCount = 0

/**
 * Prépare le `<svg>` et crée le groupe « gooey » (flou + seuil alpha) qui fusionne en une seule
 * silhouette les membres qu'on y dessine, en arrondissant tous les raccords.
 */
export function setupSvg(svg: SVGSVGElement, viewBox: string) {
  svg.setAttribute("viewBox", viewBox)
  svg.setAttribute("fill", "none")
  svg.setAttribute("stroke-linecap", "round")
  svg.setAttribute("stroke-linejoin", "round")
  const id = "hisse-goo-" + ++gooCount
  const defs = el(svg, "defs", {})
  const filter = el(defs, "filter", { id, filterUnits: "userSpaceOnUse", x: -6, y: -8, width: 38, height: 46 })
  el(filter, "feGaussianBlur", { in: "SourceGraphic", stdDeviation: GOO, result: "b" })
  el(filter, "feColorMatrix", { in: "b", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -19" })
  return { gooFilter: `url(#${id})` }
}

export interface BurstOrigin extends Point {
  r: number
  angles: number[]
}

/** Petits traits qui jaillissent puis s'effacent (éclat, poussière). Renvoie le nombre de traits utilisés. */
export function burst(lines: Element[], t: number, t0: number, dur: number, origins: BurstOrigin[]) {
  const p = (t - t0) / dur
  let i = 0
  for (const o of origins)
    for (const ang of o.angles) {
      const l = lines[i++]
      if (p < 0 || p > 1) {
        l.setAttribute("opacity", "0")
        continue
      }
      const e = EASE.out2(p)
      const r0 = o.r + 1.6 * e
      const r1 = r0 + 0.25 + 1.0 * (1 - p)
      const c = Math.cos(ang * D2R)
      const s = Math.sin(ang * D2R)
      l.setAttribute("x1", String(o.x + c * r0))
      l.setAttribute("y1", String(o.y + s * r0))
      l.setAttribute("x2", String(o.x + c * r1))
      l.setAttribute("y2", String(o.y + s * r1))
      l.setAttribute("opacity", (1 - p * p).toFixed(3))
    }
  return i
}

// ---- Lecteur -----------------------------------------------------------------
export interface LogoRig {
  /** Au survol : enchaîne les répétitions ; à la sortie, finit la répétition en cours puis s'arrête. */
  hover: (on: boolean) => void
  /** Arrête l'animation et vide le SVG. */
  destroy: () => void
}

export interface RigDefinition {
  /** Cadre de l'animation complète. */
  viewBox: string
  /** Cadre serré de la pose fixe. */
  stillViewBox: string
  mount: (svg: SVGSVGElement, colors: Colors, options?: { still?: boolean }) => LogoRig
}

interface PlayerOptions {
  still: boolean
  /** Durée de la boucle complète (s). */
  loop: number
  /** Instant de la pose fixe ; c'est aussi le début des répétitions jouées au survol. */
  stillAt: number
  /** Fin de chaque répétition (même pose que la pose fixe) : points d'arrêt possibles au survol. */
  repEnds: number[]
  /** Dessine l'instant `t` (déjà ramené dans la boucle). */
  draw: (t: number) => void
  /** Fait avancer une simulation (ressort…) de `t0` à `t1`. */
  step?: (t0: number, t1: number) => void
  /** Remet la simulation au repos à l'instant `t`. */
  reset?: (t: number) => void
}

/**
 * Lecteur commun : boucle complète, ou pose fixe qui joue les répétitions au survol
 * (de `stillAt` jusqu'à la dernière fin de répétition, en boucle sans à-coup).
 */
export function playRig(svg: SVGSVGElement, o: PlayerOptions): LogoRig {
  const repsEnd = o.repEnds[o.repEnds.length - 1]
  let animT = o.still ? o.stillAt : 0
  o.reset?.(animT % o.loop)
  let last: number | null = null
  let raf = 0
  let hovered = false
  let stopAt: number | null = null

  const draw = () => o.draw(animT % o.loop)

  const advance = (now: number) => {
    if (last == null) return
    const prev = animT
    animT += Math.min(0.05, (now - last) / 1000)
    o.step?.(prev, animT)
  }

  const loop = (now: number) => {
    advance(now)
    last = now
    draw()
    raf = requestAnimationFrame(loop)
  }

  const reps = (now: number) => {
    advance(now)
    last = now
    if (stopAt != null && animT >= stopAt) {
      // Fin de répétition = même pose que la pose fixe : on y revient exactement.
      animT = o.stillAt
      o.reset?.(animT)
      draw()
      raf = 0
      last = null
      stopAt = null
      return
    }
    if (animT >= repsEnd) animT -= repsEnd - o.stillAt
    draw()
    raf = requestAnimationFrame(reps)
  }

  draw()
  if (!o.still) raf = requestAnimationFrame(loop)

  return {
    hover(on) {
      if (!o.still || on === hovered) return
      hovered = on
      if (on) {
        stopAt = null
        if (!raf) raf = requestAnimationFrame(reps)
      } else if (raf) {
        // Termine la répétition en cours avant de s'arrêter.
        stopAt = o.repEnds.find((end) => end > animT + 1e-3) ?? repsEnd
      }
    },
    destroy() {
      cancelAnimationFrame(raf)
      svg.replaceChildren()
    },
  }
}
