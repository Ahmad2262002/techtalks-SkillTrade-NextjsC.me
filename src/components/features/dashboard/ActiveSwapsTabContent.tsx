"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swap, Application } from "@/types/dashboard";
import { Zap, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReputationBadge } from "@/components/ReputationBadge";
import dynamic from "next/dynamic";

const ChatModal = dynamic(() => import("@/components/ChatModal").then(mod => mod.ChatModal), { ssr: false });
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import styles from '../../../app/(dashboard)/dashboard/Dashboard.module.css';

interface ActiveSwapsTabContentProps {
    applications: Application[];
    swaps: Swap[];
    user: any;
    handleAccept: (id: string) => void;
    handleReject: (id: string) => void;
    handleComplete: (id: string) => void;
    handleCancel: (id: string) => void;
    handleReview: (s: Swap) => void;
    scrolled: boolean;
}

const SwapCard = React.memo(({ swap, partner, currentUserId, onComplete, onCancel, onReview, hasReviewed }: {
    swap: Swap,
    partner: any,
    currentUserId: string,
    onComplete: (id: string) => void,
    onCancel: (id: string) => void,
    onReview: (s: Swap) => void,
    hasReviewed: boolean
}) => {
    const prematureClosureReasons = [
        "Mutual agreement", "Partner unresponsive", "Skill mismatch", "Other"
    ];

    const isTeacher = swap.teacherId === currentUserId;
    const userHasCompleted = isTeacher ? swap.teacherHasCompleted : swap.studentHasCompleted;
    const partnerHasCompleted = isTeacher ? swap.studentHasCompleted : swap.teacherHasCompleted;

    return (
        <div className={cn(
            styles.swapCard,
            "group relative overflow-hidden transition-all duration-700 rounded-[3rem] p-1 bg-gradient-to-br from-primary/20 via-border/50 to-secondary/20 hover:from-primary/40 hover:to-secondary/40 shadow-xl",
            (swap.status === 'CLOSED' || swap.status === 'CANCELLED') && "opacity-60 grayscale scale-[0.98]"
        )}>
            <div className="bg-card/80 backdrop-blur-3xl rounded-[2.9rem] p-6 md:p-8 h-full flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] group-hover:bg-secondary/20 transition-all duration-1000" />

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-150" />
                        <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 transition-transform duration-700 group-hover:scale-110">
                            <AvatarImage src={partner.avatarUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl md:text-3xl uppercase italic">{partner.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                            "absolute -bottom-2 -right-2 w-10 h-10 border-4 border-background rounded-full z-20 shadow-xl flex items-center justify-center transition-all duration-500",
                            swap.status === 'ACTIVE' ? "bg-emerald-500 animate-pulse" : swap.status === 'COMPLETED' ? "bg-primary" : "bg-destructive"
                        )}>
                            {swap.status === 'ACTIVE' ? <Zap className="w-5 h-5 text-white fill-current" /> : swap.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10 min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                            <Badge variant="outline" className={cn(
                                "font-black text-[10px] uppercase tracking-[0.3em] px-4 py-2 rounded-full border-none shadow-lg",
                                swap.status === 'ACTIVE' ? "bg-primary/10 text-primary shadow-primary/10" : swap.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" : "bg-destructive/10 text-destructive shadow-destructive/10"
                            )}>
                                {swap.status} Exchange
                            </Badge>
                            <ReputationBadge reputation={partner.reputation} size="sm" />
                            {partnerHasCompleted && swap.status === 'ACTIVE' && (
                                <Badge className="bg-emerald-500 text-white animate-bounce-slow">Partner marked as complete</Badge>
                            )}
                        </div>

                        <h3 className="font-black text-2xl md:text-4xl tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500 uppercase italic leading-none mb-2 break-all sm:break-normal line-clamp-2 sm:line-clamp-none">
                            {partner.name}
                        </h3>

                        <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-4 opacity-80 flex items-center justify-center md:justify-start gap-3">
                            <div className="w-8 h-px bg-primary/30" />
                            <span className="truncate">Active Sync: <strong className="text-foreground">{swap.proposal?.title}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 relative z-10">
                    <div className="relative flex-1 sm:flex-none">
                        <ChatModal
                            swapId={swap.id}
                            currentUserId={currentUserId}
                            otherUserName={partner.name}
                            triggerClassName="h-14 md:h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-[0_15px_30px_rgba(var(--primary),0.3)] border-none px-6 md:px-8 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.05] active:scale-95"
                        />
                        {(swap as any).messages?.length > 0 && (
                            <div className="absolute -top-2 -right-2 bg-rose-500 text-white min-w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-black border-2 border-background animate-bounce-slow shadow-lg shadow-rose-500/30 z-20">
                                {(swap as any).messages.length}
                            </div>
                        )}
                    </div>
                    {swap.status === 'ACTIVE' && (
                        <Button
                            onClick={() => onComplete(swap.id)}
                            className={cn(
                                "h-14 md:h-16 rounded-2xl font-black uppercase tracking-widest text-xs px-6 md:px-8 shadow-xl border-none transition-all hover:scale-[1.05] active:scale-95",
                                userHasCompleted
                                    ? "bg-muted/30 text-muted-foreground border-2 border-dashed border-border/50"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30"
                            )}
                        >
                            {userHasCompleted ? "Awaiting Partner..." : partnerHasCompleted ? "Confirm Completion" : "Mark as Complete"}
                        </Button>
                    )}
                    {swap.status === 'COMPLETED' && !hasReviewed && (
                        <Button
                            onClick={() => onReview(swap)}
                            className="h-14 md:h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs px-6 md:px-8 shadow-[0_15px_30px_rgba(245,158,11,0.3)] border-none transition-all hover:scale-[1.05] active:scale-95"
                        >
                            Review
                        </Button>
                    )}
                    {swap.status === 'COMPLETED' && hasReviewed && (
                        <div className="h-14 md:h-16 flex items-center gap-3 px-6 md:px-8 rounded-2xl bg-muted/30 text-muted-foreground font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border/50">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> Done
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-muted/20 border-2 border-border/50 text-muted-foreground hover:text-primary hover:border-primary transition-all">
                                <MoreVertical className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-3xl border-2 border-border shadow-2xl p-3 min-w-[220px] bg-popover backdrop-blur-3xl">
                            {swap.status === 'ACTIVE' && (
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="rounded-2xl font-black uppercase tracking-widest text-[10px] p-4 h-12">Cancel Exchange</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="rounded-3xl border-2 border-border shadow-2xl p-3 min-w-[220px] bg-popover backdrop-blur-3xl">
                                            <DropdownMenuLabel className="px-4 py-2 text-[9px] uppercase font-black text-muted-foreground tracking-[0.3em] opacity-50">Protocol Termination</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="my-3 opacity-10" />
                                            {prematureClosureReasons.map(reason => (
                                                <DropdownMenuItem key={reason} onClick={() => onCancel(swap.id)} className="rounded-2xl font-black uppercase tracking-widest text-[10px] p-4 h-12 focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                                    {reason}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            )}
                            <DropdownMenuSeparator className="my-3 opacity-10" />
                            <DropdownMenuItem asChild className="rounded-2xl font-black uppercase tracking-widest text-[10px] p-4 h-12 focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive">
                                <a href={`mailto:support@skilltrade.solutions?subject=Incident%20Report:%20${swap.proposal?.title}&body=Sync%20ID:%20${swap.id}`}>Report Incident</a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div >
    );
});
SwapCard.displayName = "SwapCard";

const ApplicationCard = React.memo(({ app, onAccept, onReject }: {
    app: Application,
    onAccept: (id: string) => void,
    onReject: (id: string) => void
}) => (
    <div className={cn(
        styles.applicationCard,
        "group relative overflow-hidden transition-all duration-500 rounded-[2.5rem] sm:rounded-[3.5rem] p-1 bg-gradient-to-br from-orange-500/20 via-border/40 to-primary/10 hover:from-orange-500/40 border-none shadow-xl"
    )}>
        <div className="bg-card/95 backdrop-blur-xl rounded-[2.4rem] sm:rounded-[3.4rem] p-6 sm:p-12 h-full flex flex-col relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] group-hover:bg-orange-500/20 transition-all duration-[2000ms]" />

            <div className="p-0 relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-150" />
                            <Avatar className="h-24 w-24 border-4 border-background shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 transition-transform duration-700 group-hover:scale-110">
                                <AvatarImage src={app.applicant.avatarUrl || ""} className="object-cover" />
                                <AvatarFallback className="bg-orange-500/10 text-orange-500 font-black text-3xl uppercase italic">{app.applicant.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-orange-500 rounded-full border-4 border-background flex items-center justify-center z-20 shadow-xl shadow-orange-500/20 scale-110">
                                <Zap className="w-4 h-4 text-white fill-current" />
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                <Badge className="bg-orange-500/10 text-orange-500 border-none px-4 py-2 text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg shadow-orange-500/10 shrink-0">Incoming Signal</Badge>
                                {app.applicant.reputation && <ReputationBadge reputation={app.applicant.reputation} size="sm" />}
                            </div>
                            <Link href={`/profile/${app.applicant.id}`} className="font-black text-3xl sm:text-5xl text-foreground hover:text-primary transition-all duration-500 block leading-[0.85] tracking-tighter uppercase italic drop-shadow-sm break-all sm:break-normal">{app.applicant.name}</Link>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">Syncing with</span>
                                <div className="flex-1 h-px bg-border/20 max-w-[40px]" />
                                <span className="text-xs font-black text-primary uppercase tracking-widest">{app.proposal?.title}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative mb-12 p-10 bg-background/40 rounded-[2.5rem] border-2 border-dashed border-orange-500/20 group-hover:border-orange-500/40 transition-all duration-700 group-hover:bg-background/60 shadow-inner flex-1 flex items-center justify-center min-h-[160px]">
                    <div className="absolute top-0 left-12 -translate-y-1/2 bg-orange-500 text-white px-6 py-1.5 text-[9px] font-black uppercase tracking-[0.4em] rounded-full shadow-xl shadow-orange-500/30 italic">Transmission</div>
                    <p className="text-xl sm:text-2xl text-foreground leading-tight font-black italic tracking-tighter uppercase text-center max-w-md">
                        &quot;{app.pitchMessage}&quot;
                    </p>
                </div>

                <div className="flex gap-4 mt-auto">
                    <Button
                        onClick={() => onAccept(app.id)}
                        className="flex-1 h-20 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-[0_20px_40px_rgba(249,115,22,0.3)] transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] gap-4 hover:scale-[1.02] active:scale-[0.98] border-none"
                    >
                        <CheckCircle className="w-6 h-6" /> Authenticate Exchange
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onReject(app.id)}
                        className="w-20 h-20 p-0 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-500 border-2 border-border/50 bg-transparent shadow-xl flex items-center justify-center"
                    >
                        <XCircle className="w-10 h-10" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
));
ApplicationCard.displayName = "ApplicationCard";

export const ActiveSwapsTabContent = React.memo(({ applications, swaps, user, handleAccept, handleReject, handleComplete, handleCancel, handleReview, scrolled }: ActiveSwapsTabContentProps) => {
    const router = useRouter();
    const pendingApps = applications.filter((a: any) => a.status === "PENDING");

    return (
        <div className="space-y-24 pb-20">
            {pendingApps.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className={cn(
                        "flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12 sticky transition-all duration-500 z-[20] py-4 rounded-[2rem]",
                        scrolled ? "top-[5.5rem] bg-background/40 backdrop-blur-md px-4 sm:px-6 shadow-lg border border-white/5 scale-95" : "top-0"
                    )}>
                        <div>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-4 transition-all flex-wrap">
                                Requests <span className="text-primary opacity-20 text-2xl sm:text-3xl">/ {pendingApps.length}</span>
                            </h2>
                            <p className="text-muted-foreground font-bold mt-2 max-w-md uppercase tracking-widest text-[8px] sm:text-[10px] opacity-60">Success potential: High</p>
                        </div>
                        <div className="h-px flex-1 bg-border/50 hidden md:block mx-10 mb-2" />
                    </div>
                    <div className="grid gap-10 grid-cols-1 lg:grid-cols-2">
                        {pendingApps.map((app: any) => (
                            <ApplicationCard key={app.id} app={app} onAccept={handleAccept} onReject={handleReject} />
                        ))}
                    </div>
                </section>
            )}

            <section className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                <div className={cn(
                    "flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12 sticky transition-all duration-500 z-[20] py-4 rounded-[2rem]",
                    scrolled ? "top-[5.5rem] bg-background/40 backdrop-blur-md px-4 sm:px-6 shadow-lg border border-white/5 scale-95" : "top-0"
                )}>
                    <div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none flex items-center gap-4 transition-all flex-wrap">
                            Syncs <span className="text-emerald-500 opacity-20 text-2xl sm:text-3xl">/ {swaps.length}</span>
                        </h2>
                        <p className="text-muted-foreground font-bold mt-2 max-w-md uppercase tracking-widest text-[8px] sm:text-[10px] opacity-60">Ongoing collaborations</p>
                    </div>
                    <div className="h-px flex-1 bg-border/50 hidden md:block mx-10 mb-2" />
                </div>

                {swaps.length === 0 ? (
                    <div className={cn(styles.emptyState, "py-32 relative group overflow-hidden bg-background/5 border-none shadow-none")}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] group-hover:bg-primary/10 transition-all duration-[2000ms]" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="p-12 rounded-[4rem] bg-gradient-to-br from-primary/10 to-transparent border-t border-l border-white/10 mb-10 rotate-6 group-hover:rotate-12 transition-all duration-1000 shadow-2xl scale-110">
                                <Zap className="w-24 h-24 text-primary opacity-60 animate-pulse" />
                            </div>
                            <h3 className="font-black text-3xl sm:text-6xl uppercase tracking-tighter italic leading-none mb-6 text-center">Sync Pending</h3>
                            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs opacity-60 max-w-sm text-center leading-loose px-4">
                                Your exchange floor is currently empty. Ignite a connection by requesting a swap from the explorer.
                            </p>
                            <Button
                                onClick={() => router.push('/dashboard?tab=browse')}
                                className="mt-12 h-16 px-12 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-black/20"
                            >
                                Scan Explorer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 grid-cols-1">
                        {swaps.map((swap: any) => {
                            const partner = swap.teacherId === user.id ? swap.student : swap.teacher;
                            const hasReviewed = swap.reviews?.some((r: any) => r.authorId === user.id);
                            return <SwapCard key={swap.id} swap={swap} partner={partner} currentUserId={user.id} onComplete={handleComplete} onCancel={handleCancel} onReview={handleReview} hasReviewed={hasReviewed} />;
                        })}
                    </div>
                )}
            </section>
        </div>
    );
});

ActiveSwapsTabContent.displayName = "ActiveSwapsTabContent";
