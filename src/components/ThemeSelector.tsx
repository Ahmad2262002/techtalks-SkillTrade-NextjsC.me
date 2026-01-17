import { useTheme, Theme, AccentColor } from '@/context/ThemeContext';
import { useAudioContext } from '@/context/AudioContext';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronDown,
    Code,
    Sun,
    Moon,
    Shield,
    Sparkles,
    Wand2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemeOption {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const themeOptions: ThemeOption[] = [
    {
        value: 'programmer',
        label: 'Programmer',
        icon: <Code className="h-4 w-4" />,
        description: 'Dark coding atmosphere'
    },
    {
        value: 'elite-light',
        label: 'Elite Light',
        icon: <Sparkles className="h-4 w-4" />,
        description: 'Apple iOS light mode'
    },
    {
        value: 'elite-dark',
        label: 'Elite Dark',
        icon: <Wand2 className="h-4 w-4" />,
        description: 'Apple iOS dark mode'
    },
    {
        value: 'cybersecurity',
        label: 'Cybersecurity',
        icon: <Shield className="h-4 w-4" />,
        description: 'Deep & secure atmosphere'
    }
];

const accentOptions: { value: AccentColor; color: string; label: string }[] = [
    { value: 'indigo', color: 'bg-[#1e3a8a]', label: 'Indigo' },
    { value: 'emerald', color: 'bg-[#065f46]', label: 'Emerald' },
    { value: 'rose', color: 'bg-[#9f1239]', label: 'Rose' },
    { value: 'amber', color: 'bg-[#92400e]', label: 'Amber' },
    { value: 'cyan', color: 'bg-[#155e75]', label: 'Cyan' },
];

interface ThemeSelectorProps {
    align?: 'start' | 'end' | 'center';
}

export function ThemeSelector({ align = 'end' }: ThemeSelectorProps) {
    const { theme, setTheme, accentColor, setAccentColor } = useTheme();
    const { playSound } = useAudioContext();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = themeOptions.find(opt => opt.value === theme) || themeOptions[0];

    if (!mounted) return (
        <div className="w-10 h-10 rounded-lg bg-secondary/20 animate-pulse" />
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    onClick={() => playSound('click')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-500",
                        "bg-white/10 backdrop-blur-2xl text-foreground hover:bg-white/20 active:scale-95",
                        "border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]",
                        "focus:ring-2 focus:ring-primary/20 outline-none group"
                    )}
                    aria-label="Select theme"
                >
                    <div className="text-primary relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse group-hover:bg-primary/40 transition-all duration-500" />
                        <div className="relative animate-float-slow group-hover:scale-110 transition-transform duration-500">
                            {currentTheme.icon}
                        </div>
                    </div>
                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                        {currentTheme.label}
                    </span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-500 opacity-40 group-hover:translate-y-0.5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                sideOffset={16}
                className="w-72 rounded-[2rem] bg-background/60 backdrop-blur-xl saturate-[160%] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-3 space-y-1 z-[110] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500"
            >
                <div className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 border-b border-white/5 mb-2 flex items-center justify-between">
                    <span>Atmospheric Sync</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                {themeOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => {
                            playSound('click');
                            setTheme(option.value);
                        }}
                        className={cn(
                            "w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-300 group outline-none",
                            theme === option.value
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                : 'hover:bg-primary/10 text-popover-foreground hover:scale-[1.01]'
                        )}
                    >
                        <span className={cn(
                            "p-2 rounded-lg transition-colors",
                            theme === option.value
                                ? 'bg-white/20 text-white'
                                : 'bg-primary/5 text-primary group-hover:bg-primary/20'
                        )}>
                            {option.icon}
                        </span>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold tracking-tight">{option.label}</div>
                            <div className={cn(
                                "text-[10px] leading-tight transition-opacity",
                                theme === option.value ? 'text-white/70' : 'text-muted-foreground'
                            )}>
                                {option.description}
                            </div>
                        </div>
                        {theme === option.value && (
                            <div className="self-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                        )}
                    </DropdownMenuItem>
                ))}

                {(theme === 'elite-light' || theme === 'elite-dark') && (
                    <>
                        <div className="px-3 py-3 pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-t border-border/30 mt-1">
                            Custom Accent
                        </div>
                        <div className="flex items-center justify-between px-2 pb-2 gap-1">
                            {accentOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playSound('click');
                                        setAccentColor(opt.value);
                                    }}
                                    className={cn(
                                        "h-8 w-8 rounded-full transition-all duration-300 flex items-center justify-center border-2",
                                        opt.color,
                                        accentColor === opt.value
                                            ? "border-white scale-110 shadow-lg"
                                            : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                    )}
                                    title={opt.label}
                                >
                                    {accentColor === opt.value && (
                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
