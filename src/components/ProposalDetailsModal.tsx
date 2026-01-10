"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createApplication } from "@/actions/applications";
import { deleteProposal } from "@/actions/proposal-actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Send, Zap, MapPin, Code2, Palette, Music, MessageCircle, Edit, X, Check, Star } from "lucide-react";
import { ReputationBadge } from "@/components/ReputationBadge";
import { Proposal } from "@/types/dashboard";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostProposalModal } from "./PostProposalModal";

export function ProposalDetailsModal({
    proposal,
    isOwner,
    isOpen,
    onOpenChange
}: {
    proposal: Proposal,
    isOwner: boolean,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [isApplying, setIsApplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pitch, setPitch] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleApply = async () => {
        if (!pitch.trim()) return;
        setLoading(true);
        try {
            await createApplication({ proposalId: proposal.id, pitchMessage: pitch });
            toast({ variant: "success", title: "Application Sent!", description: "Good luck!" });
            onOpenChange(false);
            setPitch("");
            setIsApplying(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to send application.";
            toast({ variant: "destructive", title: "Error", description: message });
        } finally {
            setLoading(false);
        }
    };

    // Body class for mobile dock hiding fallback
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('details-modal-active', 'details-modal-open');
            // iOS Haptic Feel
            if ('vibrate' in navigator) navigator.vibrate(5);
        } else {
            document.body.classList.remove('details-modal-active', 'details-modal-open');
        }
        return () => document.body.classList.remove('details-modal-active', 'details-modal-open');
    }, [isOpen]);

    const handleDelete = async () => {
        if (!confirm("Are you sure?")) return;
        setLoading(true);
        try {
            const result = await deleteProposal(proposal.id);
            if (result.success) {
                toast({ variant: "success", title: "Deleted", description: "Proposal deleted." });
                onOpenChange(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
        } finally {
            setLoading(false);
        }
    };

    const getSkillName = (s: { name?: string; skill?: { name: string } } | string) => {
        if (!s) return "Skill";
        if (typeof s === 'string') return s;
        return s.name || s.skill?.name || "Skill";
    };

    const offeredSkill = proposal.offeredSkills?.[0] ? getSkillName(proposal.offeredSkills[0]) : "Skill";
    const neededSkills = proposal.neededSkills || [];
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>

                <DialogContent className="details-modal-content max-w-xl p-0 rounded-[3.2rem] border-none shadow-2xl bg-background overflow-hidden flex flex-col h-[90dvh] md:h-[85vh]">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-6 top-6 z-50 p-3 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 text-foreground/70 hover:text-primary hover:scale-110 active:scale-95 transition-all md:hidden"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                    <ScrollArea className="flex-1 w-full">
                        {proposal.imageUrl && (
                            <div className="h-64 w-full relative group">
                                <Image
                                    src={proposal.imageUrl}
                                    alt={proposal.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                            </div>
                        )}
                        <div className={cn("p-10 bg-gradient-to-br from-primary/5 via-background to-background", !proposal.imageUrl && "pt-12")}>
                            <DialogHeader className="mb-8 text-left">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-sm">
                                            {modalityIcon}
                                        </div>
                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none uppercase tracking-[0.2em] text-[10px] font-black px-4 py-1.5 rounded-full">
                                            {String(proposal.modality).replace("_", " ")}
                                        </Badge>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Verified Opportunity</span>
                                        </div>

                                        <DialogTitle className="text-4xl sm:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-[1.1] mb-2">
                                            {proposal.title}
                                        </DialogTitle>

                                        {(() => {
                                            const text = (proposal.title + " " + (proposal.description || "")).toLowerCase();
                                            let category = { label: "General Exchange", color: "text-slate-500", border: "border-slate-500/20", bg: "bg-slate-500/5", icon: <Zap className="w-3 h-3" /> };

                                            if (/react|javascript|typescript|code|web|app|dev|python|java|tech|programming|software|backend|frontend/.test(text)) {
                                                category = { label: "Software Engineering", color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10", icon: <Code2 className="w-3 h-3" /> };
                                            } else if (/design|ui|ux|art|draw|logo|adobe|figma|creative|graphic/.test(text)) {
                                                category = { label: "Creative & Design", color: "text-pink-500", border: "border-pink-500/20", bg: "bg-pink-500/10", icon: <Palette className="w-3 h-3" /> };
                                            } else if (/music|audio|song|guitar|piano|voice|mixing/.test(text)) {
                                                category = { label: "Music & Audio", color: "text-purple-500", border: "border-purple-500/20", bg: "bg-purple-500/10", icon: <Music className="w-3 h-3" /> };
                                            } else if (/write|english|content|translate|language|spanish|french|grammar/.test(text)) {
                                                category = { label: "Language & Content", color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10", icon: <MessageCircle className="w-3 h-3" /> };
                                            }

                                            return (
                                                <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full border ${category.border} ${category.bg} animate-in fade-in zoom-in-50 duration-500`}>
                                                    <span className={`${category.color} animate-pulse`}>{category.icon}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${category.color}`}>
                                                        AI DETECTED: {category.label}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {proposal.owner && (
                                        <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-muted/30 border border-border/50 group hover:border-primary/30 transition-all">
                                            <Link href={`/profile/${proposal.ownerId}`} className="shrink-0">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden">
                                                        <Image
                                                            src={proposal.owner.avatarUrl || "/default-avatar.png"}
                                                            alt={proposal.owner.name || "User Avatar"}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
                                                </div>
                                            </Link>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Expert Mind</span>
                                                <Link href={`/profile/${proposal.ownerId}`} className="text-lg font-black text-foreground hover:text-primary transition-colors truncate">
                                                    {proposal.owner.name}
                                                </Link>
                                            </div>
                                            <div className="ml-auto">
                                                {proposal.owner.reputation && <ReputationBadge reputation={proposal.owner.reputation} size="sm" />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogHeader>

                            <div className="space-y-8 pb-32 md:pb-8">
                                <div className="relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-full" />
                                    <p className="pl-6 text-muted-foreground text-lg leading-relaxed font-medium">
                                        {proposal.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 bg-muted/20 p-8 rounded-3xl border border-border/50">
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">Teach</span>
                                        <div className="flex flex-wrap gap-2">
                                            {proposal.offeredSkills && proposal.offeredSkills.length > 0 ? (
                                                (Array.isArray(proposal.offeredSkills) ? proposal.offeredSkills : [proposal.offeredSkills]).map((s: any, i: number) => {
                                                    const isEndorsed = proposal.owner?.skills?.some((us: any) => us.skillId === s.id && us.source === "ENDORSED");
                                                    return (
                                                        <div key={s.id || i} className="relative group/skill">
                                                            <Badge variant="secondary" className={cn(
                                                                "px-4 py-2 rounded-xl text-sm font-black italic flex items-center gap-2 transition-all",
                                                                isEndorsed
                                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-none"
                                                                    : "bg-emerald-500/10 text-emerald-600 border-none"
                                                            )}>
                                                                {isEndorsed && <Check className="w-3 h-3 stroke-[4px]" />}
                                                                {getSkillName(s)}
                                                            </Badge>
                                                            {isEndorsed && (
                                                                <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-full shadow-lg scale-0 group-hover/skill:scale-100 transition-transform hidden sm:block">
                                                                    <Star className="w-3 h-3 fill-current" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-2 rounded-xl text-sm font-black italic">
                                                    Skill
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 block">Seek</span>
                                        <div className="flex flex-wrap gap-2">
                                            {neededSkills.map((s, i) => (
                                                <Badge key={(s as any).id || i} variant="secondary" className="bg-orange-500/10 text-orange-600 border-none px-4 py-2 rounded-xl text-sm font-black italic">
                                                    {getSkillName(s as any)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Reputation Insights Card */}
                                {proposal.owner?.reputation && (
                                    <div className="bg-gradient-to-br from-primary/[0.03] to-background p-6 rounded-[2rem] border border-primary/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary italic">Community Trust Score</h3>
                                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase font-black text-[9px] px-3 py-1">
                                                Level {proposal.owner.reputation.level} {proposal.owner.reputation.title}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-3 rounded-2xl bg-background/50 border border-border/50">
                                                <div className="text-xl font-black text-foreground">{proposal.owner.reputation.averageRating}/5</div>
                                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Avg Rating</div>
                                            </div>
                                            <div className="text-center p-3 rounded-2xl bg-background/50 border border-border/50">
                                                <div className="text-xl font-black text-foreground">{proposal.owner.reputation.completedSwaps}</div>
                                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Swaps</div>
                                            </div>
                                            <div className="text-center p-3 rounded-2xl bg-background/50 border border-border/50">
                                                <div className="text-xl font-black text-foreground">{proposal.owner.reputation.totalEndorsements}</div>
                                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Endorsed</div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium text-center italic opacity-70">
                                            Trust is built through successful exchanges. {proposal.owner.name} has earned {proposal.owner.reputation.reputationPoints} reputation points.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t border-border/10 p-6 sm:p-8 pt-6 !flex-col md:!flex-row !justify-between items-center gap-4 bg-background/95 backdrop-blur-xl shrink-0 sticky bottom-0 z-[100] md:relative">
                        <div className="w-full md:w-auto hidden md:block">
                            {!isOwner && (
                                <Button variant="ghost" size="sm" className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] hover:text-destructive transition-colors" asChild>
                                    <a href={`mailto:support@skilltrade.solutions?subject=Report%20Proposal:%20${proposal.title}&body=Proposal%20ID:%20${proposal.id}%0A%0AReason%20for%20reporting:`}>
                                        Flag Content
                                    </a>
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-4 items-center w-full md:w-auto">
                            {isOwner ? (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full md:w-auto h-14 rounded-2xl font-black uppercase tracking-tight px-8 hover:bg-primary/5 hover:text-primary transition-all gap-2">
                                        <Edit className="w-4 h-4" /> Edit
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete} disabled={loading} className="w-full md:w-auto h-14 rounded-2xl font-black uppercase tracking-tight px-8 shadow-xl shadow-destructive/10 hover:scale-105 active:scale-95 transition-all">
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
                                    </Button>
                                </>
                            ) : (
                                !isApplying ? (
                                    <Button onClick={() => setIsApplying(true)} className="h-16 w-full md:w-auto px-10 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3 haptic-touch">
                                        Request Swap <Zap className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                        <Textarea
                                            placeholder="Introduce yourself and explain why this is a perfect match..."
                                            value={pitch}
                                            onChange={e => setPitch(e.target.value)}
                                            className="min-h-[120px] rounded-2xl border-2 border-primary/20 focus:border-primary p-4 text-base font-medium"
                                        />
                                        <div className="flex gap-3">
                                            <Button variant="ghost" onClick={() => setIsApplying(false)} className="h-14 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</Button>
                                            <Button onClick={handleApply} disabled={loading} className="h-14 flex-[2] rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/10">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Send Request
                                            </Button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isEditing && (
                <PostProposalModal
                    isOpen={isEditing}
                    onOpenChange={setIsEditing}
                    proposal={proposal}
                />
            )}
        </>
    );
}
