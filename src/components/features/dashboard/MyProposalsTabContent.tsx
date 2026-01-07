"use client";

import React from "react";
import { Proposal } from "@/types/dashboard";
import { ProposalCard } from "@/components/ProposalCard";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from '../../../app/(dashboard)/dashboard/Dashboard.module.css';

interface MyProposalsTabContentProps {
    myProposals: Proposal[];
    handleDelete: (id: string) => void;
}

const EmptyState = ({ message }: { message: string }) => (
    <div className={cn(styles.emptyState, "group")}>
        <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary/10 to-transparent border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-700">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Layers className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
        </div>
        <p className="max-w-[200px] leading-relaxed opacity-60 font-medium text-sm sm:text-base">{message}</p>
    </div>
);

export const MyProposalsTabContent = React.memo(({ myProposals, handleDelete }: MyProposalsTabContentProps) => (
    <div className={cn(styles.cardGrid, "animate-in fade-in slide-in-from-bottom-8 duration-700")}>
        {myProposals.length === 0 ? (
            <EmptyState message="You haven't posted any proposals yet." />
        ) : (
            myProposals.map((p) => <ProposalCard key={p.id} proposal={p} isOwner onDelete={handleDelete} />)
        )}
    </div>
));

MyProposalsTabContent.displayName = "MyProposalsTabContent";
