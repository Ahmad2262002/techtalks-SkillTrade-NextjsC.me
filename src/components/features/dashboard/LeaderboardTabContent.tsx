"use client";

import React from "react";
import Link from "next/link";
import { LeaderboardEntry } from "@/types/dashboard";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardTabContentProps {
    leaderboard?: LeaderboardEntry[];
}

export const LeaderboardTabContent = React.memo(({ leaderboard }: LeaderboardTabContentProps) => (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Global Board</h2>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] opacity-60">Rankings based on reputation & successful swaps</p>
            </div>
            <div className="hidden md:flex p-5 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner">
                <Trophy className="w-10 h-10 text-primary animate-pulse" />
            </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
            <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Mentor</div>
                <div className="col-span-3 text-center">Title</div>
                <div className="col-span-3 text-right">Reputation</div>
            </div>
            <div className="divide-y divide-border/50">
                {leaderboard?.map((entry, i) => (
                    <Link href={`/profile/${entry.id}`} key={entry.id}
                        className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/50 transition-colors group">
                        <div className="col-span-1 font-black text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </div>
                        <div className="col-span-11 md:col-span-5 flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-all">
                                <AvatarImage src={entry.avatarUrl || ""} />
                                <AvatarFallback className="font-bold">{entry.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-foreground group-hover:text-primary transition-colors truncate">{entry.name}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{entry.industry || "Generalist"}</span>
                            </div>
                        </div>
                        <div className="hidden md:block col-span-3 text-center">
                            <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                entry.reputation.color,
                                entry.reputation.color.replace('text-', 'bg-') + "/10"
                            )}>
                                {entry.reputation.title}
                            </span>
                        </div>
                        <div className="col-span-11 md:col-span-3 text-right">
                            <div className="flex flex-col items-end">
                                <span className="font-black text-lg text-primary">{entry.reputation.reputationPoints.toLocaleString()}</span>
                                <span className="text-[10px] font-bold opacity-50 uppercase">Points</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
));

LeaderboardTabContent.displayName = "LeaderboardTabContent";
