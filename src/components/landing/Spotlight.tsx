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
            if (window.innerWidth < 768) return; // Skip animations on mobile to ensure visibility
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {proposals.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setSelectedProposal(p);
                                setIsModalOpen(true);
                            }}
                            className={cn(
                                styles.glassCard,
                                "group relative p-3 overflow-hidden spotlight-card cursor-pointer flex flex-col transition-all duration-300 hover:border-primary/30 will-change-transform",
                                "active:scale-95 md:hover:scale-[1.02]" // Subtle touch feedback
                            )}
                        >
                            <div className={styles.viscousGlow} />

                            {/* IMAGE: Fixed aspect ratio prevents "jumping" */}
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1rem] border border-white/5 bg-neutral-900 shadow-inner">
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

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                                <div className="absolute top-3 right-3 z-10">
                                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">{p.modality}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="px-3 py-5 flex flex-col flex-grow relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative shrink-0">
                                        <Avatar className="h-8 w-8 border border-foreground/10 shadow-lg ring-2 ring-background">
                                            <AvatarImage src={p.owner?.avatarUrl || ""} />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{p.owner?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                                            <ShieldCheck className="w-2 h-2 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{p.owner?.name}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-2 h-2 text-amber-500 fill-current" />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{p.owner?.reputation?.title || "Contributor"}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-black tracking-tighter mb-6 group-hover:text-primary transition-colors line-clamp-2 leading-[1.1] text-balance">
                                    {p.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/5 min-w-0">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary/70 block mb-1">Offered</span>
                                        <span className="text-[11px] font-bold truncate block">{formatSkills(p.offeredSkills)}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/5 min-w-0">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-orange-500/70 block mb-1">Needed</span>
                                        <span className="text-[11px] font-bold truncate block">{formatSkills(p.neededSkills)}</span>
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