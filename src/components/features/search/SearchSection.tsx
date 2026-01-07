
"use client";

import React, { useState, useEffect } from "react";
import { listPublicProposals } from "@/actions/proposals";
import { createApplication } from "@/actions/applications";
import { Search, Filter, Grid, List, User, ArrowRightLeft, Star, CheckCircle, Zap, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ReputationBadge } from "@/components/ReputationBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProposalWithDetails = Awaited<ReturnType<typeof listPublicProposals>>[number];

// THE FIX:
// The `filtersData` constant was missing. It is now defined here.
const filtersData: Record<string, string[]> = {
  date: ["ANY", "Today", "This Week", "This Month"],
};


// Optimized Proposal Card Component
const ProposalCard = React.memo(({ item, isApplied, applyingId, handleApply }: {
  item: ProposalWithDetails,
  isApplied: boolean,
  applyingId: string | null,
  handleApply: (id: string) => void
}) => {
  const reputation = (item.owner as any).reputation;

  // Generate premium meshes based on item ID
  const meshColors = [
    { from: "#ec4899", via: "#f43f5e", shadow: "shadow-pink-500/20" }, // Pink/Rose
    { from: "#3b82f6", via: "#06b6d4", shadow: "shadow-blue-500/20" }, // Blue/Cyan
    { from: "#10b981", via: "#84cc16", shadow: "shadow-emerald-500/20" }, // Emerald/Lime
    { from: "#f59e0b", via: "#fbbf24", shadow: "shadow-amber-500/20" }, // Amber/Yellow
    { from: "#8b5cf6", via: "#6366f1", shadow: "shadow-violet-500/20" }, // Violet/Indigo
  ];
  const colorIndex = item.id.charCodeAt(0) % meshColors.length;
  const mesh = meshColors[colorIndex];

  return (
    <div className="group relative flex flex-col rounded-[2rem] sm:rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/50 transition-all duration-700 hover:shadow-[0_20px_80px_-20px_rgba(var(--primary-rgb),0.15)] overflow-hidden isolate">
      {/* Visual Header "Image" */}
      <div className="h-40 sm:h-48 w-full relative overflow-hidden shrink-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <>
            {/* Animated Background Mesh - Ported from Browse Hero */}
            <div
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-primary/30 rounded-full blur-[40px] opacity-60 group-hover:scale-150 transition-transform duration-[2000ms] animate-pulse"
              style={{ backgroundColor: mesh.from }}
            ></div>
            <div
              className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-24 h-24 bg-violet-500/20 rounded-full blur-[30px] opacity-60 animate-pulse-slow"
              style={{ backgroundColor: mesh.via }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </>
        )}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        {/* Reputation/Level Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 font-sans">
          {reputation && (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>LEVEL {reputation.level}</span>
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/10 backdrop-blur-md self-start border border-white/5 shadow-lg",
                reputation.color || "text-white"
              )}>
                {reputation.title}
              </div>
            </div>
          )}
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] fill-white/20" />
          </div>
        </div>

        {/* Rating Floating Badge */}
        {reputation?.averageRating > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-white backdrop-blur-xl rounded-xl text-black text-xs font-black shadow-2xl ring-1 ring-black/5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            {reputation.averageRating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 flex flex-col flex-1 relative">
        <div className="flex justify-between items-start mb-6 relative z-10">
          <Link href={`/profile/${item.owner.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group/owner">
            <Avatar className="h-14 w-14 border-[6px] border-card shadow-2xl -mt-16 sm:-mt-20 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/20">
              <AvatarImage src={item.owner.avatarUrl || ""} />
              <AvatarFallback className="font-black text-lg bg-gradient-to-br from-primary/10 to-primary/30 text-primary">{(item.owner.name || "U")[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col pt-1">
              <span className="font-black text-base text-foreground group-hover/owner:text-primary transition-colors leading-none tracking-tight">{item.owner.name || "Anonymous"}</span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em] mt-1.5 opacity-60">Verified {reputation?.title || "Mentor"}</span>
            </div>
          </Link>
        </div>

        <div className="mb-6 relative z-10 flex-1">
          <h3 className="font-black text-2xl text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-[1.1] tracking-tight">{item.title}</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">{item.description}</p>
        </div>

        <div className="mt-auto space-y-5">
          {/* Skills Grid - Premium Layout */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-[1.5rem] border border-border/50 backdrop-blur-sm group-hover:bg-muted/50 transition-colors">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500/80 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Offers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.offeredSkills.slice(0, 2).map(s => (
                  <Badge key={s.id} variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/10 text-[10px] font-bold px-2 py-0.5 h-6 hover:bg-emerald-500 hover:text-white transition-all cursor-default">{s.name}</Badge>
                ))}
                {item.offeredSkills.length > 2 && <span className="text-[10px] font-black text-muted-foreground/50 self-center">+{item.offeredSkills.length - 2}</span>}
              </div>
            </div>
            <div className="space-y-2 border-l border-border/50 pl-4">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-500/80 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                Needs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.neededSkills.slice(0, 2).map(s => (
                  <Badge key={s.id} variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/10 text-[10px] font-bold px-2 py-0.5 h-6 hover:bg-amber-500 hover:text-white transition-all cursor-default">{s.name}</Badge>
                ))}
                {item.neededSkills.length > 2 && <span className="text-[10px] font-black text-muted-foreground/50 self-center">+{item.neededSkills.length - 2}</span>}
              </div>
            </div>
          </div>

          <Button
            className={cn(
              "w-full h-14 rounded-2xl font-black text-sm transition-all duration-500 gap-3 shadow-2xl",
              isApplied
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-none cursor-default"
                : "bg-primary text-primary-foreground shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 group/btn"
            )}
            disabled={applyingId === item.id || isApplied}
            onClick={() => handleApply(item.id)}
          >
            {applyingId === item.id ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-[3px] border-current border-t-transparent rounded-full animate-spin" />
                <span className="tracking-widest uppercase text-xs">Processing</span>
              </div>
            ) : isApplied ? (
              <div className="flex items-center gap-2 uppercase tracking-widest text-xs">
                <CheckCircle className="w-5 h-5" />
                <span>Request Sent</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 uppercase tracking-[0.2em] text-xs">
                <ArrowRightLeft className="w-5 h-5 transition-transform group-hover/btn:rotate-180 duration-500" />
                <span>Initialize Swap</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});
ProposalCard.displayName = "ProposalCard";

export default function SearchSection() {
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedProposals, setAppliedProposals] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ANY");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProposals(searchText, activeFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, activeFilter]);

  const fetchProposals = async (query: string, filter: string) => {
    setLoading(true);
    try {
      // Map UI filter names to backend expected keys
      const dateRangeMap: Record<string, string> = {
        "Today": "today",
        "This Week": "week",
        "This Month": "month",
        "ANY": "ANY"
      };

      const data = await listPublicProposals({
        search: query,
        take: 1000, // Fetch all posts - no artificial limit
        dateRange: dateRangeMap[filter] || undefined,
        includeAllStatuses: true // Show all statuses (OPEN, IN_PROGRESS, CLOSED) to ensure users see their data
      });
      setProposals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (proposalId: string) => {
    setApplyingId(proposalId);
    try {
      await createApplication({ proposalId, pitchMessage: "I'm interested in this swap!" });
      setAppliedProposals(prev => new Set(prev).add(proposalId));
    } catch (error: any) {
      if (error.message?.includes("Unique constraint failed")) {
        setAppliedProposals(prev => new Set(prev).add(proposalId));
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setApplyingId(null);
    }
  };

  // With server-side filtering, we just use 'proposals' directly
  const filteredProposals = proposals;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-4 sm:gap-6 bg-card/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-border/50 backdrop-blur-xl sticky top-4 z-30 shadow-2xl shadow-primary/5">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          {/* Search Input - Full width on mobile, flex-1 on tablet+ */}
          <div className="flex-1 relative w-full group">
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-background/50 border-2 border-border rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-12 sm:pl-14 pr-4 sm:pr-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-base sm:text-lg"
            />
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>

          {/* Filter and View Mode Controls - Horizontal on all sizes, but filter takes full width on mobile */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex-1 md:flex-none h-12 sm:h-[60px] px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 transition-all gap-2 font-bold text-sm sm:text-base",
                showFilters ? "bg-primary/10 text-primary border-primary" : "hover:border-primary/50"
              )}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Filters</span>
            </Button>

            <div className="hidden md:flex bg-muted/50 p-1.5 rounded-2xl border-2 border-border h-[60px] items-center">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-xl h-10 w-10"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-xl h-10 w-10"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-4 pt-4 border-t border-border animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Time Posted:</span>
                <div className="flex flex-wrap gap-2">
                  {filtersData.date.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActiveFilter(opt)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 touch-manipulation",
                        activeFilter === opt
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground active:scale-95"
                      )}
                    >
                      {opt === "ANY" ? "All Time" : opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Smart Suggestion Badge */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-purple-500 fill-current animate-pulse" />
                  <span>AI Insight</span>
                </span>
                <div className="px-4 py-2 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold flex items-center gap-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative">Sorting by most relevant to your skills...</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-400 font-bold flex items-start gap-2">
              <div className="mt-0.5 min-w-[4px] h-1 w-1 rounded-full bg-blue-400" />
              <span>Showing all proposals (Open, In Progress, Closed).</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className={cn(
          "grid gap-4 sm:gap-6 md:gap-8",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-4xl mx-auto w-full"
        )}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-card/50 border-2 border-border/50 space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12 rounded-xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-3 w-12" /><Skeleton className="h-8 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-12" /><Skeleton className="h-8 w-full rounded-lg" /></div>
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(
          "grid gap-4 sm:gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" : "grid-cols-1 max-w-3xl mx-auto w-full"
        )}>
          {filteredProposals.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No matches found</h3>
              <p className="text-muted-foreground max-w-xs">Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
          ) : (
            filteredProposals.map((item) => (
              <ProposalCard
                key={item.id}
                item={item}
                isApplied={appliedProposals.has(item.id)}
                applyingId={applyingId}
                handleApply={handleApply}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}