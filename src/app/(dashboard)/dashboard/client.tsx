"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { signOut } from "@/actions/auth";
import { getNotifications, markNotificationAsRead } from "@/actions/notifications";
import { deleteProposal } from "@/actions/proposal-actions";
import { Proposal, Swap, Application, LeaderboardEntry } from "@/types/dashboard";
import { createSwapFromApplication, updateSwapProgress, cancelSwap } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";
import { createReview } from "@/actions/reviews";
import styles from './Dashboard.module.css';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell, LogOut, Zap, Layers, UserCircle, Plus, Home, MessageSquare, Trophy, Star, AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NavSearchButton from "../../../components/features/search/NavSearchButton";
import { cn } from "@/lib/utils";
import { useAudioContext } from "@/context/AudioContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Fragmented Tab Components
import { BrowseTabContent } from "@/components/features/dashboard/BrowseTabContent";
import { MyProposalsTabContent } from "@/components/features/dashboard/MyProposalsTabContent";
import { ActiveSwapsTabContent } from "@/components/features/dashboard/ActiveSwapsTabContent";
import { LeaderboardTabContent } from "@/components/features/dashboard/LeaderboardTabContent";

// Heavy components dynamic imports
const TabAnimation = ({ activeTab, loading, children }: { activeTab: string, loading: boolean, children: React.ReactNode }) => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!container.current || loading) return;

    // Kill existing animations
    gsap.killTweensOf(container.current);

    gsap.fromTo(container.current,
      { opacity: 0, scale: 0.98, y: 10, filter: "blur(4px)" },
      { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out", clearProps: "all" }
    );
  }, { scope: container, dependencies: [loading, activeTab] });

  if (loading) {
    return (
      <div className="tab-content-wrapper pb-24 w-full h-[50vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] animate-pulse font-black">Syncing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="tab-content-wrapper pb-24 w-full">
      {children}
    </div>
  );
};

const PostProposalModal = dynamic(() => import("@/components/PostProposalModal").then(mod => mod.PostProposalModal), { ssr: false });
const ThemeSelector = dynamic(() => import("@/components/ThemeSelector").then(mod => mod.ThemeSelector), { ssr: false });

// --- Types ---
interface DashboardUser {
  id: string;
  name: string;
  avatarUrl?: string;
  industry?: string;
  skills?: any[];
}

interface DashboardProps {
  overview: {
    user: DashboardUser;
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
  const [notifications, setNotifications] = useState<Array<{ id: string; isRead: boolean; message: string; createdAt: Date; link?: string; type?: string; resourceId?: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPersonal, setShowPersonal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useAudioContext();

  const unreadMessagesCount = swaps?.reduce((acc, swap) => {
    const swapUnread = (swap as any).messages?.filter((m: any) => !m.isRead && String(m.senderId) !== String(overview.user?.id)).length || 0;
    return acc + swapUnread;
  }, 0) || 0;

  const [localMyProposals, setLocalMyProposals] = useState<Proposal[]>(myProposals);

  // Advanced Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);
  const [isGlobalTransition, setIsGlobalTransition] = useState(false);

  // When activeTab changes (e.g. from props update), stop loading
  // We add a minimum 800ms delay to ensure the animation feels purposeful
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    // Always trigger loading state for better UX
    setIsNavigating(true);

    // If clicking the current tab, we need a manual timeout to clear the state
    // since the prop 'activeTab' won't change to trigger the clearing useEffect
    if (tabId === activeTab) {
      setTimeout(() => setIsNavigating(false), 800);
      return;
    }

    // Mobile: Re-scroll to top
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setLocalMyProposals(myProposals);
  }, [myProposals]);

