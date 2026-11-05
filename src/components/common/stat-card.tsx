import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: ReactNode
  caption?: ReactNode
  /** Contenu affiché à droite (ex. anneau de progression). */
  aside?: ReactNode
  size?: "lg" | "md"
  valueClassName?: string
  className?: string
}

/** Carte de statistique : libellé gris, grande valeur en Nunito, légende optionnelle ; contenu centré verticalement. */
export function StatCard({ label, value, caption, aside, size = "lg", valueClassName, className }: StatCardProps) {
  const body = (
    <div className={cn("flex flex-col", size === "lg" ? "gap-1.5" : "gap-1")}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-display font-bold tracking-[-0.01em] tabular-nums",
          size === "lg" ? "text-[25px] leading-[1.05] md:text-[30px]" : "text-[22px]",
          valueClassName,
        )}
      >
        {value}
      </span>
      {caption && <span className="text-[13px] text-muted-foreground">{caption}</span>}
    </div>
  )

  return (
    <Card
      className={cn(
        "flex items-center p-3.5",
        size === "lg" ? "md:px-5 md:py-4" : "md:px-4 md:py-4",
        aside && "justify-between gap-2.5",
        className,
      )}
    >
      {body}
      {aside}
    </Card>
  )
}
