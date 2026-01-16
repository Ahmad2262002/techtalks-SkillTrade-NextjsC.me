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
import { useAudioContext } from "@/context/AudioContext"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react"
import { useEffect } from "react"

function ToastItem({ id, title, description, action, variant, ...props }: any) {
    const { playSound } = useAudioContext();

    useEffect(() => {
        if (variant === "destructive") playSound("error");
        else if (variant === "success") playSound("success");
        else playSound("notification");
    }, [variant, playSound]);

    return (
        <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-4 items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-background/40 border border-white/10 shadow-xl relative group">
                    <div className={cn(
                        "absolute inset-0 blur-xl opacity-20 transition-opacity",
                        variant === "destructive" ? "bg-rose-500" :
                            variant === "success" ? "bg-emerald-500" :
                                "bg-primary"
                    )} />
                    {variant === "destructive" && <AlertCircle className="h-7 w-7 text-rose-500 relative z-10" />}
                    {variant === "success" && <CheckCircle2 className="h-7 w-7 text-emerald-500 relative z-10" />}
                    {variant === "loading" ? <Loader2 className="h-7 w-7 text-primary animate-spin relative z-10" /> :
                        variant === "default" && <Info className="h-7 w-7 text-primary relative z-10" />}
                </div>
                <div className="grid gap-1.5 px-2">
                    {title && <ToastTitle className="text-[15px] font-black uppercase tracking-tight italic">{title}</ToastTitle>}
                    {description && (
                        <ToastDescription className="text-xs font-bold opacity-60 leading-relaxed uppercase tracking-widest text-[10px]">
                            {description}
                        </ToastDescription>
                    )}
                </div>
            </div>
            {action}
            <ToastClose className="hover:bg-white/10 transition-colors" />
        </Toast>
    );
}

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider swipeDirection="right" swipeThreshold={50}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} {...toast} />
            ))}
            <ToastViewport />
        </ToastProvider>
    )
}

