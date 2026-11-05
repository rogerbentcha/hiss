import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/program"
import type { SessionStatus } from "@/types/program"

const VARIANTS = {
  done: "secondary",
  available: "default",
  resting: "outline",
  locked: "outline",
} as const

/** Pastille d'état d'une séance : Faite, Disponible, En repos, À venir. */
export function StatusBadge({ status }: { status: SessionStatus }) {
  return <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}
