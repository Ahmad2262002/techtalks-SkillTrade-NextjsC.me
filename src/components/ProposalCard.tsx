"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Zap,
  MapPin,
  Trash2,
  UserCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReputationBadge } from "@/components/ReputationBadge";
import { ProposalDetailsModal } from "./ProposalDetailsModal";
import { Proposal } from "@/types/dashboard";
import { usePerformanceTier } from "@/lib/performance";


interface ProposalCardProps {
  proposal: Proposal;
  isOwner?: boolean;
  onDelete?: (id: string) => void;
  className?: string;
  priority?: boolean;
}

export function ProposalCard({
  proposal,
  isOwner = false,
  onDelete,
  className,
  priority = false
}: ProposalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const specs = usePerformanceTier();


  useGSAP(() => {
    // Hardware-Aware Tilt: Only engage on High/Ultra tiers
    if (window.innerWidth < 768 || specs?.tier === 'low' || specs?.tier === 'medium') return;

    const el = cardRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const xPercent = (x / width - 0.5) * 2;
      const yPercent = (y / height - 0.5) * 2;

      if (!el.classList.contains('hovering')) {
        el.classList.add('hovering');
      }

      gsap.to(el, {
        rotateY: xPercent * 5,
        rotateX: -yPercent * 5,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 1000,
      });

      if (glareRef.current) {
        gsap.to(glareRef.current, {
          x,
          y,
          opacity: 0.5,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateY: 0,
        rotateX: 0,
        duration: 1.2,
        ease: "power3.out"
      });
      if (glareRef.current) {
        gsap.to(glareRef.current, {
          opacity: 0,
          duration: 0.4
        });
      }
      el.classList.remove('hovering');
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, { scope: cardRef });

  const modalityIcon = proposal.modality === "REMOTE"
    ? <Zap size={14} className="text-sky-400" />
    : <MapPin size={14} className="text-indigo-400" />;

  // Extract skill names safely from various possible structures
  const getSkillName = (s: any) => (typeof s === 'string' ? s : s.name || s.skill?.name || "N/A");

  const offeredSkillsList = proposal.offeredSkills
    ? (Array.isArray(proposal.offeredSkills) ? proposal.offeredSkills : [proposal.offeredSkills])
    : [];

  const offered = offeredSkillsList.length > 0
    ? offeredSkillsList.map(getSkillName).slice(0, 2).join(", ")
    : "N/A";

  const remainingOffered = offeredSkillsList.length > 2
    ? ` +${offeredSkillsList.length - 2}`
    : "";

  const needed = Array.isArray(proposal.neededSkills)
    ? proposal.neededSkills.map(getSkillName).slice(0, 2).join(", ")
    : "N/A";

  const remainingNeeded = Array.isArray(proposal.neededSkills) && proposal.neededSkills.length > 2
    ? ` +${proposal.neededSkills.length - 2}`
    : "";

  const ownerLevel = proposal.owner?.reputation?.level || 1;

  const levelBarThemes: Record<number, string> = {
    1: "bg-white/5",
    2: "bg-white/10",
    3: "bg-white/20",
    4: "bg-primary/20",
    5: "bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col h-full bg-card border border-border/50 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:border-primary/30",
        className
      )}>
      {/* Subtle Level Accent - Maybach Restraint */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] z-20 transition-colors duration-1000", levelBarThemes[ownerLevel])} />
      {/* Dynamic Glare */}
      <div
        ref={glareRef}
        className="absolute pointer-events-none opacity-0 w-[200px] h-[200px] bg-white rounded-full blur-[100px] z-30 translate-x-[-50%] translate-y-[-50%]"
      />
      {/* Cover Image Section */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {proposal.imageUrl && !proposal.imageUrl.includes("unsplash.com/photos") ? (
          <Image
            src={proposal.imageUrl}
            alt={proposal.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Zap className="w-12 h-12 text-primary opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

        {/* Modality Badge Overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={cn(
            "px-3 py-1.5 rounded-xl border-none font-black text-[10px] uppercase tracking-widest flex items-center gap-2 backdrop-blur-md transition-all duration-500 group-hover:scale-110",
            proposal.modality === "REMOTE"
              ? "bg-sky-500/20 text-sky-400"
              : "bg-indigo-500/20 text-indigo-400"
          )}>
            {modalityIcon} {proposal.modality}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow p-6 sm:p-8 flex flex-col">
        {/* Visual Accent Line */}
        <div className="absolute top-0 left-0 w-1 h-1/2 bg-primary rounded-full opacity-30 group-hover:h-full transition-all duration-700" />

        <div className="mb-6">
          <h3 className="text-2xl sm:text-3xl font-playfair font-medium text-foreground line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors duration-700 italic px-1">
            {proposal.title}
          </h3>

          <div className="flex items-center gap-3 mt-4">
            {!isOwner && proposal.owner?.reputation && (
              <ReputationBadge reputation={proposal.owner.reputation} size="sm" />
            )}
            {isOwner && (
              <Badge variant="outline" className="border-primary/30 text-primary font-black text-[10px] uppercase tracking-widest px-3 py-1">My Post</Badge>
            )}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-primary/60">
              Offering
            </div>
            <div className="text-sm font-medium text-foreground/90 truncate">{offered}{remainingOffered}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              Seeking
            </div>
            <div className="text-sm font-medium text-foreground/70 truncate">
              {needed}{remainingNeeded}
            </div>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-8 font-medium italic opacity-70">
          &quot;{proposal.description}&quot;
        </p>

        {/* Owner / Meta Footer */}
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/50">
          {proposal.owner ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                <AvatarImage src={proposal.owner.avatarUrl || ""} />
                <AvatarFallback className="text-xs font-black">{proposal.owner.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">
                  {isOwner ? "My Post" : "Posted by"}
                </span>
                <span className="text-xs font-black text-foreground truncate max-w-[100px]">{proposal.owner.name}</span>
              </div>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end opacity-60">
              <span className="text-[10px] font-medium text-primary uppercase tracking-widest">Velocity</span>
              <span className="text-xs font-medium text-foreground">{proposal._count?.swaps || 0} Trades</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <ProposalDetailsModal
                proposal={proposal}
                isOwner={isOwner}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
              />
              <button
                onClick={() => {
                  setIsModalOpen(true);
                }}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-98 transition-all duration-500 shadow-2xl flex items-center justify-center group/btn haptic-touch select-none border-none"
                aria-label="View proposal details"
              >
                <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
              </button>
              {isOwner && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(proposal.id);
                  }}
                  className="p-3 rounded-full sm:rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all duration-300 shadow-xl shadow-destructive/5 haptic-touch active:scale-95 w-12 h-12 sm:w-auto sm:h-auto flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}