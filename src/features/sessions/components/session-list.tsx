import { Card } from "@/components/ui/card"
import { SessionRow } from "@/features/sessions/components/session-row"
import type { SessionView } from "@/features/sessions/session-view"
import { describeRest, describeSetCount } from "@/lib/program"
import type { SessionPlan } from "@/types/program"

interface SessionListProps {
  sessions: SessionView[]
  plan: SessionPlan[]
}

/** Section « Les séances » : toutes les séances du cycle. */
export function SessionList({ sessions, plan }: SessionListProps) {
  return (
    <section id="seances" aria-labelledby="seances-title" className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <h2 id="seances-title" className="m-0 font-display text-xl font-bold tracking-[-0.01em]">
          Les séances
        </h2>
        <span className="text-[13px] text-muted-foreground">
          {describeSetCount(plan)} séries par séance avec {describeRest(plan)} de repos entre chaque
        </span>
      </div>
      <Card className="px-3.5 py-1 md:px-6">
        {sessions.map((s, i) => (
          <SessionRow key={s.index} session={s} first={i === 0} />
        ))}
      </Card>
    </section>
  )
}
