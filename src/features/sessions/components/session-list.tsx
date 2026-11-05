import { Card } from "@/components/ui/card"
import { SessionRow } from "@/features/sessions/components/session-row"
import type { SessionView } from "@/features/sessions/session-view"

interface SessionListProps {
  sessions: SessionView[]
}

/** Section « Les séances » : les 6 séances du cycle. */
export function SessionList({ sessions }: SessionListProps) {
  return (
    <section id="seances" aria-labelledby="seances-title" className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <h2 id="seances-title" className="m-0 font-display text-xl font-bold tracking-[-0.01em]">
          Les séances
        </h2>
        <span className="text-[13px] text-muted-foreground">5 séries par séance avec 2 min de repos entre chaque</span>
      </div>
      <Card className="px-3.5 py-1 md:px-6">
        {sessions.map((s, i) => (
          <SessionRow key={s.index} session={s} first={i === 0} />
        ))}
      </Card>
    </section>
  )
}
