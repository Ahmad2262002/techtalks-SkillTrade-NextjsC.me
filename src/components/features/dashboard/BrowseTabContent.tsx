"use client";

import React from "react";
import Link from "next/link";
import { Proposal, LeaderboardEntry } from "@/types/dashboard";
import { Layers, Trophy, ArrowRight, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/ProposalCard";
import { cn } from "@/lib/utils";
import styles from '../../../app/(dashboard)/dashboard/Dashboard.module.css';

interface BrowseTabContentProps {
    publicOnlyProposals: Proposal[];
    scrolled: boolean;
    topMentors?: LeaderboardEntry[];
}

export const BrowseTabContent = React.memo(({ publicOnlyProposals, scrolled, topMentors = [] }: BrowseTabContentProps) => {
    const topRanked = topMentors && topMentors.length > 0 ? topMentors.slice(0, 3) : [];

    let displayMentors: any[] = topRanked;
    if (displayMentors.length === 0) {
        const uniqueOwners = new Map();
        publicOnlyProposals.forEach(p => {
            if (p.owner && !uniqueOwners.has(p.ownerId)) {
                uniqueOwners.set(p.ownerId, {
                    id: p.ownerId,
                    name: p.owner.name,
                    avatarUrl: p.owner.avatarUrl,
                    reputation: p.owner.reputation
                });
            }
        });
        displayMentors = Array.from(uniqueOwners.values())
            .sort((a, b) => (b.reputation?.reputationPoints || 0) - (a.reputation?.reputationPoints || 0))
            .slice(0, 3);
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="flex-1 space-y-10 min-w-0">
                <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-primary/20 p-8 sm:p-14 text-white shadow-2xl shadow-black/40 isolate group border border-white/5">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-60 group-hover:scale-110 transition-transform duration-[2000ms]"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] opacity-60 animate-pulse-slow"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
                        <div className="max-w-xl space-y-6">
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg mb-2 hover:bg-white/20 transition-colors cursor-default">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Global Talent Network
                            </div>

                            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl">
                                MASTER <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-violet-400 animate-gradient-x">YOUR CRAFT.</span>
                            </h2>

                            <p className="text-white/60 font-medium text-base sm:text-lg leading-relaxed max-w-md mix-blend-plus-lighter border-l-2 border-primary/50 pl-6">
                                Connect with elite professionals. Trade skills. Elevate your career without spending your time.
                            </p>
                        </div>

                        <div
                            className="hidden md:flex flex-col gap-4 items-end opacity-80 mix-blend-screen w-1/2"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
                            }}
                        >
                            <div className="flex gap-3 animate-marquee hover:pause">
                                {[
                                    "React", "Node.js", "Python", "Solidity", "Design", "DevOps",
                                    "React", "Node.js", "Python", "Solidity", "Design", "DevOps"
                                ].map((s, i) => (
                                    <span key={i} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-sm whitespace-nowrap hover:bg-white hover:text-black transition-all cursor-pointer">
                                        {s}
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-3 animate-marquee-reverse hover:pause">
                                {[
                                    "Piano", "Marketing", "SEO", "Copywriting", "Fitness", "Cooking",
                                    "Piano", "Marketing", "SEO", "Copywriting", "Fitness", "Cooking"
                                ].map((s, i) => (
                                    <span key={i} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-sm whitespace-nowrap hover:bg-white hover:text-black transition-all cursor-pointer">
                                        {s}
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-3 animate-marquee hover:pause">
                                {[
                                    "Photography", "Video Editing", "Public Speaking", "Leadership", "Sales",
                                    "Photography", "Video Editing", "Public Speaking", "Leadership", "Sales"
                                ].map((s, i) => (
                                    <span key={i} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-sm whitespace-nowrap hover:bg-white hover:text-black transition-all cursor-pointer">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Layers className="absolute -bottom-12 -right-12 w-80 h-80 text-white/5 rotate-12 group-hover:rotate-[20deg] group-hover:scale-110 transition-all duration-[1.5s] ease-out pointer-events-none" />
                </section>

                <div className="lg:hidden space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Trophy className="w-3 h-3 text-amber-500" /> Top Mentors
                        </h3>
                        <Link href="/dashboard?tab=leaderboard" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 px-2 snap-x snap-mandatory scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {displayMentors.map((user, i) => (
                            <Link href={`/profile/${user.id}`} key={user.id} className="snap-start min-w-[260px] p-4 rounded-[2rem] bg-card border border-border/50 flex items-center gap-4 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                <div className="absolute -right-4 -top-4 font-black text-6xl text-muted/5 z-0 italic">
                                    {i + 1}
                                </div>
                                <Avatar className="h-14 w-14 border-2 border-background shadow-lg z-10">
                                    <AvatarImage src={user.avatarUrl || ""} />
                                    <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">{(user.name?.[0] || "U")}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1 z-10">
                                    <span className="font-bold truncate text-sm tracking-tight">{user.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-wider border border-amber-500/20">
                                            {user.reputation?.reputationPoints || 0} PTS
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6 px-2">
                    <h3 className="text-xl font-bold tracking-tight">Recent Opportunities</h3>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                <div className={styles.cardGrid}>
                    {publicOnlyProposals.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-60">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-lg">No proposals found</p>
                            <p className="text-sm text-muted-foreground">Adjust your filters or check back later.</p>
                        </div>
                    ) : (
                        publicOnlyProposals.map((p, i) => (
                            <div key={p.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out" style={{ animationDelay: `${Math.min(i * 100, 500)}ms` }}>
                                <ProposalCard proposal={p} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <aside
                className={cn(
                    styles.spotlight,
                    "w-[340px] shrink-0 space-y-6 animate-in fade-in slide-in-from-right-8 duration-1000 hidden lg:flex flex-col",
                    "sticky transition-all duration-700",
                    scrolled ? "top-[6rem]" : "top-[8rem]"
                )}
                style={{
                    maxHeight: scrolled ? 'calc(100vh - 8rem)' : 'calc(100vh - 10rem)',
                    overflowY: 'auto'
                }}
            >
                <section className="p-1 rounded-[2.5rem] bg-gradient-to-b from-border/50 to-transparent shadow-sm">
                    <div className="bg-card rounded-[2.4rem] p-6 border border-border/50 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Top 3 Mentors</h3>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {displayMentors.map((user, i) => (
                                <Link href={`/profile/${user.id}`} key={user.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 group ring-1 ring-transparent hover:ring-border/50">
                                    <div className="relative">
                                        <div className={cn(
                                            "flex items-center justify-center w-6 h-6 rounded-full absolute -top-2 -left-2 text-[10px] font-black border-2 border-background shadow-sm z-20",
                                            i === 0 ? "bg-amber-400 text-amber-900" :
                                                i === 1 ? "bg-slate-300 text-slate-900" :
                                                    i === 2 ? "bg-orange-300 text-orange-900" : "bg-muted text-muted-foreground"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary transition-all duration-500 group-hover:scale-105 shadow-md">
                                            <AvatarImage src={user.avatarUrl || ""} />
                                            <AvatarFallback className="font-black text-lg">{(user.name?.[0] || "U")}</AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-grow gap-1">
                                        <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{user.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[100px]">{user.reputation?.title || "Member"}</span>
                                            <div className="h-1 w-1 rounded-full bg-border" />
                                            <span className="text-[10px] font-black text-primary">
                                                {user.reputation?.reputationPoints?.toLocaleString() || 0} PTS
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link href="/dashboard?tab=leaderboard">
                            <Button variant="ghost" className="w-full mt-6 rounded-2xl h-12 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-dashed border-border/50 hover:border-primary/50 group">
                                See Global Rankings <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </section>

                <Link href="/#contact" className="block transform hover:-translate-y-1 transition-transform duration-500">
                    <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-500/10 to-primary/5 border border-primary/10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-foreground group-hover:text-primary transition-colors">Find a Mentor?</h3>
                            <p className="text-xs font-medium text-muted-foreground mb-4 leading-relaxed">Browsing isn&apos;t enough? Request a specific mentor to boost your skills.</p>
                            <div className="flex items-center gap-2 text-xs font-black text-primary">
                                Post Request <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                        <Layers className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5 group-hover:scale-125 transition-transform duration-700" />
                    </section>
                </Link>
            </aside>
        </div>
    );
});

BrowseTabContent.displayName = "BrowseTabContent";
