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
            "flex items-center rounded-full font-black uppercase tracking-widest border transition-all duration-500 group cursor-default shadow-sm",
            "bg-background/40 backdrop-blur-md border-white/10",
            reputation.color,
            sizeClasses[size],
            className
        )}>
            <div className="relative">
                <Icon size={iconSizes[size]} className="fill-current relative z-10 transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute inset-0 blur-md opacity-50 group-hover:opacity-100 transition-opacity bg-current rounded-full" />
            </div>
            <span className="relative z-10">{reputation.title}</span>
            <div className="w-px h-3 bg-border/50 mx-1" />
            <span className="text-muted-foreground opacity-50 group-hover:opacity-80 transition-opacity font-bold">LVL {reputation.level}</span>
        </div>
    );
}
