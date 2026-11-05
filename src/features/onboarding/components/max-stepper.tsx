import { useId } from "react"

import { MinusIcon, PlusIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { clampReps, MAX_REPS } from "@/lib/program"

interface MaxStepperProps {
  value: number
  onChange: (value: number) => void
}

/** Saisie du max : grand champ numérique encadré des boutons − / +. */
export function MaxStepper({ value, onChange }: MaxStepperProps) {
  const id = useId()

  return (
    <>
      <label htmlFor={id} className="text-center text-sm font-medium text-muted-foreground">
        Ton max actuel
      </label>
      <div className="flex items-center gap-2.5 md:gap-3.5">
        <Button
          type="button"
          variant="muted"
          size="icon"
          aria-label="Une traction de moins"
          className="size-[46px] md:size-12"
          onClick={() => onChange(clampReps(value - 1))}
        >
          <MinusIcon size={22} strokeWidth={2.2} />
        </Button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_REPS}
          value={value}
          onChange={(e) => onChange(clampReps(parseInt(e.target.value, 10)))}
          onFocus={(e) => e.target.select()}
          className="m-0 w-full min-w-0 flex-auto border-0 bg-transparent p-0 text-center font-display text-[56px] leading-none font-bold tracking-[-0.01em] text-foreground tabular-nums md:text-[64px]"
        />
        <Button
          type="button"
          size="icon"
          aria-label="Une traction de plus"
          className="size-[46px] md:size-12"
          onClick={() => onChange(clampReps(value + 1))}
        >
          <PlusIcon size={22} strokeWidth={2.2} />
        </Button>
      </div>
    </>
  )
}
