import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed bottom-0 left-1/2 -translate-x-1/2 z-[200] flex max-h-screen w-full flex-col-reverse p-6 sm:bottom-8 md:max-w-[440px] gap-4",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_10px_20px_-10px_rgba(0,0,0,0.1)] transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full sm:data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full border backdrop-blur-3xl data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:animate-out",
    {
        variants: {
            variant: {
                default: "bg-background/90 text-foreground border-white/10",
                destructive:
                    "destructive group border-rose-500/20 bg-rose-500/10 text-rose-500",
                success:
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                loading:
                    "border-primary/20 bg-primary/10 text-primary",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, open, onOpenChange, ...props }, ref) => {
    return (
        <ToastPrimitives.Root
            ref={ref}
            open={open}
            onOpenChange={onOpenChange}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        >
            {props.children}
            {variant !== "loading" && <div className="toast-progress-bar" style={{ animationDuration: '3000ms' }} />}
            {variant === "loading" && <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full overflow-hidden truncate"><div className="h-full bg-primary animate-pulse w-1/2 rounded-full" /></div>}
        </ToastPrimitives.Root>
    )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-9 shrink-0 items-center justify-center rounded-lg border bg-transparent px-4 text-xs font-semibold ring-offset-background transition-all hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-rose-500/30 group-[.destructive]:hover:border-rose-500 group-[.destructive]:hover:bg-rose-500 group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-rose-400",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            "absolute right-3 top-3 rounded-full p-1 text-foreground/40 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-rose-300 group-[.destructive]:hover:text-rose-50 group-[.destructive]:focus:ring-rose-400",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-[15px] font-semibold tracking-tight", className)}
        {...props}
    />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn("text-[13px] font-medium opacity-60 leading-normal", className)}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
}
