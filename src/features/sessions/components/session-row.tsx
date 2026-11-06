import { Link } from "react-router"

import { HisseLogo } from "@/components/common/hisse-logo"
import { CheckIcon, ChevronRightIcon, LockIcon, PlayCircleIcon } from "@/components/icons"
import { useExercise } from "@/hooks/use-exercise"
import { formatTarget } from "@/lib/program"
import { cn } from "@/lib/utils"
import type { SessionView } from "@/features/sessions/session-view"

interface SessionRowProps {
  session: SessionView
  first: boolean
}

/** Ligne de la liste des séances : statut, total, séries cibles et date. */
export function SessionRow({ session, first }: SessionRowProps) {
  const { routes } = useExercise()
  const isDone = session.status === "done"
  const isNext = session.status === "available" || session.status === "resting"

  return (
    <Link
      to={routes.session(session.number)}
      className={cn(
        "flex items-center gap-2.5 py-3 text-foreground no-underline hover:text-foreground md:gap-6 md:py-3.5",
        !first && "border-t border-surface-2",
      )}
    >
      {/* Numéro ou coche */}
      <div className="flex flex-[0_0_32px] flex-col items-center gap-1 md:flex-[0_0_64px]">
        {isDone ? (
          <span
            role="img"
            aria-label={`Séance ${session.number} faite`}
            className="flex size-8 items-center justify-center rounded-full bg-primary md:size-10"
          >
            <CheckIcon strokeWidth={2.8} className="size-4 text-primary-foreground md:size-5" />
          </span>
        ) : (
          <span className="text-[17px] leading-none font-normal tracking-[-0.01em] tabular-nums">
            {String(session.number).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Icône d'état (desktop uniquement) */}
      <span className={cn("hidden w-8 flex-none justify-center md:flex", isDone || isNext ? "text-primary" : "text-faint")}>
        {isDone && <HisseLogo surface="card" className="size-7" />}
        {isNext && <PlayCircleIcon size={26} />}
        {!isDone && !isNext && <LockIcon size={24} />}
      </span>

      <div className="flex min-w-0 flex-auto flex-col gap-1">
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-4">
          <h3 className="m-0 font-display text-base font-semibold whitespace-nowrap">{session.headline}</h3>
          <div className="flex min-w-0 gap-1 md:flex-[1_1_360px] md:justify-end md:gap-1.5">
            {session.plan.map((target, j) => (
              <div
                key={j}
                className={cn(
                  "flex h-9 min-w-0 flex-1 items-center justify-center rounded-[10px] bg-surface-2 text-[15px] font-semibold tabular-nums",
                  "md:h-10 md:flex-[0_1_76px] md:rounded-xl",
                  isDone ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {formatTarget(target, j, session.plan.length)}
              </div>
            ))}
          </div>
        </div>
        {session.sub && <span className="text-[13px] text-muted-foreground">{session.sub}</span>}
      </div>

      <ChevronRightIcon size={22} strokeWidth={2.2} className="flex-none text-faint" />
    </Link>
  )
}
