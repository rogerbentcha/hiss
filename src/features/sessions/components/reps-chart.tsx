import { useState } from "react"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SessionView } from "@/features/sessions/session-view"

const CHART_HEIGHT = 200

interface RepsChartProps {
  sessions: SessionView[]
  /** Barre mise en avant par défaut (la prochaine séance). */
  defaultIndex: number
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-[3px]", className)} />
      {label}
    </span>
  )
}

/** Histogramme « Tractions par séance » : réalisé (vert) vs prévu (gris), interactif au survol. */
export function RepsChart({ sessions, defaultIndex }: RepsChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const active = hover ?? Math.min(defaultIndex, sessions.length - 1)

  const top = Math.ceil((Math.max(...sessions.map((s) => s.total)) * 1.15) / 10) * 10
  const current = sessions[active]
  const readout = current.reps
    ? `Séance ${current.number} : ${current.total} tractions réalisées, ${current.plannedTotal} prévues`
    : `Séance ${current.number} : ${current.plannedTotal} tractions prévues au minimum`

  return (
    <Card className="flex min-w-0 flex-[999_1_610px] flex-col gap-4 p-4 md:p-5">
      <CardHeader>
        <CardTitle>Tractions par séance</CardTitle>
        <div className="flex gap-3.5 text-xs text-subtle">
          <LegendSwatch className="bg-primary" label="Réalisé" />
          <LegendSwatch className="bg-planned" label="Prévu" />
        </div>
      </CardHeader>

      <p aria-live="polite" className="m-0 min-h-5 text-[13px] text-foreground">
        {readout}
      </p>

      <div className="flex gap-2.5">
        <div
          aria-hidden="true"
          className="flex w-7 flex-col items-end justify-between text-xs text-muted-foreground tabular-nums"
          style={{ height: CHART_HEIGHT }}
        >
          <span className="-translate-y-1/2">{top}</span>
          <span>{top / 2}</span>
          <span className="translate-y-1/2">0</span>
        </div>

        <div className="flex min-w-0 flex-auto flex-col gap-2.5">
          <div className="relative" style={{ height: CHART_HEIGHT }}>
            <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-surface-2" />
            <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-surface-2" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-surface-3" />
            <div className="absolute inset-0 flex items-end gap-2.5 px-2">
              {sessions.map((s) => {
                const done = s.reps !== null
                return (
                  <button
                    key={s.index}
                    type="button"
                    aria-label={`Séance ${s.number} : ${s.total} tractions ${done ? "réalisées" : "prévues"}`}
                    onMouseEnter={() => setHover(s.index)}
                    onFocus={() => setHover(s.index)}
                    onClick={() => setHover(s.index)}
                    className="flex h-full min-w-0 flex-1 cursor-pointer items-end justify-center border-0 bg-transparent p-0"
                  >
                    <span
                      className={cn(
                        "block w-full max-w-11 rounded-t-md rounded-b-[2px] transition-[height,box-shadow] duration-200",
                        done ? "bg-primary" : "bg-planned",
                        s.index === active && "shadow-[0_0_0_2px_var(--card),0_0_0_4px_var(--foreground)]",
                      )}
                      style={{ height: Math.max(4, Math.round((s.total / top) * CHART_HEIGHT)) }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
          <div aria-hidden="true" className="flex gap-2.5 px-2">
            {sessions.map((s) => (
              <span key={s.index} className="min-w-0 flex-1 text-center text-xs text-muted-foreground">
                S{s.number}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
