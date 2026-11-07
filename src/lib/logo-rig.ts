/* ==========================================================================
   Hisse — rig vectoriel animé du logo (porté de design/hisse-logo-animation.html)
   Le bonhomme saute, attrape la barre, enchaîne trois tractions puis redescend.
   Tête pleine, membres en capsules à bouts ronds, séparations « knockout »
   couleur fond entre les parties qui se superposent. Bras et jambes en
   cinématique inverse à 2 segments ; barre élastique simulée par un ressort.
   ========================================================================== */

import {
  AW,
  burst,
  clamp,
  D2R,
  el,
  GAP,
  HEAD_OFF,
  HR,
  ik,
  lerp,
  LW,
  playRig,
  pts,
  setupSvg,
  smooth,
  TL,
  track,
  TW,
  type Colors,
  type RigDefinition,
} from "@/lib/rig-kit"

// ---- Gabarit propre aux tractions --------------------------------------------
const ARM_X = 1.7 // attache des bras dans le torse
const ARM_DY = 0.3
const LEG_X = 0.85 // attache des jambes
const FOOT_X = 1.8 // écart des pieds
const UPPER = 4.5
const FORE = 4.5
const ARM = UPPER + FORE
const REACH_UP = 0.955 // bras levés : jamais tendus à 100 %, coude toujours un peu fléchi
const FIST = 1.3 // poings posés devant la barre
const THIGH = 3.4
const SHIN = 3.4
const LEG = THIGH + SHIN

// ---- Barre -----------------------------------------------------------------
const BAR_Y = 3.5
const BAR_X0 = 2
const BAR_X1 = 22
const BAR_W = 1.8
const GRIP = 4.4
const gt = (12 - GRIP - BAR_X0) / (BAR_X1 - BAR_X0)
const SAG_AT_GRIP = 4 * gt * (1 - gt) // flèche de la barre au niveau des mains

// ---- Hauteurs clés (axe des hanches) --------------------------------------
const LEG_DY = Math.sqrt(LEG * LEG - (FOOT_X - LEG_X) ** 2)
const ARM_RISE = Math.sqrt((REACH_UP * ARM) ** 2 - (GRIP - ARM_X) ** 2)
const HANG = BAR_Y + ARM_RISE - ARM_DY + TL // suspendu, coudes à peine fléchis
const TOP = 0.7 + HEAD_OFF + TL // menton au-dessus de la barre
const STAND = HANG + 6.0 // debout
const CROUCH = STAND + 1.5 // appel du saut
const GROUND = STAND + LEG_DY

// Angles « locaux » des bras : 0° = vers l'extérieur, 90° = vers le bas.
const OVER = Math.atan2(-ARM_RISE, GRIP - ARM_X) / D2R // bras levés = prise de barre
const REST = 62 // bras tendus le long du corps, un peu écartés

/** Durée de la boucle (s). */
export const LOGO_LOOP = 8.0
const T = LOGO_LOOP
const CATCH = 2.46
const LAND = 6.72
/** Instant affiché quand les animations sont réduites : suspendu à la barre. */
export const LOGO_STILL = 2.9

const tr = {
  hip: track([
    [0, STAND], [1.72, STAND], [2.08, CROUCH, "sine"], [CATCH, HANG, "out2"],
    [2.9, HANG],
    [3.35, TOP], [3.45, TOP, "lin"], [3.9, HANG, "sine"],
    [4.35, TOP], [4.45, TOP, "lin"], [4.9, HANG, "sine"],
    [5.48, TOP], [5.62, TOP, "lin"], [6.12, HANG, "sine"],
    [6.4, HANG, "lin"], [LAND, STAND, "in2"], [6.88, STAND + 1.2, "out2"], [7.3, STAND], [T, STAND, "lin"],
  ]),
  bar: track([[0, 0], [2.43, 0], [2.47, 1, "lin"], [6.38, 1], [6.42, 0, "lin"], [T, 0]]),
  foot: track([[0, 1], [2.09, 1], [2.14, 0, "lin"], [6.68, 0], [LAND, 1, "lin"], [T, 1]]),
  tuck: track([
    [0, 1], [2.08, 1], [2.24, 0.8, "out2"], [CATCH, 0.96], [2.75, 1],
    [2.9, 1], [3.35, 0.9], [3.45, 0.9], [3.9, 1], [4.35, 0.9], [4.45, 0.9], [4.9, 1],
    [5.48, 0.88], [5.62, 0.88], [6.12, 1], [6.4, 1], [6.55, 0.9, "out2"], [6.68, 1], [T, 1],
  ]),
  spread: track([[0, 1], [2.08, 1], [2.24, 1.25, "out2"], [2.6, 1], [6.4, 1], [6.55, 1.2, "out2"], [6.68, 1], [T, 1]]),
  angL: track([
    [0, REST], [0.9, REST], [1.72, OVER], [1.95, -45], [2.3, OVER, "out2"],
    [6.4, OVER], [6.62, -55, "out2"], [7.2, REST], [T, REST],
  ]),
  angR: track([
    [0, REST], [0.95, REST], [1.76, OVER], [1.97, -45], [2.31, OVER, "out2"],
    [6.4, OVER], [6.62, -55, "out2"], [7.26, REST], [T, REST],
  ]),
}

