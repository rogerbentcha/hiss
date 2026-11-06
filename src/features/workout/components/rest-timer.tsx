import { CloseIcon, PauseFilledIcon, PlayFilledIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { formatClock } from "@/lib/dates"
import { formatRest } from "@/lib/program"

interface RestTimerProps {
  left: number
  running: boolean
  /** Libellé d'état : « Repos », « Prêt pour la série » ou « Minuteur ». */
  label: string
  onTogglePause: () => void
  onSkip: () => void
  onMinus15: () => void
  onPlus30: () => void
  /** Repos prévu entre deux séries, en secondes. */
  rest: number
}

/** Minuteur de repos en pilule : lecture/pause, arrêt, temps restant et ajustements. */
export function RestTimer({ left, running, label, onTogglePause, onSkip, onMinus15, onPlus30, rest }: RestTimerProps) {
  const pauseLabel = running
    ? "Mettre le repos en pause"
    : left > 0
      ? "Reprendre le repos"
      : `Lancer ${formatRest(rest)} de repos`

  return (
    <section aria-label="Minuteur de repos" className="flex flex-col items-center gap-2.5 md:gap-3">
      <div className="surface-card flex h-[108px] w-full max-w-[680px] items-center gap-2.5 rounded-[54px] pr-5 pl-3 md:h-[148px] md:gap-3.5 md:rounded-[74px] md:pr-9 md:pl-7">
        <Button variant="tonal" size="icon-lg" aria-label={pauseLabel} onClick={onTogglePause}>
          {running ? <PauseFilledIcon size={28} /> : <PlayFilledIcon size={28} />}
        </Button>
        <Button variant="muted" size="icon-lg" aria-label="Arrêter le repos" onClick={onSkip}>
          <CloseIcon size={28} strokeWidth={2.4} />
        </Button>
        <div className="flex min-w-0 flex-auto flex-col items-end gap-0.5 text-primary md:flex-row md:items-baseline md:justify-end md:gap-3">
          <span className="font-display text-sm font-semibold whitespace-nowrap md:text-[22px]">{label}</span>
          <span role="timer" className="font-display text-[42px] leading-none font-light tabular-nums md:text-[76px]">
            {formatClock(left)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={onMinus15}>
          −15 s
        </Button>
        <Button variant="secondary" size="sm" onClick={onPlus30}>
          +30 s
        </Button>
      </div>
    </section>
  )
}
