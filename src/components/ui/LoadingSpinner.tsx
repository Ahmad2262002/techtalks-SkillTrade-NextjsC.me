import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "icon";
    noText?: boolean;
    className?: string;
}

export function LoadingSpinner({ size = "md", noText = false, className }: LoadingSpinnerProps) {
    const sizeMap = {
        sm: { container: "w-8 h-8 min-h-0", ring: "w-8 h-8", border: "border-2", icon: "w-3 h-3" },
        md: { container: "w-16 h-16 min-h-[50vh]", ring: "w-16 h-16", border: "border-4", icon: "w-6 h-6" },
        lg: { container: "w-24 h-24 min-h-[50vh]", ring: "w-24 h-24", border: "border-4", icon: "w-10 h-10" },
        icon: { container: "w-14 h-14 min-h-0", ring: "w-14 h-14", border: "border-2", icon: "w-4 h-4" }
    };

    const currentSize = sizeMap[size];

    return (
        <div className={cn("relative flex items-center justify-center", currentSize.container, className)}>
            {/* Outer Ring */}
            <div className={cn("absolute rounded-full border-primary/20 animate-spin-slow", currentSize.ring, currentSize.border)}></div>

            {/* Inner Ring */}
            <div className={cn("absolute rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin", currentSize.ring, currentSize.border)}></div>

            {/* Pulsing Core */}
            <div className="absolute w-full h-full flex items-center justify-center animate-pulse">
                <Zap className={currentSize.icon + " text-primary fill-primary"} />
            </div>

            {/* Text */}
            {!noText && (
                <div className="absolute -bottom-12 text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse whitespace-nowrap">
                    Loading...
                </div>
            )}
        </div>
    );
}
