/* ==========================================================================
   Hisse — rig vectoriel animé du bonhomme qui fait des pompes.
   Même personnage que le logo des tractions (tête pleine, membres en capsules,
   silhouette « gooey », séparations knockout), vu de profil : il pose les mains,
   saute en planche, enchaîne trois pompes puis se relève.
   Chaque instant est une pose (cheville, hanche, inclinaison du torse, main),
   interpolée entre des poses clés ; genou et coude en cinématique inverse.
   ========================================================================== */

import {
  AW,
  burst,
  D2R,
  el,
  EASE,
  GAP,
  HEAD_OFF,
  HR,
  ik,
  LW,
  playRig,
  pts,
  setupSvg,
  TL,
  TW,
  type Colors,
  type Ease,
  type Point,
  type RigDefinition,
} from "@/lib/rig-kit"

// ---- Gabarit ------------------------------------------------------------------
// Bras un peu plus courts que pour les tractions : avec les bras de 9, la planche
// serait inclinée à 45° et ressemblerait à des pompes sur un banc.
const UPPER = 3.6
const FORE = 3.6
const ARM = UPPER + FORE
const REACH = 0.97 * ARM // bras tendus, coude jamais tout à fait verrouillé
const ARM_DY = 0.3 // attache de l'épaule, sous le haut du torse
const THIGH = 3.4
const SHIN = 3.4
const LEG = THIGH + SHIN

// ---- Sol et repères (le bonhomme regarde vers la droite) ----------------------
const FLOOR = 25 // surface du sol
const FOOT_Y = FLOOR - LW / 2 // cheville debout (bout rond posé au sol)
const TOE_Y = FLOOR - 1.8 // cheville en planche, sur la pointe des pieds
const HAND_Y = FLOOR - AW / 2 // main à plat au sol
const STAND_X = 12
const TOE_X = 4.6 // pointe des pieds en planche
const BODY = LEG + TL - ARM_DY // cheville -> épaule, corps gainé

interface Pose {
  /** Cheville. */
  foot: Point
  /** Hanche. */
  hip: Point
  /** Direction hanche -> cou (degrés, repère écran : -90 = vers le haut). */
  torso: number
  /** Cible de la main. */
  hand: Point
  /** Tête relevée par rapport à l'axe du torse (degrés). */
  nod: number
}

/** Planche de corps gainé, inclinée de `angle` degrés, appuyée sur la pointe des pieds. */
function plank(angle: number, hand: Point, nod: number): Pose {
  const a = -angle * D2R
  const foot = { x: TOE_X, y: TOE_Y }
  return {
    foot,
    hip: { x: foot.x + Math.cos(a) * LEG * 0.995, y: foot.y + Math.sin(a) * LEG * 0.995 },
    torso: -angle,
    hand,
    nod,
  }
}
const shoulderOf = (angle: number): Point => ({
  x: TOE_X + Math.cos(-angle * D2R) * BODY,
  y: TOE_Y + Math.sin(-angle * D2R) * BODY,
})

// Haut de la pompe : bras tendus, main juste devant l'épaule.
const TOP_ANGLE = Math.asin((TOE_Y - (HAND_Y - REACH * 0.995)) / BODY) / D2R
const HAND: Point = { x: shoulderOf(TOP_ANGLE).x + 0.3, y: HAND_Y }
// Bas de la pompe : la poitrine frôle le sol.
const BOTTOM_ANGLE = Math.asin((TOE_Y - (FLOOR - TW / 2 - 0.55)) / BODY) / D2R

const POSES = {
  stand: {
    foot: { x: STAND_X, y: FOOT_Y },
    hip: { x: STAND_X, y: FOOT_Y - LEG * 0.995 },
    torso: -90,
    // Bras le long du corps, main un peu en avant pour qu'il se détache du torse.
    hand: { x: STAND_X + 1.6, y: FOOT_Y - LEG * 0.995 - TL + ARM_DY + REACH * 0.94 },
    nod: 0,
  },
  // Accroupi, mains posées au sol à l'endroit de la planche.
  crouch: {
    foot: { x: STAND_X, y: FOOT_Y },
    hip: { x: STAND_X - 1.6, y: FOOT_Y - 3.7 },
    torso: -36,
    hand: HAND,
    nod: 14,
  },
  top: plank(TOP_ANGLE, HAND, 16),
  bottom: plank(BOTTOM_ANGLE, HAND, 20),
} satisfies Record<string, Pose>
type PoseName = keyof typeof POSES