// Balancier des jambes après la prise de barre + léger roulis pendant les reps
function legSwing(t: number) {
  if (t < CATCH || t > 6.45) return 0
  const u = t - CATCH
  return (
    0.7 * Math.exp(-3 * u) * Math.sin(2 * Math.PI * 1.5 * u) +
    (t > 2.9 && t < 6.12 ? 0.18 * Math.sin((2 * Math.PI * (t - 2.9)) / 1.05) : 0)
  )
}

// ---- Barre élastique (ressort sous-amorti, intégré en temps d'animation) ---
function sagTarget(t: number) {
  const h = 0.004
  const ay = (tr.hip(t + h) - 2 * tr.hip(t) + tr.hip(Math.max(0, t - h))) / (h * h)
  return tr.bar(t) * (0.14 + clamp(-ay * 0.0005, -0.1, 0.22))
}

interface Spring {
  x: number
  v: number
}
function stepSpring(spring: Spring, t0: number, t1: number) {
  const H = 1 / 480
  for (let t = t0; t < t1; t += H) {
    const dt = Math.min(H, t1 - t)
    const acc = -420 * (spring.x - sagTarget(t % T)) - 9 * spring.v
    spring.v += acc * dt
    spring.x += spring.v * dt
  }
}

// ---- Pose complète à l'instant t ------------------------------------------
function computePose(t: number, sag: number, swingOn = true) {
  const bw = tr.bar(t)
  const fw = tr.foot(t)
  const gripY = BAR_Y + SAG_AT_GRIP * sag
  const hipY = tr.hip(t) + bw * SAG_AT_GRIP * sag
  const N = hipY - TL

  const arms = [-1, 1].map((side) => {
    const root = { x: 12 + side * ARM_X, y: N + ARM_DY }
    const a = (side < 0 ? tr.angL : tr.angR)(t) * D2R
    const free = { x: root.x + side * Math.cos(a) * ARM, y: root.y + Math.sin(a) * ARM }
    const grip = { x: 12 + side * GRIP, y: gripY }
    let target = lerp(free, grip, bw)
    // Flexion minimale : plus le bras monte au-dessus de l'horizontale, plus sa portée est bridée.
    const dx = target.x - root.x
    const dy = target.y - root.y
    const d = Math.hypot(dx, dy)
    const up = smooth((30 - Math.atan2(dy, dx * side) / D2R) / 40)
    const cap = ARM * (1 - (1 - REACH_UP) * up)
    if (d > cap) target = { x: root.x + (dx / d) * cap, y: root.y + (dy / d) * cap }
    const k = ik(root, target, UPPER, FORE, { x: side * 0.5, y: 1 })
    return [root, k.mid, k.end]
  })

  const swing = swingOn ? legSwing(t) : 0
  const tuck = tr.tuck(t)
  const spread = tr.spread(t)
  const legs = [-1, 1].map((side) => {
    const root = { x: 12 + side * LEG_X, y: hipY }
    const air = { x: 12 + side * FOOT_X * spread + swing, y: hipY + LEG_DY * tuck }
    const ground = { x: 12 + side * FOOT_X, y: GROUND }
    const k = ik(root, lerp(air, ground, fw), THIGH, SHIN, { x: side, y: 0 })
    return [root, k.mid, k.end]
  })

  const alt = clamp((STAND - tr.hip(t)) / (STAND - TOP), 0, 1)
  return { t, sag, bw, N, hipY, head: { x: 12, y: N - HEAD_OFF }, arms, legs, alt }
}
type Pose = ReturnType<typeof computePose>

// ---- Construction d'une instance SVG ---------------------------------------
/** Cadre de l'animation complète (sol et ombre compris). */
export const LOGO_VIEWBOX = "-1 -2 26 34.5"
/** Cadre serré, presque carré, de la pose fixe (suspendu à la barre). */
export const LOGO_STILL_VIEWBOX = "0.5 1.5 23 23.5"

