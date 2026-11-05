import { cn } from "@/lib/utils"

interface ProgressRingProps {
  /** Progression entre 0 et 1. */
  value: number
  /** Taille de la zone de dessin (unités du viewBox). */
  viewBox: number
  radius: number
  strokeWidth: number
  className?: string
}

/** Anneau de progression (piste #3A3A3C, arc vert), départ à midi. */
export function ProgressRing({ value, viewBox, radius, strokeWidth, className }: ProgressRingProps) {
  const circumference = 2 * Math.PI * radius
  const center = viewBox / 2
  const clamped = Math.max(0, Math.min(1, value))

  return (
    <svg viewBox={`0 0 ${viewBox} ${viewBox}`} aria-hidden="true" className={cn("flex-none -rotate-90", className)}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped)}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  )
}
