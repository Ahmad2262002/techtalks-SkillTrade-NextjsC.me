"use client";

import React, { useState } from 'react';
import Image from 'next/image';
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

interface ProposalCardProps {
  proposal: Proposal;
  isOwner?: boolean;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ProposalCard({
  proposal,
  isOwner = false,
  onDelete,
  className
}: ProposalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className={cn(
      "group relative flex flex-col h-full bg-card border border-border/50 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:-translate-y-2 hover:border-primary/30",
      className
    )}>
      {/* Cover Image Section */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {proposal.imageUrl ? (
          <Image
            src={proposal.imageUrl}
            alt={proposal.title}
            fill
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
          <h3 className="text-xl sm:text-2xl font-black text-foreground line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors duration-500 uppercase italic break-words">
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
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Offering
            </div>
            <div className="text-sm font-bold text-foreground truncate">{offered}{remainingOffered}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.6)]" /> Seeking
            </div>
            <div className="text-sm font-bold text-foreground truncate">
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
          {!isOwner && proposal.owner ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                <AvatarImage src={proposal.owner.avatarUrl || ""} />
                <AvatarFallback className="text-xs font-black">{proposal.owner.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">Posted by</span>
                <span className="text-xs font-black text-foreground truncate max-w-[100px]">{proposal.owner.name}</span>
              </div>
            </div>
          ) : isOwner ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Engagement</span>
              <span className="text-sm font-black text-foreground">{proposal._count?.applications || 0} Requests</span>
            </div>
          ) : (
            <div /> // Placeholder
          )}

          <div className="flex items-center gap-3">
            <ProposalDetailsModal
              proposal={proposal}
              isOwner={isOwner}
              isOpen={isModalOpen}
              onOpenChange={setIsModalOpen}
            />
            {isOwner && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(proposal.id);
                }}
                className="p-3 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all duration-300 shadow-xl shadow-destructive/5"
              >
                <Trash2 size={18} />
              </button>
            )}
            {!isOwner && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-xl shadow-primary/5 group/btn"
              >
                <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}