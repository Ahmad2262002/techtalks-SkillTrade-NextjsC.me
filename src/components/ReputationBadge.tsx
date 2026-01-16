import { cn } from "@/lib/utils";
import { Star, Shield, Trophy, Zap, Medal } from "lucide-react";

interface ReputationBadgeProps {
    reputation: {
        level: number;
        title: string;
        reputationPoints: number;
        color: string;
        averageRating?: number;
    };
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function ReputationBadge({ reputation, className, size = "md" }: ReputationBadgeProps) {
    if (!reputation) return null;

    const icons: Record<number, React.ElementType> = {
        1: Shield,
        2: Zap,
        3: Medal,
        4: Trophy,
        5: Star,
    };

    const Icon = icons[reputation.level as keyof typeof icons] || Shield;

    const levelThemes: Record<number, string> = {
        1: "border-white/5 text-muted-foreground/60 shadow-sm",
        2: "border-white/10 text-muted-foreground/80 shadow-md",
        3: "border-white/20 text-foreground shadow-lg",
        4: "border-primary/20 text-primary shadow-xl shadow-primary/5",
        5: "border-primary/40 text-primary shadow-2xl shadow-primary/10",
    };

    const sizeClasses = {
        sm: "px-3 py-1 text-[10px] gap-1.5",
        md: "px-4 py-1.5 text-xs gap-2",
        lg: "px-6 py-2.5 text-sm gap-3",
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18,
    };

    return (
        <div className={cn(
            "flex items-center rounded-full font-black uppercase tracking-widest border transition-all duration-700 group cursor-default shadow-sm",
            "bg-background/40 backdrop-blur-md",
            levelThemes[reputation.level] || levelThemes[1],
            sizeClasses[size],
            className
        )}>
            <div className="relative">
                <Icon size={iconSizes[size]} className={cn(
                    "fill-current relative z-10 transition-transform duration-500 group-hover:scale-125",
                )} />
                <div className={cn(
                    "absolute inset-0 blur-md opacity-40 group-hover:opacity-100 transition-opacity bg-current rounded-full",
                    reputation.level >= 4 && "animate-glow"
                )} />
            </div>
            <span className="relative z-10 font-medium">{reputation.title}</span>
            <div className="w-px h-3 bg-current opacity-20 mx-1" />
            <span className="text-current opacity-40 group-hover:opacity-100 transition-opacity font-medium">LVL {reputation.level}</span>
        </div>
    );
}
