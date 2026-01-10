import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:scale-95 select-none haptic-touch hover:scale-[1.02]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_20px_-5px_rgba(var(--primary),0.3)] hover:bg-primary/90 hover:shadow-[0_15px_30px_-5px_rgba(var(--primary),0.4)] border border-white/10",
        destructive:
          "bg-destructive text-white shadow-[0_10px_20px_-5px_rgba(var(--destructive),0.3)] hover:bg-destructive/90 hover:shadow-[0_15px_30px_-5px_rgba(var(--destructive),0.4)] border border-white/10",
        outline:
          "border-2 border-border/50 bg-background/40 backdrop-blur-md shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md border border-white/5",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 rounded-2xl has-[>svg]:px-4",
        sm: "h-10 rounded-xl gap-2 px-4 text-xs has-[>svg]:px-3.5",
        lg: "h-14 rounded-[1.5rem] px-8 text-base has-[>svg]:px-6 tracking-tight",
        icon: "size-12 rounded-2xl",
        "icon-sm": "size-10 rounded-xl",
        "icon-lg": "size-14 rounded-[1.5rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