  // Review states
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingSwap, setReviewingSwap] = useState<Swap | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Monitor for modals to hide dock (State-based fallback)
    const checkModals = () => {
      const isLocked = document.body.style.position === 'fixed';
      const hasVisibleDialog = !!document.querySelector('[role="dialog"][data-state="open"]');
      const hasRadixDialog = !!document.querySelector('[data-radix-portal]');
      setIsModalActive(isLocked || hasVisibleDialog || hasRadixDialog);
    };

    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    // Initial check
    checkModals();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
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

    // Optimistic Update
    const originalProposals = [...localMyProposals];
    setLocalMyProposals(prev => prev.filter(p => p.id !== id));

    const res = await deleteProposal(id);
    if (res.success) {
      toast({ variant: "success", title: "Deleted", description: "Proposal removed." });
      router.refresh();
    } else {
      // Revert if failed
      setLocalMyProposals(originalProposals);
      toast({ variant: "destructive", title: "Error", description: res.message });
    }
  };

  const handleAccept = async (appId: string) => {
    setActiveLoadingId(`accept-${appId}`);
    try {
      await createSwapFromApplication(appId);
      toast({ variant: "success", title: "Accepted!", description: "Swap started." });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error accepting." }); }
    finally { setActiveLoadingId(null); }
  };

  const handleReject = async (appId: string) => {
    setActiveLoadingId(`reject-${appId}`);
    try {
      await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error rejecting." }); }
    finally { setActiveLoadingId(null); }
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit review.";
      setReviewError(message);
    }
  }

  const handleOpenReviewModal = (swap: Swap) => {
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
    "leaderboard": "Leaderboard"
  }[activeTab] || "Dashboard";

  if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Layout Entrance Animation (Runs once)
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(`.${styles.sidebar}`,
      { x: -30, opacity: 0, filter: "blur(10px)" },
      { x: 0, opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out", clearProps: "all" }
    )
      .fromTo(`.${styles.header}`,
        { y: -30, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out", clearProps: "all" },
        "-=1.1"
      )
      .fromTo(`.${styles.mainContent}`,
        { opacity: 0 },
        { opacity: 1, duration: 1.0, ease: "power2.out" },
        "-=0.8"
      );
  }, { scope: container });

  // Tab Content Transition - Removed for performance
  // Instant tab switching provides better UX than animated transitions

  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    playSound('logout');
    gsap.to(container.current, {
      opacity: 0,
      scale: 0.98,
      filter: "blur(20px)",
      duration: 1.2,
      ease: "expo.inOut",
      onComplete: () => {
        void (async () => {
          await signOut();
          // Use window.location to avoid Next.js routing errors after auth state change
          window.location.href = "/";
        })();
      }
    });
  };

  return (
    <>
      <div ref={container} className={cn(
        styles.dashboardLayout,
        loggingOut && "pointer-events-none",
        isGlobalTransition && "opacity-0 scale-95 filter blur-sm pointer-events-none transition-all duration-700 ease-in-out"
      )}>
        {/* Sidebar */}
        <aside className={cn(
          styles.sidebar,
          "lg:translate-x-0"
        )}>
          <div className={styles.animateSlideInRight}>
            <Link href="/" className={cn(styles.logo, "flex items-center gap-3 hover:scale-110 transition-all group")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
                <Image
                  src="/favicon.ico"
                  alt="SkillTrade Logo"
                  width={24}
                  height={24}
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Skill<span className="text-primary">Trade</span></span>
            </Link>
          </div>

          <nav className="flex flex-col gap-1">
            <p className={cn(styles.navGroupTitle, styles.animateSlideInRight)} style={{ animationDelay: '100ms' }}>Platform</p>
            <NavLink href="/dashboard?tab=browse" active={activeTab === "browse"} icon={<Layers className="w-5 h-5" />} label="Browse" activeTab={activeTab} onClick={() => handleTabClick("browse")} />
            <NavLink href="/dashboard?tab=my-proposals" active={activeTab === "my-proposals"} icon={<Zap className="w-5 h-5" />} label="My Proposals" activeTab={activeTab} onClick={() => handleTabClick("my-proposals")} />
            <NavLink
              href="/dashboard?tab=active-swaps"
              active={activeTab === "active-swaps"}
              icon={<MessageSquare className="w-5 h-5" />}
              label="Active Swaps"
              activeTab={activeTab}
              onClick={() => handleTabClick("active-swaps")}
            />
            <NavLink href="/dashboard?tab=leaderboard" active={activeTab === "leaderboard"} icon={<Trophy className="w-5 h-5" />} label="Leaderboard" activeTab={activeTab} onClick={() => handleTabClick("leaderboard")} />
          </nav>

          <div className={styles.sidebarFooter}>
            <button
              onClick={() => setShowPersonal(!showPersonal)}
              className={cn(styles.navLink, styles.animateSlideInRight, "w-full justify-between haptic-touch active:scale-95")}
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
                  <UserCircle className="w-4 h-4 text-primary" /><span>View Profile</span>
                </Link>
                <Link href="/" className={cn(styles.navLink, "hover:bg-muted pl-8")}>
                  <Home className="w-4 h-4 text-primary" /><span>Landing Page</span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        <main className={cn(styles.mainContent, "pb-36 lg:pb-10")}>
          <header className={cn(
            scrolled ? styles.scrolledHeader : styles.header,
            "z-[40]"
          )}>
            <div className={styles.satinShine} />
            <div className="flex items-center gap-4">
              <div>
                <h1 className={styles.headerTitle}>{tabTitle}</h1>
                <p className="text-muted-foreground mt-1.5 flex items-center gap-2 text-[10px] sm:text-base mb-1 sm:mb-0">
                  Welcome back, <span className="font-extrabold text-primary uppercase tracking-tight truncate max-w-[150px] sm:max-w-none inline-block align-bottom">{overview.user?.name || "User"}</span>!
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border hidden sm:flex">
                <NavSearchButton />
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <div className="sm:hidden">
                  <NavSearchButton />
                </div>
                <div className="flex items-center gap-2">
                  {mounted && (
                    <>
                      <PostProposalModal
                        userSkills={overview.user?.skills}
                        buttonText="Post"
                      />
                      <div className="flex items-center gap-2 border-l border-border/50 pl-2">
                        <ThemeSelector />
                        <Notifications
                          notifications={notifications}
                          unreadCount={unreadCount}
                          handleMarkRead={handleMarkRead}
                          activeLoadingId={activeLoadingId}
                          setActiveLoadingId={setActiveLoadingId}
                          onNavigate={setIsNavigating}
                          setGlobalFade={setIsGlobalTransition}
                        />
                        <UserMenu user={overview.user} onSignOut={handleSignOut} loggingOut={loggingOut} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <TabAnimation activeTab={activeTab} loading={isNavigating}>
            {activeTab === "browse" && <BrowseTabContent publicOnlyProposals={publicOnlyProposals} scrolled={scrolled} topMentors={overview.leaderboard} />}
            {activeTab === "my-proposals" && <MyProposalsTabContent myProposals={localMyProposals} handleDelete={handleDeleteProposal} />}
            {activeTab === "active-swaps" && (
              <ActiveSwapsTabContent
                applications={applications || []}
                swaps={swaps || []}
                user={overview.user}
                handleAccept={handleAccept}
                handleReject={handleReject}
                handleComplete={handleUpdateSwapProgress}
                handleCancel={handleCancelSwapAction}
                handleReview={handleOpenReviewModal}
                scrolled={scrolled}
                loadingId={activeLoadingId}
              />
            )}
            {activeTab === "leaderboard" && <LeaderboardTabContent leaderboard={overview.leaderboard || []} />}
          </TabAnimation>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Floating iOS Dock UI (Teleported to Body for Stickiness) */}
      {mounted && createPortal(
        <div className={cn(
          "fixed left-0 right-0 z-[40] md:hidden flex justify-center px-4 transition-all duration-700 pointer-events-none",
          isModalActive ? "translate-y-32 opacity-0" : "bottom-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))]"
        )}>
          <div className="relative flex justify-between items-center h-[72px] px-8 w-full max-w-[400px] bg-background/60 backdrop-blur-xl saturate-[160%] rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-20" />
            {[
              { id: "browse", icon: Layers, label: "Browse" },
              { id: "my-proposals", icon: Zap, label: "Me" },
              {
                id: "active-swaps",
                icon: MessageSquare,
                label: "Syncs"
              },
              { id: "leaderboard", icon: Trophy, label: "Top" }
            ].map((item) => (
              <Link
                key={item.id}
                href={`/dashboard?tab=${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 transition-all duration-300 active:scale-95 haptic-touch group",
                  activeTab === item.id ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl transition-all duration-500 relative",
                  activeTab === item.id ? "bg-primary/15 scale-110 shadow-[0_0_20px_rgba(var(--primary),0.2)]" : "bg-transparent"
                )}>
                  <item.icon className={cn("w-6 h-6 transition-all duration-500", activeTab === item.id && "fill-current")} />

                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                  activeTab === item.id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 h-0 overflow-hidden"
                )}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]" />
                )}
              </Link>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-background">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-10 py-12">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter uppercase italic break-words">Review {reviewingSwap?.proposal?.title}</DialogTitle>
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
    </>
  );
}

// --- Helper Components ---

const NavLink = ({ id, label, icon: Icon, delay = 0, href, active, activeTab, count = 0, onClick }: { id?: string, label: string, icon: any, delay?: number, href?: string, active?: boolean, activeTab?: string, count?: number, onClick?: () => void }) => {
  const isActive = active !== undefined ? active : activeTab === id;
  const finalHref = href || `?tab=${id}`;

  return (
    <Link
      href={finalHref}
      onClick={onClick}
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

const UserMenu = ({ user, onSignOut, loggingOut }: { user: DashboardUser, onSignOut: () => void, loggingOut: boolean }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-white/10 overflow-hidden hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 haptic-touch hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] shadow-lg">
          <Avatar className="h-full w-full">
            <AvatarImage src={user?.avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground font-black">{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-3xl border border-border/50 bg-popover/80 backdrop-blur-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] p-2 text-foreground animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="px-4 py-3 mb-2 border-b border-white/5">
          <p className="font-bold text-sm truncate">{user?.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Connected</p>
        </div>
        <DropdownMenuItem asChild className="rounded-xl focus:bg-white/10 cursor-pointer py-3 px-4 font-bold text-xs uppercase tracking-wide">
          <Link href={`/profile/${user?.id}`} className="flex items-center gap-3">
            <UserCircle className="w-4 h-4 text-primary" /> My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl focus:bg-white/10 cursor-pointer py-3 px-4 font-bold text-xs uppercase tracking-wide">
          <Link href="/" className="flex items-center gap-3">
            <Home className="w-4 h-4 text-primary" /> Landing Page
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5 my-1" />
        <DropdownMenuItem
          onClick={onSignOut}
          disabled={loggingOut}
          className="rounded-xl focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer py-3 px-4 font-bold text-xs uppercase tracking-wide text-rose-500/80 hover:text-rose-500 transition-colors disabled:opacity-50"
        >
          <span className="flex items-center gap-3">
            <LogOut className={cn("w-4 h-4", loggingOut && "animate-spin")} />
            {loggingOut ? "Disconnecting..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Notifications = ({
  notifications,
  unreadCount,
  handleMarkRead,
  activeLoadingId,
  setActiveLoadingId,
  onNavigate,
  setGlobalFade
}: {
  notifications: any[],
  unreadCount: number,
  handleMarkRead: (id: string) => Promise<void>,
  activeLoadingId: string | null,
  setActiveLoadingId: (id: string | null) => void,
  onNavigate?: (val: boolean) => void,
  setGlobalFade?: (val: boolean) => void
}) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-foreground hover:bg-white/20 hover:border-white/20 transition-all duration-500 hover:scale-110 active:scale-90 haptic-touch shadow-[0_8px_32px_rgba(0,0,0,0.12)] group">
          <Bell className={cn(
            "w-5 h-5 transition-transform duration-500 group-hover:rotate-12",
            unreadCount > 0 && styles.bellRing,
            unreadCount > 0 && "text-foreground"
          )} />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-2.5 right-2.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-background animate-ping opacity-75" />
              <span className="absolute top-2.5 right-2.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-background shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[90vw] max-w-[420px] h-[550px] flex flex-col rounded-[2.5rem] border border-white/10 bg-background/40 backdrop-blur-[60px] saturate-[250%] shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-0 text-foreground animate-in slide-in-from-top-4 fade-in zoom-in-95 duration-500 overflow-hidden ring-1 ring-white/10">
        <div className="p-7 border-b border-white/5 flex items-center justify-between bg-white/5">
          <DropdownMenuLabel className="text-xl font-black uppercase italic tracking-tighter">
            {unreadCount > 0 ? "Activity" : "Inbox"}
          </DropdownMenuLabel>
          {unreadCount > 0 && <Badge variant="secondary" className="bg-rose-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-black">{unreadCount} NEW</Badge>}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {(!notifications || notifications.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <Bell className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">All caught up</p>
            </div>
          ) : (
            notifications.map((n: any) => {
              const targetUrl = n.link
                ? n.link.replace(/tab=(applications|history)/, 'tab=active-swaps')
                : ((n.type === 'MESSAGE' || n.type === 'MESSAGE_RECEIVED' || n.type === 'SWAP_REQUEST') && n.resourceId)
                  ? `/dashboard?tab=active-swaps&swapId=${n.resourceId}`
                  : '/dashboard';

              return (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => {
                    // Mark as read without blocking navigation
                    handleMarkRead(n.id).catch(console.error);

                    // Trigger main content loading spinner
                    if (onNavigate) onNavigate(true);

                    router.push(targetUrl);
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl p-4 items-start gap-4 transition-all duration-300 border border-transparent relative overflow-hidden",
                    !n.isRead ? "bg-primary/5 border-primary/10 hover:bg-primary/15" : "hover:bg-foreground/5 opacity-70 hover:opacity-100",
                    activeLoadingId === `notif-${n.id}` && "opacity-50 pointer-events-none"
                  )}
                >
                  {activeLoadingId === `notif-${n.id}` && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 z-10 rounded-2xl">
                      <LoadingSpinner className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className={cn("mt-1 w-2 h-2 rounded-full shrink-0", !n.isRead ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-border")} />
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-xs sm:text-sm leading-relaxed", !n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                      {n.message}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu >
  );
};