// ---- Chronologie ---------------------------------------------------------------
/** Durée de la boucle (s). */
const T = 8.0
const KICK = 2.3 // pieds posés en planche
const TUCK = 6.5 // pieds ramenés sous le corps
/** Pose fixe et début des pompes au survol : planche, bras tendus. */
const STILL = 2.7
/** Fin de chaque pompe (retour bras tendus) : points d'arrêt possibles au survol. */
const REP_ENDS = [3.8, 4.9, 6.0]

type PoseKey = [time: number, pose: PoseName, ease?: Ease]
const KEYS: PoseKey[] = [
  [0, "stand"],
  [0.9, "stand"],
  [1.75, "crouch", "io"],
  [1.9, "crouch"],
  [KICK, "top", "out2"],
  [STILL, "top", "lin"],
  ...REP_ENDS.flatMap((end): PoseKey[] => [
    [end - 0.6, "bottom", "sine"],
    [end - 0.52, "bottom", "lin"],
    [end - 0.12, "top", "io"],
    [end, "top", "lin"],
  ]),
  [6.12, "top"],
  [TUCK, "crouch", "out2"],
  [6.7, "crouch"],
  [7.5, "stand", "io"],
  [T, "stand"],
]

const mix = (a: number, b: number, w: number) => a + (b - a) * w
const mixPoint = (a: Point, b: Point, w: number): Point => ({ x: mix(a.x, b.x, w), y: mix(a.y, b.y, w) })

function poseAt(t: number): Pose {
  let i = 1
  while (i < KEYS.length - 1 && t > KEYS[i][0]) i++
  const [t0, p0] = KEYS[i - 1]
  const [t1, p1, ease = "io"] = KEYS[i]
  const w = EASE[ease](Math.min(1, Math.max(0, t1 > t0 ? (t - t0) / (t1 - t0) : 1)))
  const a = POSES[p0]
  const b = POSES[p1]
  const foot = mixPoint(a.foot, b.foot, w)
  const hip = mixPoint(a.hip, b.hip, w)
  // Sauts (en planche et retour) : les pieds décollent et les hanches montent, jambes presque tendues.
  if (a.foot.x !== b.foot.x) {
    const hop = Math.sin(Math.PI * w)
    foot.y -= 1.4 * hop
    hip.y -= 2.2 * hop
  }
  return {
    foot,
    hip,
    torso: mix(a.torso, b.torso, w),
    hand: mixPoint(a.hand, b.hand, w),
    nod: mix(a.nod, b.nod, w),
  }
}

function computePose(t: number) {
  const p = poseAt(t)
  const dir = { x: Math.cos(p.torso * D2R), y: Math.sin(p.torso * D2R) }
  const neck = { x: p.hip.x + dir.x * TL, y: p.hip.y + dir.y * TL }
  const shoulder = { x: neck.x - dir.x * ARM_DY, y: neck.y - dir.y * ARM_DY }
  const headA = (p.torso - p.nod) * D2R
  const head = { x: neck.x + Math.cos(headA) * HEAD_OFF, y: neck.y + Math.sin(headA) * HEAD_OFF }
  // Coude vers l'arrière (et vers le haut en bas de pompe), genou vers l'avant.
  const arm = ik(shoulder, p.hand, UPPER, FORE, { x: -1, y: -0.4 })
  const leg = ik(p.hip, p.foot, THIGH, SHIN, { x: 1, y: -0.2 })
  return {
    t,
    neck,
    hip: p.hip,
    head,
    arm: [shoulder, arm.mid, arm.end],
    leg: [p.hip, leg.mid, leg.end],
  }
}
type Frame = ReturnType<typeof computePose>

// ---- Construction d'une instance SVG -------------------------------------------
/** Cadre de l'animation complète (sol et ombre compris). */
const VIEWBOX = "-1 -1 26 28"
/** Cadre serré de la pose fixe (planche, bras tendus). */
const STILL_VIEWBOX = "2 9.5 21 16"

