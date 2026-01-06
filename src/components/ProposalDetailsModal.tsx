"use client";

import { useState } from "react";
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
import { Loader2, Trash2, Send, Zap, MapPin, Code2, Palette, Music, MessageCircle, Edit } from "lucide-react";
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

                <DialogContent className="max-w-xl p-0 rounded-[2.5rem] border-none shadow-2xl bg-background overflow-hidden flex flex-col h-[85vh]">
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
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        {modalityIcon}
                                    </div>
                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none uppercase tracking-widest text-[10px] font-black">
                                        {String(proposal.modality).replace("_", " ")}
                                    </Badge>
                                </div>
                                <div className="relative mb-2">
                                    <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-4 duration-700">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10 backdrop-blur-md">
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">AI Analysis</span>
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent" />
                                    </div>
                                    <DialogTitle className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9] break-words mix-blend-difference">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/50 animate-gradient-x">
                                            {proposal.title}
                                        </span>
                                    </DialogTitle>
                                    {(() => {
                                        const text = (proposal.title + " " + proposal.description).toLowerCase();
                                        let category = { label: "General Exchange", color: "text-slate-500", border: "border-slate-500/20", bg: "bg-slate-500/10", icon: <Zap className="w-3 h-3" /> };

                                        if (/react|javascript|typescript|code|web|app|dev|python|java|tech/.test(text)) {
                                            category = { label: "Software Engineering", color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10", icon: <Code2 className="w-3 h-3" /> };
                                        } else if (/design|ui|ux|art|draw|logo|adobe|figma|creative/.test(text)) {
                                            category = { label: "Creative & Design", color: "text-pink-500", border: "border-pink-500/20", bg: "bg-pink-500/10", icon: <Palette className="w-3 h-3" /> };
                                        } else if (/music|audio|song|guitar|piano|voice/.test(text)) {
                                            category = { label: "Music & Audio", color: "text-purple-500", border: "border-purple-500/20", bg: "bg-purple-500/10", icon: <Music className="w-3 h-3" /> };
                                        } else if (/write|english|content|translate|language/.test(text)) {
                                            category = { label: "Language & Content", color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10", icon: <MessageCircle className="w-3 h-3" /> };
                                        }

                                        return (
                                            <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full border ${category.border} ${category.bg} animate-in fade-in zoom-in-50 duration-500 delay-300`}>
                                                <span className={`${category.color} animate-pulse`}>{category.icon}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${category.color}`}>
                                                    {category.label}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {proposal.owner && (
                                    <div className="flex items-center gap-3 mt-6">
                                        <Link href={`/profile/${proposal.ownerId}`} className="group">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                Posted by <span className="text-primary font-black group-hover:underline">{proposal.owner.name}</span>
                                            </p>
                                        </Link>
                                        {proposal.owner.reputation && <ReputationBadge reputation={proposal.owner.reputation} size="sm" />}
                                    </div>
                                )}
                            </DialogHeader>

                            <div className="space-y-8">
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
                                                (Array.isArray(proposal.offeredSkills) ? proposal.offeredSkills : [proposal.offeredSkills]).map((s: any, i: number) => (
                                                    <Badge key={s.id || i} variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-2 rounded-xl text-sm font-black italic">
                                                        {getSkillName(s)}
                                                    </Badge>
                                                ))
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
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t border-border/10 p-8 pt-6 !flex-col md:!flex-row !justify-between items-center gap-4 bg-background/80 backdrop-blur-xl shrink-0">
                        <div className="w-full md:w-auto">
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
                                    <Button onClick={() => setIsApplying(true)} className="h-16 w-full md:w-auto px-10 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
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
