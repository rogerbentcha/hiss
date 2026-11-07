import { useSyncExternalStore } from "react"
import { Link } from "react-router"
import { MotionConfig, motion, type Variants } from "motion/react"

import { HisseLogo } from "@/components/common/hisse-logo"
import { ChevronRightIcon } from "@/components/icons"
import { Logo } from "@/components/layout/logo"
import { EXERCISES, type Exercise } from "@/lib/exercises"
import { getLevel } from "@/lib/program"
import { getStores } from "@/lib/stores"

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", visualDuration: 0.5, bounce: 0.25, opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  },
}

/** Accueil de la plateforme : choix du programme, tractions ou pompes. */
export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <header className="mx-auto flex w-full max-w-[1200px] items-center px-4 py-3.5 md:px-7 md:py-5">
          <Logo />
        </header>

        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full max-w-[760px] flex-auto flex-col justify-center gap-8 px-4 pt-2 pb-10 md:gap-10 md:px-5 md:pb-16"
        >
          <motion.div variants={item} className="flex flex-col items-center gap-3.5 text-center md:gap-4">
            <HisseLogo
              animated
              label="Logo Hisse : un bonhomme saute, attrape la barre et enchaîne trois tractions"
              className="h-32 w-auto md:h-40"
            />
            <div className="flex flex-col items-center gap-2">
              <h1 className="m-0 font-display text-[22px] leading-[1.15] font-bold tracking-[-0.01em] md:text-2xl">
                Bienvenue sur Hisse
              </h1>
              <p className="m-0 text-[15px] leading-normal text-muted-foreground md:text-base">
                Choisis ton programme. Tu peux suivre les deux en parallèle.
              </p>
            </div>
          </motion.div>

          <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 md:grid-cols-2 md:gap-3.5">
            {EXERCISES.map((exercise) => (
              <motion.li key={exercise.id} variants={item} className="flex">
                <ExerciseCard exercise={exercise} />
              </motion.li>
            ))}
          </ul>
        </motion.main>
      </div>
    </MotionConfig>
  )
}

/** Carte d'un programme : objectif, accroche et, s'il est commencé, où on en est. */
function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const store = getStores(exercise.id).program
  const { program } = useSyncExternalStore(store.subscribe, store.get)

  let status = "Commencer"
  if (program) {
    const sessionCount = exercise.buildPlan(program.max).length
    const done = Math.min(program.done.length, sessionCount)
    status = `Niveau ${getLevel(exercise, program.max).label} · ${done}/${sessionCount} séances`
  }

  return (
    <Link
      to={exercise.routes.welcome}
      data-exercise={exercise.id}
      className="surface-card group flex w-full flex-col gap-5 p-5 text-foreground no-underline transition-colors hover:border-primary/40 hover:bg-surface-2/40 hover:text-foreground md:gap-6 md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-display text-xl font-bold tracking-[-0.01em]">{exercise.name}</h2>
          <p className="m-0 text-[13px] leading-[1.45] text-muted-foreground">{exercise.copy.pitch}</p>
        </div>
        <span className="flex flex-col items-end leading-none">
          <span className="font-display text-[44px] font-bold tracking-[-0.02em] text-primary tabular-nums md:text-[52px]">
            {exercise.goal}
          </span>
          <span className="text-xs text-muted-foreground">objectif</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-surface-2 pt-4">
        <span className="text-[13px] font-medium text-subtle">{status}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
          <ChevronRightIcon size={20} strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  )
}