function buildRig(svg: SVGSVGElement, { fg, bg }: Colors, still: boolean) {
  const { gooFilter } = setupSvg(svg, still ? LOGO_STILL_VIEWBOX : LOGO_VIEWBOX)
  const fill = (w: number) => ({ stroke: fg, "stroke-width": w })
  const shadow = el(svg, "ellipse", { cx: 12, cy: GROUND + 2.05, ry: 0.55, fill: fg, display: still ? "none" : "inline" })

  // 1. Silhouette d'un seul bloc : jambes + torse + bras, fusionnés par le filtre « gooey »
  //    qui arrondit tous les raccords : aisselles, hanches, coudes, genoux.
  const body = el(svg, "g", { filter: gooFilter })
  const legF = [el(body, "path", fill(LW)), el(body, "path", fill(LW))]
  const torsoF = el(body, "path", fill(TW))
  const armF = [el(body, "path", fill(AW)), el(body, "path", fill(AW))]

  // 2. Tête (détachée du corps)
  const headK = el(svg, "circle", { r: HR + GAP, fill: bg })
  const headF = el(svg, "circle", { r: HR, fill: fg })

  // 3. Barre devant le personnage
  const barK = el(svg, "path", { stroke: bg, "stroke-width": BAR_W + 2 * GAP })
  const bar = el(svg, "path", fill(BAR_W))

  // 4. Poings refermés devant la barre (visibles seulement quand il tient la barre)
  const fists = [0, 1].map(() => {
    const g = el(svg, "g", {})
    return { g, k: el(g, "circle", { r: FIST + GAP, fill: bg }), f: el(g, "circle", { r: FIST, fill: fg }) }
  })

  const fx = el(svg, "g", { stroke: fg, "stroke-width": 0.9 })
  const sparks = Array.from({ length: 10 }, () => el(fx, "line", {}))
  return { shadow, legF, torsoF, armF, headK, headF, barK, bar, fists, sparks }
}
type Rig = ReturnType<typeof buildRig>

function renderRig(R: Rig, P: Pose) {
  R.shadow.setAttribute("rx", (4.2 - 2.2 * P.alt).toFixed(3))
  R.shadow.setAttribute("opacity", (0.1 - 0.06 * P.alt).toFixed(3))
  for (let i = 0; i < 2; i++) {
    R.legF[i].setAttribute("d", pts(P.legs[i]))
    const hand = P.arms[i][2]
    R.armF[i].setAttribute("d", pts(P.arms[i]))
    const fist = R.fists[i]
    fist.g.setAttribute("opacity", P.bw.toFixed(3))
    for (const c of [fist.k, fist.f]) {
      c.setAttribute("cx", hand.x.toFixed(3))
      c.setAttribute("cy", hand.y.toFixed(3))
    }
  }
  R.torsoF.setAttribute("d", `M12 ${P.N.toFixed(3)}L12 ${P.hipY.toFixed(3)}`)
  for (const c of [R.headK, R.headF]) {
    c.setAttribute("cx", String(P.head.x))
    c.setAttribute("cy", P.head.y.toFixed(3))
  }
  const barD = `M${BAR_X0} ${BAR_Y}Q12 ${(BAR_Y + 2 * P.sag).toFixed(3)} ${BAR_X1} ${BAR_Y}`
  R.barK.setAttribute("d", barD)
  R.bar.setAttribute("d", barD)

  // Effets : éclat à la prise de barre, poussière à l'atterrissage
  const gy = BAR_Y + SAG_AT_GRIP * P.sag
  const n = burst(R.sparks, P.t, CATCH, 0.32, [
    { x: 12 - GRIP, y: gy, r: 2.1, angles: [-160, -125, -90] },
    { x: 12 + GRIP, y: gy, r: 2.1, angles: [-20, -55, -90] },
  ])
  burst(R.sparks.slice(n), P.t, LAND, 0.4, [
    { x: 12 - FOOT_X, y: GROUND + 1.0, r: 1.5, angles: [190, 210] },
    { x: 12 + FOOT_X, y: GROUND + 1.0, r: 1.5, angles: [-10, -30] },
  ])
}

/** Fin de chaque traction (suspendu, bras quasi tendus) : points d'arrêt possibles au survol. */
const REP_ENDS = [3.9, 4.9, 6.12]

/**
 * Monte le logo dans un `<svg>` vide.
 * - par défaut : boucle complète (saut, trois tractions, descente) ;
 * - `still` : pose fixe suspendue à la barre, dans un cadre serré ; `hover(true)` y joue les tractions
 *   (elles bouclent sans à-coup : la pose à 6.12 s est celle de 2.9 s).
 */
function mountLogoRig(svg: SVGSVGElement, colors: Colors, { still = false } = {}) {
  const rig = buildRig(svg, colors, still)
  const spring: Spring = { x: 0, v: 0 }
  return playRig(svg, {
    still,
    loop: T,
    stillAt: LOGO_STILL,
    repEnds: REP_ENDS,
    // En pose fixe, pas de balancier des jambes : silhouette symétrique et boucle de tractions propre.
    draw: (t) => renderRig(rig, computePose(t, spring.x, !still)),
    step: (t0, t1) => stepSpring(spring, t0, t1),
    // Barre calée au repos : on retombe exactement sur la pose fixe.
    reset: (t) => {
      spring.x = sagTarget(t)
      spring.v = 0
    },
  })
}

/** Bonhomme à la barre de traction. */
export const TRACTIONS_RIG: RigDefinition = {
  viewBox: LOGO_VIEWBOX,
  stillViewBox: LOGO_STILL_VIEWBOX,
  mount: mountLogoRig,
}
