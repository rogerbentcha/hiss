import { capitalize, formatShort, parseIso } from "@/lib/dates"
import type { Exercise } from "@/lib/exercises"
import { getSessionStatus, sum, type Availability } from "@/lib/program"
import type { Program, SessionPlan, SessionStatus } from "@/types/program"

/** Modèle d'affichage d'une séance dans la liste « Les séances ». */
export interface SessionView {
  index: number
  number: number
  status: SessionStatus
  plan: number[]
  reps: number[] | null
  /** Total réalisé si faite, total prévu sinon. */
  total: number
  plannedTotal: number
  headline: string
  sub: string | null
}

export function buildSessionViews(
  exercise: Exercise,
  program: Program,
  sessions: SessionPlan[],
  availability: Availability,
): SessionView[] {
  return sessions.map(({ sets: plan }, index) => {
    const status = getSessionStatus(program, index, availability)
    const done = program.done[index]
    const plannedTotal = sum(plan)
    const isNext = index === availability.nextIndex

    let sub: string | null = null
    if (done) sub = `Faite le ${formatShort(parseIso(done.date))}`
    else if (isNext && availability.resting) sub = capitalize(availability.text)

    return {
      index,
      number: index + 1,
      status,
      plan,
      reps: done ? done.reps : null,
      total: done ? sum(done.reps) : plannedTotal,
      plannedTotal,
      headline: done ? `${sum(done.reps)} ${exercise.plural}` : `${plannedTotal} ${exercise.plural} minimum`,
      sub,
    }
  })
}
