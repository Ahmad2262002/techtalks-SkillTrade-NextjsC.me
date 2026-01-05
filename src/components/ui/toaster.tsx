"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                return (
                    <Toast key={id} variant={variant} {...props}>
                        <div className="flex gap-4 items-center">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] relative group">
                                <div className={cn(
                                    "absolute inset-0 blur-lg opacity-20 transition-opacity",
                                    variant === "destructive" ? "bg-red-500" :
                                        variant === "success" ? "bg-emerald-500" :
                                            "bg-blue-500"
                                )} />
                                {variant === "destructive" && <AlertCircle className="h-6 w-6 text-red-500 relative z-10" />}
                                {variant === "success" && <CheckCircle2 className="h-6 w-6 text-emerald-500 relative z-10" />}
                                {variant === "default" && <Info className="h-6 w-6 text-blue-400 relative z-10" />}
                            </div>
                            <div className="grid gap-1">
                                {title && <ToastTitle className="text-sm font-black uppercase tracking-tight">{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription className="text-xs font-bold opacity-70">
                                        {description}
                                    </ToastDescription>
                                )}
                            </div>
                        </div>
                        {action}
                        <ToastClose className="hover:bg-white/10 transition-colors" />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}

