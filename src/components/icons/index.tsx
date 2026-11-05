import type { SVGProps } from "react"

/**
 * Icônes du design (tracés d'origine, viewBox 24×24, trait arrondi).
 * `size` fixe largeur et hauteur ; `strokeWidth` reprend l'épaisseur de la maquette.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & { size?: number }

function Icon({ size = 24, strokeWidth = 2, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const BarsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 20V14" />
    <path d="M10.5 20V9" />
    <path d="M16 20V4" />
    <path d="M3 20h18" />
  </Icon>
)

export const StopwatchIcon = ({ withButton = true, ...p }: IconProps & { withButton?: boolean }) => (
  <Icon {...p}>
    <circle cx="12" cy="13.5" r="8" />
    <path d="M12 9.5v4l2.6 1.6" />
    <path d="M9.5 2.5h5" />
    {withButton && <path d="M19 5.5l1.5 1.5" />}
  </Icon>
)

export const ArcIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3a9 9 0 1 1-8.2 5.3" />
  </Icon>
)

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </Icon>
)

export const ArrowUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </Icon>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
)

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
)

export const MinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
)

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
)

export const PlayCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l5.5-3.5z" />
  </Icon>
)

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
)

/** Icônes pleines (lecture / pause). */
export const PlayFilledIcon = ({ size = 24, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l10.2-6.8a1 1 0 0 0 0-1.72L9.5 4.34A1 1 0 0 0 8 5.2z" />
  </svg>
)

export const PauseFilledIcon = ({ size = 24, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="2" />
    <rect x="14" y="4.5" width="4" height="15" rx="2" />
  </svg>
)
