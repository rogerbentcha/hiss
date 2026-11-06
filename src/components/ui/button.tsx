import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // `relative` : ancre la zone de toucher étendue (pseudo-élément `before`) des petites tailles.
  "relative inline-flex shrink-0 items-center justify-center gap-2 border-0 font-sans whitespace-nowrap no-underline transition-[color,background-color,scale] duration-150 ease-out outline-none select-none disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** CTA principal : couleur primaire de l'exercice. */
        default: "bg-primary font-semibold text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground",
        /** Bouton surface (#212123). */
        secondary: "bg-card font-medium text-foreground hover:bg-surface-2 hover:text-foreground",
        /** Bouton rond sur carte (#3A3A3C). */
        muted: "bg-surface-2 text-foreground hover:bg-surface-3 hover:text-foreground",
        /** Bouton rond sur fond #3A3A3C (#48484A). */
        raised: "bg-surface-3 text-foreground hover:bg-dot hover:text-foreground",
        /** Bouton atténué primaire (pause / lecture du minuteur). */
        tonal: "bg-primary-muted text-primary hover:bg-primary-muted-hover hover:text-primary",
        ghost: "bg-transparent text-subtle hover:bg-card hover:text-foreground",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 rounded-pill px-5 text-[13px]",
        lg: "h-12 rounded-[22px] px-6 text-[13px]",
        md: "h-[42px] rounded-pill px-4 text-[13px]",
        /* Les tailles sous 44 px gardent leur rendu mais étendent leur zone de toucher à 44 px. */
        sm: "h-8 rounded-[16px] px-3 text-[13px] before:absolute before:inset-x-0 before:-inset-y-1.5",
        nav: "h-9 rounded-[16px] px-2.5 text-[13px] before:absolute before:inset-x-0 before:-inset-y-1",
        icon: "size-11 rounded-full",
        "icon-sm": "size-8 rounded-full before:absolute before:-inset-1.5",
        "icon-md": "size-9 rounded-full before:absolute before:-inset-1",
        "icon-lg": "size-12 rounded-full md:size-[60px]",
      },
      /** `static` : pas de léger enfoncement au clic (quand le mouvement distrairait). */
      static: {
        true: "",
        false: "active:not-disabled:scale-[0.96]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      static: false,
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  static: isStatic = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, static: isStatic, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
