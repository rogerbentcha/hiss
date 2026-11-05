import { Link } from "react-router"

import { ChevronLeftIcon } from "@/components/icons"

interface BackLinkProps {
  to: string
  label: string
}

/** Pilule de retour (« Mes séances ») des en-têtes de détail et de séance. */
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 rounded-[18px] bg-card py-2.5 pr-3 pl-2 text-[13px] font-medium text-foreground no-underline hover:bg-surface-2 hover:text-foreground md:gap-2"
    >
      <ChevronLeftIcon size={20} />
      {label}
    </Link>
  )
}