function buildRig(svg: SVGSVGElement, { fg, bg }: Colors, still: boolean) {
  const { gooFilter } = setupSvg(svg, still ? STILL_VIEWBOX : VIEWBOX)
  const fill = (w: number) => ({ stroke: fg, "stroke-width": w })
  const shadow = el(svg, "ellipse", { cy: FLOOR + 0.7, ry: 0.55, fill: fg, opacity: 0.08, display: still ? "none" : "inline" })

  // 1. Silhouette d'un seul bloc : jambe + torse, raccords arrondis par le filtre « gooey ».
  const body = el(svg, "g", { filter: gooFilter })
  const legF = el(body, "path", fill(LW))
  const torsoF = el(body, "path", fill(TW))

  // 2. Bras devant le corps, détouré de la couleur du fond (il passe devant le torse).
  //    Le détourage part un peu après l'épaule pour que le bras reste soudé au corps.
  const armK = el(svg, "path", { stroke: bg, "stroke-width": AW + 2 * GAP })
  const armF = el(svg, "path", fill(AW))

  // 3. Tête (détachée du corps)
  const headK = el(svg, "circle", { r: HR + GAP, fill: bg })
  const headF = el(svg, "circle", { r: HR, fill: fg })

  const fx = el(svg, "g", { stroke: fg, "stroke-width": 0.9 })
  const sparks = Array.from({ length: 8 }, () => el(fx, "line", {}))
  return { shadow, legF, torsoF, armK, armF, headK, headF, sparks }
}
type Rig = ReturnType<typeof buildRig>

function renderRig(R: Rig, F: Frame) {
  const xs = [F.leg[2].x, F.arm[2].x, F.head.x + HR, F.leg[2].x - LW / 2]
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  R.shadow.setAttribute("cx", ((x0 + x1) / 2).toFixed(3))
  R.shadow.setAttribute("rx", ((x1 - x0) / 2 + 0.6).toFixed(3))

  R.legF.setAttribute("d", pts(F.leg))
  R.torsoF.setAttribute("d", pts([F.hip, F.neck]))
  R.armF.setAttribute("d", pts(F.arm))
  const [s, e] = F.arm
  const k = Math.min(1, (TW / 2 + GAP) / UPPER)
  R.armK.setAttribute("d", pts([{ x: s.x + (e.x - s.x) * k, y: s.y + (e.y - s.y) * k }, e, F.arm[2]]))
  for (const c of [R.headK, R.headF]) {
    c.setAttribute("cx", F.head.x.toFixed(3))
    c.setAttribute("cy", F.head.y.toFixed(3))
  }

  // Poussière quand les pieds touchent le sol : en planche, puis de retour sous le corps.
  const n = burst(R.sparks, F.t, KICK, 0.4, [{ x: TOE_X - 0.3, y: FLOOR - 0.4, r: 1.3, angles: [185, 205, 225, -20] }])
  burst(R.sparks.slice(n), F.t, TUCK, 0.4, [
    { x: STAND_X - 0.6, y: FLOOR - 0.4, r: 1.4, angles: [190, 210] },
    { x: STAND_X + 0.6, y: FLOOR - 0.4, r: 1.4, angles: [-10, -30] },
  ])
}

/**
 * Monte le bonhomme des pompes dans un `<svg>` vide.
 * - par défaut : boucle complète (mains au sol, planche, trois pompes, retour debout) ;
 * - `still` : planche bras tendus, dans un cadre serré ; `hover(true)` y joue les pompes.
 */
function mountPushupRig(svg: SVGSVGElement, colors: Colors, { still = false } = {}) {
  const rig = buildRig(svg, colors, still)
  return playRig(svg, {
    still,
    loop: T,
    stillAt: STILL,
    repEnds: REP_ENDS,
    draw: (t) => renderRig(rig, computePose(t)),
  })
}

/** Bonhomme qui fait des pompes. */
export const POMPES_RIG: RigDefinition = {
  viewBox: VIEWBOX,
  stillViewBox: STILL_VIEWBOX,
  mount: mountPushupRig,
}
