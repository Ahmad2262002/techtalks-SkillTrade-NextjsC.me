"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, MapPin, Star, ShieldCheck } from "lucide-react";
import styles from "../../app/(public)/Landing.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Proposal } from "@/types/dashboard";
import Image from "next/image";
import { ProposalDetailsModal } from "../ProposalDetailsModal";

interface SpotlightProps {
    proposals: Proposal[];
}

export default function Spotlight({ proposals }: SpotlightProps) {
    const container = useRef<HTMLDivElement>(null);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Optimized GSAP Registration
    useGSAP(() => {
        if (typeof window !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top bottom",
                toggleActions: "play none none none",
                // fastScrollEnd: true, // Prevents animation overlap on fast scrolls
            }
        });

        tl.from(".animate-header-item", {
            y: 20,
            opacity: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "expo.out",
            clearProps: "all"
        })
            .from(".spotlight-card", {
                y: 30,
                opacity: 0,
                duration: 1.4,
                stagger: 0.05,
                ease: "expo.out",
                clearProps: "all"
            }, "-=1.0");

    }, { scope: container });

    if (!proposals || proposals.length === 0) return null;

    const formatSkills = (skills: Proposal['offeredSkills'] | Proposal['neededSkills']) => {
        if (!skills || !Array.isArray(skills) || skills.length === 0) return "N/A";
        const list = Array.isArray(skills) ? skills : [skills];
        const names = list.map(s => {
            if (typeof s === 'string') return s;
            return (s as any).name || (s as any).skill?.name || "N/A";
        });
        if (names.length <= 2) return names.join(", ");
        return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
    };

    return (
        <section ref={container} className={cn(styles.section, "will-change-transform")}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[100vw] h-[50vh] bg-primary/5 blur-[120px] rounded-full rotate-12 pointer-events-none" />

            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={cn(styles.eyebrow, "animate-header-item")}>Real-Time Protocol Activity</span>
                    <h2 className={cn(styles.sectionTitle, "animate-header-item")}>
                        Live <span className="text-primary">Syncs.</span>
                    </h2>
                    <p className={cn(styles.sectionDescription, "animate-header-item")}>
                        Watch the network expand as peers authenticate high-value knowledge exchanges across the globe.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {proposals.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setSelectedProposal(p);
                                setIsModalOpen(true);
                            }}
                            className={cn(
                                styles.glassCard,
                                "group relative p-3 overflow-hidden spotlight-card cursor-pointer flex flex-col transition-all duration-300 hover:border-primary/30 will-change-transform"
                            )}
                        >
                            <div className={styles.viscousGlow} />

                            {/* IMAGE: Fixed aspect ratio prevents "jumping" */}
                            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[1.2rem] border border-white/5 bg-neutral-900">
                                {p.imageUrl ? (
                                    <Image
                                        src={p.imageUrl}
                                        alt={p.title}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-center">
                                        <Zap className="w-10 h-10 text-primary/10" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

                                <div className="absolute top-3 right-3 z-10">
                                    <div className="bg-black/20 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">{p.modality}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="px-5 py-7 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="relative shrink-0">
                                        <Avatar className="h-9 w-9 border border-white/10 shadow-lg">
                                            <AvatarImage src={p.owner?.avatarUrl || ""} />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{p.owner?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                                            <ShieldCheck className="w-2 h-2 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-foreground truncate">{p.owner?.name}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-2 h-2 text-amber-500 fill-current" />
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest truncate">{p.owner?.reputation?.title || "Contributor"}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black tracking-tight mb-8 group-hover:text-primary transition-colors line-clamp-2 leading-[0.85] uppercase italic border-l-4 border-primary/20 pl-4">
                                    {p.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-3 p-4 rounded-[1.2rem] bg-white/[0.02] border border-white/5 mt-auto">
                                    <div className="min-w-0">
                                        <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-primary/60 block mb-0.5">Providing</span>
                                        <span className="text-[10px] font-bold truncate block uppercase tracking-tighter">{formatSkills(p.offeredSkills)}</span>
                                    </div>
                                    <div className="border-l border-white/10 pl-3 min-w-0">
                                        <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-orange-500/60 block mb-0.5">Seeking</span>
                                        <span className="text-[10px] font-bold truncate block uppercase tracking-tighter">{formatSkills(p.neededSkills)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProposal && (
                <ProposalDetailsModal
                    proposal={selectedProposal}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    isOwner={false}
                />
            )}
        </section>
    );
}