import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type SetDotState = "done" | "active" | "pending"

interface SetDotProps {
  state: SetDotState
  children: ReactNode
  className?: string
}

/** Pastille numérotée d'une série : pleine si faite, cerclée de vert si active, grise sinon. */
export function SetDot({ state, children, className }: SetDotProps) {
  return (
    <span
      className={cn(
        "flex flex-none items-center justify-center rounded-full border-2 font-semibold",
        state === "done" && "border-transparent bg-primary text-primary-foreground",
        state === "active" && "border-primary bg-transparent text-foreground",
        state === "pending" && "border-surface-3 bg-transparent text-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}
