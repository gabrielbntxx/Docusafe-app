import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variantStyles = {
      default: "bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-soft",
      secondary: "bg-secondary-500 text-white hover:bg-secondary-600 active:scale-95 shadow-soft",
      outline: "border-2 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
      ghost: "hover:bg-neutral-100 text-neutral-700",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-soft"
    }

    const sizeStyles = {
      default: "h-11 px-6 py-2 text-base",
      sm: "h-9 px-4 text-sm",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10"
    }

    return (
      <Comp
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
