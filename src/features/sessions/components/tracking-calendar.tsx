import { useMemo, useState } from "react"

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { addDays, formatLong, formatMonth, startOfToday, toIso } from "@/lib/dates"
import type { Availability } from "@/lib/program"
import { cn } from "@/lib/utils"
import type { Program } from "@/types/program"

const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]

type MarkKind = "done" | "plan"

interface CalendarCell {
  date: Date
  inMonth: boolean
  isToday: boolean
  mark?: { kind: MarkKind; label: string }
}

function buildCells(program: Program, availability: Availability, monthShift: number): { month: Date; cells: CalendarCell[] } {
  const today = startOfToday()
  const month = new Date(today.getFullYear(), today.getMonth() + monthShift, 1)

  const marks = new Map<string, { kind: MarkKind; label: string }>()
  program.done.slice(0, availability.nextIndex).forEach((d, i) => marks.set(d.date, { kind: "done", label: `S${i + 1}` }))
  const nextDay = toIso(availability.resting ? availability.availableFrom : today)
  if (!marks.has(nextDay)) {
    marks.set(nextDay, {
      kind: "plan",
      label: availability.cycleDone ? "Test" : `S${availability.nextIndex + 1}`,
    })
  }

  // La grille commence le lundi de la semaine du 1er du mois : 6 semaines affichées.
  const first = addDays(month, -((month.getDay() + 6) % 7))
  const todayIso = toIso(today)
  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = addDays(first, i)
    const iso = toIso(date)
    return { date, inMonth: date.getMonth() === month.getMonth(), isToday: iso === todayIso, mark: marks.get(iso) }
  })

  return { month, cells }
}

function cellAria(cell: CalendarCell): string {
  const suffix =
    cell.mark?.kind === "done" ? ", séance faite" : cell.mark?.kind === "plan" ? ", prochaine séance possible" : ""
  return formatLong(cell.date) + suffix
}

interface TrackingCalendarProps {
  program: Program
  availability: Availability
}

/** Calendrier de suivi : séances faites, prochaine séance possible et aujourd'hui. */
export function TrackingCalendar({ program, availability }: TrackingCalendarProps) {
  const [monthShift, setMonthShift] = useState(0)
  const { month, cells } = useMemo(
    () => buildCells(program, availability, monthShift),
    [program, availability, monthShift],
  )

  return (
    <Card id="calendrier" className="flex min-w-0 flex-[999_1_610px] scroll-mt-6 flex-col gap-3.5 p-4 md:p-5">
      <div className="flex items-center justify-between gap-2.5">
        <CardTitle className="text-lg font-bold tracking-[-0.01em]">Calendrier de suivi</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="muted" size="icon-sm" aria-label="Mois précédent" onClick={() => setMonthShift((m) => m - 1)}>
            <ChevronLeftIcon size={18} strokeWidth={2.2} />
          </Button>
          <span aria-live="polite" className="min-w-32 text-center text-sm font-semibold">
            {formatMonth(month)}
          </span>
          <Button variant="muted" size="icon-sm" aria-label="Mois suivant" onClick={() => setMonthShift((m) => m + 1)}>
            <ChevronRightIcon size={18} strokeWidth={2.2} />
          </Button>
        </div>
      </div>

      <div aria-hidden="true" className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell) => {
          const kind = cell.mark?.kind
          return (
            <div
              key={toIso(cell.date)}
              aria-label={cellAria(cell)}
              className="flex h-[60px] flex-col items-center justify-center gap-[3px]"
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 text-[13px] tabular-nums",
                  cell.isToday ? "font-bold" : "font-medium",
                  kind === "done" && "border-transparent bg-primary text-primary-foreground",
                  kind === "plan" && "border-dashed border-primary",
                  !kind && (cell.isToday ? "border-foreground" : "border-transparent"),
                  kind !== "done" && (cell.inMonth ? "text-foreground" : "text-faint"),
                )}
              >
                {cell.date.getDate()}
              </span>
              <span
                className={cn(
                  "h-[13px] text-[11px] leading-[13px] font-semibold",
                  kind ? "text-primary" : cell.isToday ? "text-foreground" : "text-transparent",
                )}
              >
                {cell.mark?.label ?? (cell.isToday ? "Auj." : "")}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-surface-2 pt-2.5 text-xs text-subtle">
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-full bg-primary" />
          Séance faite
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-full border-2 border-dashed border-primary" />
          Prochaine séance possible
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-full border-2 border-foreground" />
          Aujourd'hui
        </span>
      </div>
    </Card>
  )
}
