import type { ReactNode } from "react"

import { ArcIcon, BarsIcon, StopwatchIcon } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { useExercise } from "@/hooks/use-exercise"

interface Feature {
  icon: ReactNode
  title: string
  description: string
}

const features = (progress: string): Feature[] => [
  {
    icon: <BarsIcon className="size-8 md:size-[38px]" />,
    title: "Un programme à ta mesure",
    description: "Entre ton max actuel : on calcule ton niveau et tes séries.",
  },
  {
    icon: <StopwatchIcon className="size-[34px] md:size-10" />,
    title: "Des séances guidées",
    description: "Tes séries du jour et un minuteur pour chaque repos.",
  },
  {
    icon: <ArcIcon strokeWidth={2.6} className="size-[34px] md:size-[42px]" />,
    title: "Suis ta progression",
    description: progress,
  },
]

/** Les trois promesses de l'écran d'accueil. */
export function FeatureList() {
  const exercise = useExercise()

  return (
    <Card className="flex flex-col gap-4 p-4 md:gap-5 md:p-5">
      {features(exercise.copy.progress).map((f) => (
        <div key={f.title} className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-8 flex-none items-center justify-center text-primary md:h-12 md:w-9">{f.icon}</div>
          <div className="flex flex-col gap-[3px] md:gap-1">
            <h2 className="m-0 font-display text-base font-semibold">{f.title}</h2>
            <p className="m-0 text-[13px] leading-[1.45] text-muted-foreground">
              {f.description}
            </p>
          </div>
        </div>
      ))}
    </Card>
  )
}
