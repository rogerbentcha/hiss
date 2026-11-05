import { CheckIcon, MinusIcon, PlusIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { formatTarget, isLastSet, SETS_PER_SESSION } from "@/lib/program"

interface CurrentSetCardProps {
  current: number
  target: number
  value: number
  resting: boolean
  allDone: boolean
  totalReps: number
  onChange: (value: number) => void
  onValidate: () => void
}

/** Carte de la série en cours : cible, compteur de répétitions réalisées et validation. */
export function CurrentSetCard({
  current,
  target,
  value,
  resting,
  allDone,
  totalReps,
  onChange,
  onValidate,
}: CurrentSetCardProps) {
  return (
    <section
      aria-labelledby="serie-title"
      className="surface-card flex min-w-0 flex-[1_1_478px] flex-col gap-4 p-4 md:gap-5 md:p-6"
    >
      {allDone ? (
        <div className="flex flex-col items-center gap-2.5 py-3.5 text-center md:gap-3 md:py-5">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary md:size-[72px]">
            <CheckIcon strokeWidth={2.6} className="size-8 text-primary-foreground md:size-9" />
          </span>
          <h2 id="serie-title" className="m-0 font-display text-lg font-bold">
            Toutes les séries sont faites
          </h2>
          <p className="m-0 text-[13px] text-muted-foreground">
            {totalReps} tractions aujourd'hui. Termine la séance pour l'enregistrer.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-5">
          <div className="flex items-baseline justify-between gap-2.5">
            <h2 id="serie-title" className="m-0 font-display text-lg font-semibold">
              Série {current + 1} sur {SETS_PER_SESSION}
            </h2>
            <span className="text-[13px] text-muted-foreground">
              {isLastSet(current) ? "Dernière série : au maximum" : "Objectif de la série"}
            </span>
          </div>

          <div className="flex items-baseline justify-center gap-2.5 md:gap-2.5">
            <span className="font-display text-[72px] leading-none font-bold tracking-[-0.01em] text-primary tabular-nums md:text-8xl">
              {formatTarget(target, current)}
            </span>
            <span className="text-[17px] text-muted-foreground md:text-lg">tractions</span>
          </div>

          <div className="flex items-center gap-2.5 rounded-[18px] bg-surface-2 p-2.5 md:gap-3.5 md:p-3">
            <Button
              variant="raised"
              size="icon"
              aria-label="Une répétition de moins"
              className="size-[42px]"
              onClick={() => onChange(value - 1)}
            >
              <MinusIcon size={20} strokeWidth={2.2} />
            </Button>
            <div className="flex flex-auto flex-col items-center gap-0.5">
              <span className="text-xs text-subtle">Réalisées</span>
              <span aria-live="polite" className="font-display text-[25px] leading-[1.1] font-bold tabular-nums">
                {value}
              </span>
            </div>
            <Button
              variant="raised"
              size="icon"
              aria-label="Une répétition de plus"
              className="size-[42px]"
              onClick={() => onChange(value + 1)}
            >
              <PlusIcon size={20} strokeWidth={2.2} />
            </Button>
          </div>

          <Button onClick={onValidate} disabled={resting}>
            {resting ? "Repos en cours…" : "Valider la série"}
          </Button>
        </div>
      )}
    </section>
  )
}
