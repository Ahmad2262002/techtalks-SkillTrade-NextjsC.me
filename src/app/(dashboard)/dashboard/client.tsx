"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/actions/auth";
import { getNotifications, markNotificationAsRead } from "@/actions/notifications";
import { deleteProposal } from "@/actions/proposal-actions";
import { ProposalCard } from "@/components/ProposalCard";
import { Proposal, Swap, Application, LeaderboardEntry } from "@/types/dashboard";
import { createSwapFromApplication, updateSwapStatus, updateSwapProgress, cancelSwap } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";
import { createReview } from "@/actions/reviews";
import styles from './Dashboard.module.css';

// UI Components
import { PostProposalModal } from "@/components/PostProposalModal";
import { ChatModal } from "@/components/ChatModal"; // Chat functionality is imported here
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import {
  Bell, LogOut, Zap, MapPin, Search, Layers, Trash2, CheckCircle, XCircle, UserCircle, Plus, Home, MessageSquare, Trophy, ArrowRight, Menu, X, MoreVertical, Star, AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NavSearchButton from "../../../components/features/search/NavSearchButton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReputationBadge } from "@/components/ReputationBadge";

// --- Types ---
interface DashboardProps {
  overview: {
    user: any;
    leaderboard?: LeaderboardEntry[];
  };
  myProposals: Proposal[];
  publicOnlyProposals: Proposal[];
  search: string;
  rawModality: string;
  activeTab: string;
  swaps: Swap[];
  applications: Application[];
}

// --- Main Client Component ---
export default function DashboardClientContent({
  overview, myProposals, publicOnlyProposals, activeTab, swaps, applications,
}: DashboardProps) {
  const [notifications, setNotifications] = useState<Array<{ id: string; isRead: boolean; message: string; createdAt: Date }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPersonal, setShowPersonal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Review states
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingSwap, setReviewingSwap] = useState<any | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteProposal(id);
    if (res.success) {
      toast({ variant: "success", title: "Deleted", description: "Proposal removed." });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: res.message });
    }
  };

  const handleAccept = async (appId: string) => {
    try {
      await createSwapFromApplication(appId);
      toast({ variant: "success", title: "Accepted!", description: "Swap started." });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error accepting." }); }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error rejecting." }); }
  };

  const handleUpdateSwapProgress = async (swapId: string) => {
    try {
      await updateSwapProgress(swapId);
      toast({ variant: "success", title: "Progress Updated", description: "Successfully updated swap completion status." });
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update completion status." });
    }
  };

  const handleCancelSwapAction = async (swapId: string) => {
    if (!confirm("Are you sure you want to cancel this swap? The proposal will be reopened.")) return;
    try {
      await cancelSwap(swapId);
      toast({ variant: "success", title: "Swap Cancelled", description: "The swap has been cancelled." });
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel swap." });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewError("Please select a rating.");
      return;
    }
    if (!reviewingSwap) return;

    try {
      await createReview({ swapId: reviewingSwap.id, rating, comment });
      toast({ variant: "success", title: "Review Submitted!", description: "Thank you for your feedback." });
      setReviewingSwap(null);
      setReviewModalOpen(false);
      setRating(0);
      setComment("");
      setReviewError("");
      router.refresh();
    } catch (error: any) {
      setReviewError(error.message || "Failed to submit review.");
    }
  }

  const handleOpenReviewModal = (swap: any) => {
    setReviewingSwap(swap);
    setReviewModalOpen(true);
    setRating(0);
    setComment("");
    setReviewError("");
  };



  const tabTitle = {
    "browse": "Explore Skills",
    "my-proposals": "My Proposals",
    "active-swaps": "Active Swaps",
  }[activeTab] || "Dashboard";

  if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  useGSAP(() => {
    // Entrance Animation - Simplified to Opacity Only to prevent Sticky/Transform conflicts
    const tl = gsap.timeline();
    tl.fromTo(`.${styles.sidebar}`,
      { opacity: 0 },
      { opacity: 1, duration: 1.0, ease: "power2.out" }
    )
      .fromTo(`.${styles.header}`,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(`.${styles.mainContent}`,
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: "power2.out" },
        "-=0.6"
      );

    // Scroll-based parallax removed to prevent jitter/glitching with sticky positioning.
    // Sticky positioning handles the layouts behavior natively and smoother.

  }, { scope: container, dependencies: [activeTab, scrolled] });

  return (
    <div ref={container} className={styles.dashboardLayout}>
      {/* Mobile Backdrop */}
      <aside className={cn(
        styles.sidebar,
        "lg:translate-x-0"
      )}>
        <div className={styles.animateSlideInRight}>
          <Link href="/" className={cn(styles.logo, "flex items-center gap-3 hover:scale-110 transition-all group")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
              <Image
                src="/favicon.ico"
                alt="SkillSync Logo"
                width={24}
                height={24}
                className="object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Skill<span className="text-primary">Sync</span></span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1">
          <p className={cn(styles.navGroupTitle, styles.animateSlideInRight)} style={{ animationDelay: '100ms' }}>Platform</p>
          <NavLink href="/dashboard?tab=browse" active={activeTab === "browse"} icon={<Layers className="w-5 h-5" />} label="Browse" activeTab={activeTab} setIsSidebarOpen={setIsSidebarOpen} />
          <NavLink href="/dashboard?tab=my-proposals" active={activeTab === "my-proposals"} icon={<Zap className="w-5 h-5" />} label="My Proposals" activeTab={activeTab} setIsSidebarOpen={setIsSidebarOpen} />
          <NavLink
            href="/dashboard?tab=active-swaps"
            active={activeTab === "active-swaps"}
            icon={<MessageSquare className="w-5 h-5" />}
            label="Active Swaps"
            activeTab={activeTab}
            setIsSidebarOpen={setIsSidebarOpen}
            count={swaps.reduce((acc, s) => acc + ((s as any).messages?.length || 0), 0)}
          />
          <NavLink href="/dashboard?tab=leaderboard" active={activeTab === "leaderboard"} icon={<Trophy className="w-5 h-5" />} label="Leaderboard" activeTab={activeTab} setIsSidebarOpen={setIsSidebarOpen} />
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            onClick={() => setShowPersonal(!showPersonal)}
            className={cn(styles.navLink, styles.animateSlideInRight, "w-full justify-between")}
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5" />
              <span>Account</span>
            </div>
            <div className={cn("transition-transform duration-300", showPersonal ? "rotate-180" : "rotate-0")}>
              <Plus className="w-4 h-4 opacity-50" />
            </div>
          </button>

          {showPersonal && (
            <div className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-4 fade-in duration-300">
              <Link href={`/profile/${overview.user?.id}`} className={cn(styles.navLink, "hover:bg-muted pl-8")}>
                <UserCircle className="w-4 h-4" /><span>View Profile</span>
              </Link>
              <Link href="/" className={cn(styles.navLink, "hover:bg-muted pl-8")}>
                <Home className="w-4 h-4" /><span>Landing Page</span>
              </Link>
              <button onClick={() => signOut()} className={cn(styles.navLink, "w-full text-rose-500 hover:bg-rose-500/10 pl-8 font-black")}>
                <LogOut className="w-4 h-4" /><span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className={cn(styles.mainContent, "pb-24 lg:pb-10")}>
        <header className={cn(
          styles.header,
          "sticky top-0 z-[40] transition-all duration-700 px-8 rounded-[2.5rem] flex items-center justify-between",
          scrolled
            ? "py-4 bg-background/60 backdrop-blur-2xl shadow-2xl border border-white/5 scale-[0.98] mt-4"
            : "py-6 sm:py-10 bg-transparent"
        )}>
          <div className="flex items-center gap-4">
            <div>
              <h1 className={styles.headerTitle}>{tabTitle}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs sm:text-base">
                Welcome back, <span className="font-extrabold text-primary uppercase tracking-tight">{overview.user?.name || "User"}</span>!
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border hidden sm:flex">
              <NavSearchButton />
            </div>
            {/* Mobile simplified header actions */}
            <div className="sm:hidden">
              <NavSearchButton />
            </div>
            <PostProposalModal userSkills={overview.user?.skills} />
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-border/50">
              <div className="hidden sm:block"><ThemeCustomizer /></div>
              <Notifications notifications={notifications} unreadCount={unreadCount} handleMarkRead={handleMarkRead} />
              <UserMenu user={overview.user} />
            </div>
          </div>
        </header>

        <div className="animate-fade-in delay-150">
          {activeTab === "browse" && <BrowseTabContent publicOnlyProposals={publicOnlyProposals} scrolled={scrolled} />}
          {activeTab === "my-proposals" && <MyProposalsTabContent myProposals={myProposals} handleDelete={handleDeleteProposal} />}
          {activeTab === "active-swaps" && <ActiveSwapsTabContent applications={applications} swaps={swaps} user={overview.user} handleAccept={handleAccept} handleReject={handleReject} handleComplete={handleUpdateSwapProgress} handleCancel={handleCancelSwapAction} handleReview={handleOpenReviewModal} scrolled={scrolled} />}
          {activeTab === "leaderboard" && <LeaderboardTabContent leaderboard={overview.leaderboard} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-background/60 backdrop-blur-2xl border-t border-white/10 lg:hidden pb-safe safe-area-inset-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/dashboard?tab=browse" className={cn("flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 w-16 active:scale-90", activeTab === "browse" ? "text-primary" : "text-muted-foreground opacity-60 hover:opacity-100")}>
            <div className={cn("p-1.5 rounded-xl transition-all", activeTab === "browse" ? "bg-primary/10" : "")}>
              <Layers className={cn("w-6 h-6", activeTab === "browse" && "fill-current")} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest scale-90">Browse</span>
          </Link>
          <Link href="/dashboard?tab=my-proposals" className={cn("flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 w-16 active:scale-90", activeTab === "my-proposals" ? "text-primary" : "text-muted-foreground opacity-60 hover:opacity-100")}>
            <div className={cn("p-1.5 rounded-xl transition-all", activeTab === "my-proposals" ? "bg-primary/10" : "")}>
              <Zap className={cn("w-6 h-6", activeTab === "my-proposals" && "fill-current")} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest scale-90">Me</span>
          </Link>
          <Link href="/dashboard?tab=active-swaps" className={cn("relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 w-16 active:scale-90", activeTab === "active-swaps" ? "text-primary" : "text-muted-foreground opacity-60 hover:opacity-100")}>
            <div className={cn("relative p-1.5 rounded-xl transition-all", activeTab === "active-swaps" ? "bg-primary/10" : "")}>
              <MessageSquare className={cn("w-6 h-6", activeTab === "active-swaps" && "fill-current")} />
              {swaps.reduce((acc, s) => acc + ((s as any).messages?.length || 0), 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest scale-90">Syncs</span>
          </Link>
          <Link href="/dashboard?tab=leaderboard" className={cn("flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 w-16 active:scale-90", activeTab === "leaderboard" ? "text-primary" : "text-muted-foreground opacity-60 hover:opacity-100")}>
            <div className={cn("p-1.5 rounded-xl transition-all", activeTab === "leaderboard" ? "bg-primary/10" : "")}>
              <Trophy className={cn("w-6 h-6", activeTab === "leaderboard" && "fill-current")} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest scale-90">Top</span>
          </Link>
        </div>
      </div>
      <Dialog open={isReviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-background">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-10 py-12">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Review {reviewingSwap?.proposal?.title}</DialogTitle>
              <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2 opacity-70">
                How was your experience with {reviewingSwap?.teacherId === overview.user?.id ? reviewingSwap?.student.name : reviewingSwap?.teacher.name}?
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReviewSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Rating</Label>
                  <div className="flex items-center gap-2 mt-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`cursor-pointer h-10 w-10 transition-all hover:scale-110 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30 hover:text-amber-400/50'}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-xs font-black uppercase tracking-widest text-primary ml-1">Comment (Optional)</Label>
                  <Textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." className="min-h-[120px] rounded-2xl border-2 border-border focus:border-primary transition-all font-medium p-4" />
                </div>
                {reviewError && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />{reviewError}
                  </div>
                )}
              </div>
              <DialogFooter className="pt-4 flex gap-3">
                <Button type="button" variant="ghost" className="rounded-xl h-14 font-black uppercase tracking-widest text-xs" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Submit Review</Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-Components ---

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
        {/* Animated Background Mesh */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] group-hover:bg-secondary/20 transition-all duration-1000" />

        {/* Partner Info Section */}
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

            <h3 className="font-black text-3xl md:text-4xl tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500 uppercase italic leading-none mb-2 truncate">
              {partner.name}
            </h3>

            <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-4 opacity-80 flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-px bg-primary/30" />
              <span className="truncate">Active Sync: <strong className="text-foreground">{swap.proposal?.title}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
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
                <a href={`mailto:support@skillswap.com?subject=Incident%20Report:%20${swap.proposal?.title}&body=Sync%20ID:%20${swap.id}`}>Report Incident</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div >
  );
});
SwapCard.displayName = "SwapCard";

const ActiveSwapsTabContent = ({ applications, swaps, user, handleAccept, handleReject, handleComplete, handleCancel, handleReview, scrolled }: any) => {
  const router = useRouter();
  const pendingApps = applications.filter((a: any) => a.status === "PENDING");
  return (
    <div className="space-y-24 pb-20">
      {pendingApps.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className={cn(
            "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sticky transition-all duration-500 z-[20] py-4 rounded-[2rem]",
            scrolled ? "top-[5.5rem] bg-background/40 backdrop-blur-md px-6 shadow-lg border border-white/5 scale-95" : "top-0"
          )}>
            <div>
              <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-4 transition-all">
                Requests <span className="text-primary opacity-20 text-3xl">/ {pendingApps.length}</span>
              </h2>
              <p className="text-muted-foreground font-bold mt-2 max-w-md uppercase tracking-widest text-[10px] opacity-60">Success potential: High</p>
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
          "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sticky transition-all duration-500 z-[20] py-4 rounded-[2rem]",
          scrolled ? "top-[5.5rem] bg-background/40 backdrop-blur-md px-6 shadow-lg border border-white/5 scale-95" : "top-0"
        )}>
          <div>
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-none flex items-center gap-4 transition-all">
              Syncs <span className="text-emerald-500 opacity-20 text-3xl">/ {swaps.length}</span>
            </h2>
            <p className="text-muted-foreground font-bold mt-2 max-w-md uppercase tracking-widest text-[10px] opacity-60">Ongoing collaborations</p>
          </div>
          <div className="h-px flex-1 bg-border/50 hidden md:block mx-10 mb-2" />
        </div>

        {swaps.length === 0 ? (
          <div className={cn(styles.emptyState, "py-32 relative group overflow-hidden bg-background/5 border-none shadow-none")}>
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] group-hover:bg-primary/10 transition-all duration-[2000ms]" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="p-12 rounded-[4rem] bg-gradient-to-br from-primary/10 to-transparent border-t border-l border-white/10 mb-10 rotate-6 group-hover:rotate-12 transition-all duration-1000 shadow-2xl scale-110">
                <Zap className="w-24 h-24 text-primary opacity-60 animate-pulse" />
              </div>
              <h3 className="font-black text-6xl uppercase tracking-tighter italic leading-none mb-6">Sync Pending</h3>
              <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs opacity-60 max-w-sm text-center leading-loose">
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
};


// --- Other Helper Components (Unchanged) ---

// --- Moved NavLink outside to fix render issues ---
const NavLink = ({ id, label, icon: Icon, delay = 0, href, active, activeTab, setIsSidebarOpen, count }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const isActive = active !== undefined ? active : activeTab === id;
  const finalHref = href || `?tab=${id}`;

  return (
    <Link
      href={finalHref}
      onClick={() => setIsSidebarOpen(false)}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        styles.navLink,
        isActive && styles.active,
        styles.animateSlideInRight,
        "group"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        {React.isValidElement(Icon) ? (
          <span className={cn(
            "transition-colors",
            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
          )}>
            {Icon}
          </span>
        ) : (
          <Icon
            className={cn(
              "w-5 h-5 transition-colors",
              isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
            )}
          />
        )}
        <span className={cn("font-bold tracking-tight", isActive ? "text-primary-foreground" : "group-hover:text-primary")}>{label}</span>
      </div>
      {count > 0 && (
        <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[1.2rem] text-center shadow-lg shadow-rose-500/20 mr-2">
          {count}
        </span>
      )}
      {isActive && (
        <span className="w-2 h-2 bg-primary-foreground rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
      )}
    </Link>
  );
};
NavLink.displayName = "NavLink";

const BrowseTabContent = ({ publicOnlyProposals, scrolled }: { publicOnlyProposals: Proposal[], scrolled: boolean }) => {
  // Sort proposals by reputation for spotlight
  const sortedByRep = [...publicOnlyProposals].sort((a, b) =>
    (b.owner?.reputation?.reputationPoints || 0) - (a.owner?.reputation?.reputationPoints || 0)
  ).slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-12 duration-[1500ms] ease-out">
      <div className="flex-1 space-y-10">
        {/* Skill Explorer Header */}
        <section className="p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-2xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-[1200ms]">
            <Layers className="w-32 h-32 sm:w-48 sm:h-48" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tighter">Skill Explorer</h2>
            <p className="text-muted-foreground font-medium max-w-md mb-8 text-sm sm:text-lg opacity-80">Discover over 150 unique skills being traded right now by experts around the globe.</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["React", "UI Design", "Python", "Marketing", "Piano", "Cooking"].map((skill, i) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-background border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer font-black text-xs sm:text-sm shadow-xl shadow-black/5 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile-Only Top Mentors Preview */}
        <div className="lg:hidden space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Mentors</h3>
            <Link href="/dashboard?tab=leaderboard" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
            {sortedByRep.map((p) => (
              <Link href={`/profile/${p.ownerId}`} key={p.id} className="snap-start min-w-[240px] p-4 rounded-3xl bg-card border border-border flex items-center gap-4 shadow-sm">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={p.owner?.avatarUrl || ""} />
                  <AvatarFallback className="font-bold text-sm">{(p.owner?.name?.[0] || "U")}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold truncate text-sm">{p.owner?.name}</span>
                  <span className="text-[10px] uppercase font-black text-primary">{p.owner?.reputation?.title || "Member"}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Feed */}
        <div className={styles.cardGrid}>
          {publicOnlyProposals.length === 0 ? (
            <EmptyState message="No public proposals found. Be the first to post!" />
          ) : (
            publicOnlyProposals.map((p, i) => (
              <div key={p.id} className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out" style={{ animationDelay: `${i * 150}ms` }}>
                <ProposalCard proposal={p} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Spotlight - Sticky Container */}
      <aside
        className={cn(
          styles.spotlight,
          "lg:w-80 shrink-0 space-y-8 animate-in fade-in zoom-in-95 duration-700 hidden lg:block",
          "sticky transition-all duration-700",
          scrolled ? "top-[6rem]" : "top-[8rem]"
        )}
        style={{ maxHeight: scrolled ? 'calc(100vh - 7rem)' : 'calc(100vh - 9rem)' }}
      >
        {/* Top Mentors Section - Sticky */}
        <section className="p-8 rounded-[3rem] bg-card border border-border shadow-2xl shadow-black/5 relative overflow-hidden hover:shadow-intense transition-all duration-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Top Mentors</h3>
          </div>
          <div className="space-y-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2">
            {sortedByRep.map((p, i) => (
              <Link href={`/profile/${p.ownerId}`} key={p.id} className="flex items-center gap-4 group transition-all hover:translate-x-1 duration-500">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                    <AvatarImage src={p.owner?.avatarUrl || ""} />
                    <AvatarFallback className="font-black text-lg">{(p.owner?.name?.[0] || "U")}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center text-[10px] font-black shadow-lg">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-black text-foreground group-hover:text-primary transition-colors truncate">{p.owner?.name}</span>
                  {p.owner?.reputation && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-primary/70 uppercase">{p.owner.reputation.title}</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground">LVL {p.owner.reputation.level}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link href="/dashboard?tab=leaderboard">
            <Button variant="outline" className="w-full mt-6 rounded-2xl h-12 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary transition-all hover:scale-105">
              Full Leaderboard
            </Button>
          </Link>
        </section>

        {/* Need Help Section - Sticky */}
        <Link href="/#contact" className="block">
          <section className="p-8 rounded-[3rem] bg-muted/50 border border-border/50 relative group cursor-pointer hover:bg-muted transition-all duration-700 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[3rem]" />
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Need Help?</h3>
              <p className="text-xs font-medium text-muted-foreground mb-4 leading-relaxed">Check out our community guidelines and learn how to swap like a pro.</p>
              <div className="flex items-center gap-2 text-xs font-black text-primary group-hover:gap-3 transition-all">
                Contact Support <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        </Link>
      </aside>
    </div>
  );
};

const LeaderboardTabContent = ({ leaderboard }: { leaderboard?: LeaderboardEntry[] }) => (
  <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-[1500ms] pb-20">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-4xl font-black tracking-tighter uppercase italic">Global Board</h2>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] opacity-60">Rankings based on reputation & successful swaps</p>
      </div>
      <div className="hidden md:flex p-5 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner">
        <Trophy className="w-10 h-10 text-primary animate-pulse" />
      </div>
    </div>

    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
      <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Mentor</div>
        <div className="col-span-3 text-center">Title</div>
        <div className="col-span-3 text-right">Reputation</div>
      </div>
      <div className="divide-y divide-border/50">
        {leaderboard?.map((entry, i) => (
          <Link href={`/profile/${entry.id}`} key={entry.id}
            className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/50 transition-colors group">
            <div className="col-span-1 font-black text-lg opacity-40 group-hover:opacity-100 transition-opacity">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </div>
            <div className="col-span-11 md:col-span-5 flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-all">
                <AvatarImage src={entry.avatarUrl || ""} />
                <AvatarFallback className="font-bold">{entry.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-foreground group-hover:text-primary transition-colors truncate">{entry.name}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{entry.industry || "Generalist"}</span>
              </div>
            </div>
            <div className="hidden md:block col-span-3 text-center">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                entry.reputation.color,
                entry.reputation.color.replace('text-', 'bg-') + "/10"
              )}>
                {entry.reputation.title}
              </span>
            </div>
            <div className="col-span-11 md:col-span-3 text-right">
              <div className="flex flex-col items-end">
                <span className="font-black text-lg text-primary">{entry.reputation.reputationPoints.toLocaleString()}</span>
                <span className="text-[10px] font-bold opacity-50 uppercase">Points</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const MyProposalsTabContent = ({ myProposals, handleDelete }: { myProposals: Proposal[], handleDelete: (id: string) => void }) => (
  <div className={cn(styles.cardGrid, "animate-in fade-in slide-in-from-bottom-10 duration-[1200ms]")}>
    {myProposals.length === 0 ? (
      <EmptyState message="You haven't posted any proposals yet." />
    ) : (
      myProposals.map((p) => <ProposalCard key={p.id} proposal={p} isOwner onDelete={handleDelete} />)
    )}
  </div>
);

// ProposalCard is now imported from its own file.

const ApplicationCard = React.memo(({ app, onAccept, onReject }: {
  app: Application,
  onAccept: (id: string) => void,
  onReject: (id: string) => void
}) => (
  <div className={cn(
    styles.applicationCard,
    "group relative overflow-hidden transition-all duration-1000 rounded-[3.5rem] p-1 bg-gradient-to-br from-orange-500/20 via-border/40 to-primary/10 hover:from-orange-500/40 border-none shadow-2xl"
  )}>
    <div className="bg-card/90 backdrop-blur-3xl rounded-[3.4rem] p-12 h-full flex flex-col relative overflow-hidden">
      {/* Decorative Background Element */}
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
              <Link href={`/profile/${app.applicant.id}`} className="font-black text-5xl text-foreground hover:text-primary transition-all duration-500 block leading-[0.85] tracking-tighter uppercase italic drop-shadow-sm">{app.applicant.name}</Link>
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
          <p className="text-2xl text-foreground leading-tight font-black italic tracking-tighter uppercase text-center max-w-md">
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

const UserMenu = ({ user }: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="h-10 w-10 rounded-full border-2 border-border overflow-hidden hover:border-primary transition-colors">
        <Avatar><AvatarImage src={user?.avatarUrl || ""} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
      <DropdownMenuItem asChild><Link href={`/profile/${user?.id}`} className="cursor-pointer">My Profile</Link></DropdownMenuItem>
      <DropdownMenuSeparator className="bg-border" />
      <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Notifications = ({ notifications, unreadCount, handleMarkRead }: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="relative h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80 bg-popover border-border text-popover-foreground">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-border" />
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
        ) : (
          notifications.map((n: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <DropdownMenuItem key={n.id} onClick={() => handleMarkRead(n.id)} className={`cursor-pointer ${!n.isRead ? 'bg-primary/10' : ''}`}>
              <div>
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className={styles.emptyState}>
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background border-border mb-4">
      <Layers className="h-8 w-8 text-muted-foreground" />
    </div>
    <p>{message}</p>
  </div>
);