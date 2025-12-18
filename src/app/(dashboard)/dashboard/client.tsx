<<<<<<< HEAD:src/app/(dashboard)/dashboard/client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "@/actions/notifications";
import NavSearchButton from "../../../components/features/search/NavSearchButton";



import { deleteProposal } from "@/actions/proposal-actions";
import { createSwapFromApplication } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";

// UI Components
import { ProposalModal } from "@/components/ProposalModal"; // OLD Visuals
import { ChatModal } from "@/components/ChatModal"; // NEW Feature
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal"; // NEW Feature logic wrapped
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  LogOut,
  Zap,
  MapPin,
  Search,
  Layers,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import SearchSection from "../../../components/features/search/SearchSection";


// --- Types ---
interface DashboardProps {
  overview: any;
  myProposals: any[];
  publicOnlyProposals: any[];
  search: string;
  rawModality: string;
  activeTab: string;
  swaps: any[];
  applications: any[];
}

export default function DashboardClientContent({
  overview,
  myProposals,
  publicOnlyProposals,
  search,
  rawModality,
  activeTab,
  swaps,
  applications,
}: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  // --- Notifications Logic (New Feature) ---
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // --- Delete Logic (Old Feature, New Action) ---
  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal?")) return;
    try {
      const res = await deleteProposal(id);
      if (res.success) {
        toast({ title: "Deleted", description: "Proposal removed successfully" });
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch (e) { alert("Failed to delete"); }
  };

  // --- Swap Logic (New Feature) ---
  const handleAccept = async (appId: string) => {
    try {
      await createSwapFromApplication(appId);
      toast({ title: "Accepted!", description: "Swap started." });
      router.refresh();
    } catch (e) { alert("Error accepting application"); }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
      router.refresh();
    } catch (e) { alert("Error rejecting application"); }
  };

  // --- Render Helpers ---
  const TabButton = ({ id, label, icon: Icon }: any) => {
    const isActive = activeTab === id;
    // Construct URL preserving other params if needed, but for now simple links
    const href = `?tab=${id}`;
    
    return (
      <Link
        href={href}
        className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
        {label}
        {isActive && (
          <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-sky-500/30 font-sans pb-20">
      {/* Background Gradients (Old Style) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col gap-6 py-8 md:flex-row md:items-end md:justify-between mb-8">
          <div>
       <Link href="/">
  <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400 mb-2">
    SkillTrade Dashboard
  </p>
</Link>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                {overview.user?.name || "User"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
<NavSearchButton />


            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-500/40 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]"
            >
              <span className="mr-2 text-lg leading-none">+</span>
              <span className="inline-flex items-center justify-center">Post Proposal</span>
            </button>

            {/* Notifications (New Feature) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-100">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem 
                        key={n.id} 
                        onClick={() => handleMarkRead(n.id)}
                        className={`cursor-pointer border-b border-slate-800 py-3 ${!n.isRead ? 'bg-slate-800/50' : ''}`}
                      >
                        <div>
                          <p className="text-sm text-slate-300">{n.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full border border-slate-700 overflow-hidden hover:border-sky-400 transition-all">
                  <Avatar>
                    <AvatarImage src={overview.user?.avatarUrl || ""} />
                    <AvatarFallback className="bg-slate-800 text-slate-200">
                      {overview.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${overview.user?.id}`} className="cursor-pointer hover:bg-slate-800">
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-rose-400 hover:bg-slate-800 hover:text-rose-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* --- TABS --- */}
<div className="mb-8 flex items-center justify-start gap-2 overflow-x-auto border-b border-slate-800/60 pb-1 h-[50px]  pl-[10px]">
          <TabButton id="browse" label="Browse" icon={Search} />
          <TabButton id="my-proposals" label="My Proposals" icon={Layers} />
          <TabButton id="active-swaps" label="Active Swaps" icon={Zap} />
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TAB: BROWSE */}
          {activeTab === "browse" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicOnlyProposals.length === 0 ? (
                <EmptyState message="No public proposals found. Be the first to post!" />
              ) : (
                publicOnlyProposals.map((proposal) => (
                  <GlassCard key={proposal.id} proposal={proposal}>
                    {/* New functionality injected into Old Style card */}
                    <div className="mt-4 flex gap-2 pt-4 border-t border-slate-700/50">
                      <ProposalDetailsModal proposal={proposal} isOwner={false} />
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {/* TAB: MY PROPOSALS */}
          {activeTab === "my-proposals" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myProposals.length === 0 ? (
                <EmptyState message="You haven't posted any proposals yet." />
              ) : (
                myProposals.map((proposal) => (
                  <GlassCard key={proposal.id} proposal={proposal} isOwner>
                    <div className="mt-4 flex gap-2 pt-4 border-t border-slate-700/50 justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {proposal._count?.applications || 0} Applicants
                      </span>
                      <button 
                        onClick={() => handleDeleteProposal(proposal.id)}
                        className="p-2 rounded-full hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Proposal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {/* TAB: ACTIVE SWAPS */}
          {activeTab === "active-swaps" && (
            <div className="space-y-8">
              
              {/* Incoming Applications */}
              {applications.filter((a: any) => a.status === "PENDING").length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <UserCircle className="text-orange-400" /> Pending Requests
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {applications.filter((a: any) => a.status === "PENDING").map((app: any) => (
                      <div key={app.id} className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Applicant</p>
                            <Link href={`/profile/${app.applicant.id}`} className="text-base font-bold text-white hover:text-sky-400">
                              {app.applicant.name}
                            </Link>
                          </div>
                          <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-bold text-orange-400 border border-orange-500/20">
                            PENDING
                          </span>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 mb-4">
                          <p className="text-xs text-slate-400 italic">"{app.pitchMessage}"</p>
                          <p className="text-[10px] text-slate-600 mt-2 text-right">For: {app.proposal.title}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAccept(app.id)} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all">
                            <CheckCircle className="w-3 h-3" /> Accept
                          </button>
                          <button onClick={() => handleReject(app.id)} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Active Conversations */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Zap className="text-sky-400" /> Active Swaps
                  </h3>
                  <span className="text-xs text-slate-500">{swaps.length} Active</span>
                </div>
                
                {swaps.length === 0 ? (
                  <EmptyState message="No active swaps yet. Accept a proposal to get started!" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {swaps.map((swap: any) => {
                      const isTeacher = swap.teacherId === overview.user.id;
                      const partner = isTeacher ? swap.student : swap.teacher;
                      return (
                        <div key={swap.id} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-1 transition-all hover:border-sky-500/30 hover:bg-slate-900/60">
                          <div className="p-4 flex items-center gap-4">
                            <Avatar className="h-12 w-12 border border-slate-700">
                              <AvatarImage src={partner.avatarUrl} />
                              <AvatarFallback className="bg-slate-800 text-slate-400">{partner.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-200">{partner.name}</h4>
                              <p className="text-xs text-sky-400/80 mb-0.5">{swap.proposal.title}</p>
                              <p className="text-[10px] text-slate-500">Started {new Date(swap.startedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {/* Chat Modal Integration */}
                              <ChatModal 
                                swapId={swap.id} 
                                currentUserId={overview.user.id} 
                                otherUserName={partner.name} 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      </div>

      {/* Post Modal - Controlled by State */}
      <ProposalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => toast({ title: "Posted!", description: "Your proposal is live." })}
      />
    </div>
  );
}

// --- Internal Helper: Glass Card (Old Style) ---
function GlassCard({ proposal, children, isOwner }: any) {
  const modalityIcon = proposal.modality === "REMOTE" ? <Zap className="w-3 h-3" /> : <MapPin className="w-3 h-3" />;
  
  // Extract skill names safely
  const offered = proposal.offeredSkills?.[0]?.name || proposal.offeredSkill?.name || "General";
  const needed = proposal.neededSkills?.map((s:any) => s.name).join(", ") || "Open";

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-[0_10px_40px_-10px_rgba(56,189,248,0.1)]">
      {/* Glow Effect */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <h3 className="font-bold text-lg text-slate-100 line-clamp-1">{proposal.title}</h3>
        <span className="flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 uppercase">
          {modalityIcon} {proposal.modality}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-3 relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Offered</p>
          <p className="text-sm text-emerald-400 font-medium">{offered}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Needed</p>
          <p className="text-sm text-orange-300 font-medium line-clamp-1">{needed}</p>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 mt-2">{proposal.description}</p>
      </div>

      {/* Footer / Children (Buttons) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-12 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 mb-4">
        <Layers className="h-8 w-8 text-slate-600" />
      </div>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
=======
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { getNotifications, markNotificationAsRead } from "@/actions/notifications";
import { deleteProposal } from "@/actions/proposal-actions";
import { createSwapFromApplication } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";
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
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import {
  Bell, LogOut, Zap, MapPin, Search, Layers, Trash2, CheckCircle, XCircle, UserCircle, Plus, Home
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NavSearchButton from "../../../components/features/search/NavSearchButton";

// --- Types ---
interface DashboardProps {
  overview: any; myProposals: any[]; publicOnlyProposals: any[];
  search: string; rawModality: string; activeTab: string;
  swaps: any[]; applications: any[];
}

// --- Main Client Component ---
export default function DashboardClientContent({
  overview, myProposals, publicOnlyProposals, activeTab, swaps, applications,
}: DashboardProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

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
      toast({ title: "Deleted", description: "Proposal removed." });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: res.message });
    }
  };

  const handleAccept = async (appId: string) => {
    try {
      await createSwapFromApplication(appId);
      toast({ title: "Accepted!", description: "Swap started." });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error accepting." }); }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error rejecting." }); }
  };

  const NavLink = ({ id, label, icon: Icon }: any) => (
    <Link href={`?tab=${id}`} className={`${styles.navLink} ${activeTab === id ? styles.active : ''}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  const tabTitle = {
    "browse": "Browse Proposals", "my-proposals": "My Proposals", "active-swaps": "Active Swaps",
  }[activeTab] || "Dashboard";

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>Skill<span>Swap</span></Link>
        <nav className="flex flex-col gap-2">
          <p className={styles.navGroupTitle}>Menu</p>
          <NavLink id="browse" label="Browse" icon={Search} />
          <NavLink id="my-proposals" label="My Proposals" icon={Layers} />
          <NavLink id="active-swaps" label="Active Swaps" icon={Zap} />
        </nav>
        <div className={styles.sidebarFooter}>
           <Link href={`/profile/${overview.user?.id}`} className={styles.navLink}>
             <UserCircle className="w-5 h-5" /><span>My Profile</span>
           </Link>
           <Link href="/" className={styles.navLink}>
             <Home className="w-5 h-5" /><span>Landing Page</span>
           </Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>{tabTitle}</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {overview.user?.name || "User"}!</p>
          </div>
          <div className={styles.headerActions}>
            <NavSearchButton />
            <PostProposalModal />
            <ThemeToggleButton />
            <Notifications notifications={notifications} unreadCount={unreadCount} handleMarkRead={handleMarkRead} />
            <UserMenu user={overview.user} />
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "browse" && <BrowseTabContent publicOnlyProposals={publicOnlyProposals} />}
          {activeTab === "my-proposals" && <MyProposalsTabContent myProposals={myProposals} handleDelete={handleDeleteProposal} />}
          {activeTab === "active-swaps" && <ActiveSwapsTabContent applications={applications} swaps={swaps} user={overview.user} handleAccept={handleAccept} handleReject={handleReject} />}
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components ---

const SwapCard = ({ swap, partner, currentUserId }: any) => (
  <div className={styles.swapCard}>
    <div className={styles.partnerInfo}>
      <Avatar className="h-12 w-12 border-2 border-border">
        <AvatarImage src={partner.avatarUrl} />
        <AvatarFallback>{partner.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-bold text-foreground">{partner.name}</h4>
        <p className="text-sm text-primary">{swap.proposal.title}</p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-border flex justify-end">
      {/* ================================================================== */}
      {/* CHAT FUNCTIONALITY INTEGRATION POINT                               */}
      {/* ================================================================== */}
      <ChatModal
        swapId={swap.id}
        currentUserId={currentUserId}
        otherUserName={partner.name}
      />
    </div>
  </div>
);

const ActiveSwapsTabContent = ({ applications, swaps, user, handleAccept, handleReject }: any) => {
  const pendingApps = applications.filter((a: any) => a.status === "PENDING");
  return (
    <div className="space-y-12">
      {pendingApps.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Pending Requests</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {pendingApps.map((app: any) => (
              <ApplicationCard key={app.id} app={app} onAccept={handleAccept} onReject={handleReject} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="text-xl font-bold text-foreground mb-4">Active Conversations</h3>
        {swaps.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No active swaps yet. Accept a proposal to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {swaps.map((swap: any) => {
              const partner = swap.teacherId === user.id ? swap.student : swap.teacher;
              return <SwapCard key={swap.id} swap={swap} partner={partner} currentUserId={user.id} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
};


// --- Other Helper Components (Unchanged) ---

const BrowseTabContent = ({ publicOnlyProposals }: any) => (
  <div className={styles.cardGrid}>
    {publicOnlyProposals.length === 0 ? (
      <EmptyState message="No public proposals found. Be the first to post!" />
    ) : (
      publicOnlyProposals.map((p: any) => <ProposalCard key={p.id} proposal={p} />)
    )}
  </div>
);

const MyProposalsTabContent = ({ myProposals, handleDelete }: any) => (
  <div className={styles.cardGrid}>
    {myProposals.length === 0 ? (
      <EmptyState message="You haven't posted any proposals yet." />
    ) : (
      myProposals.map((p: any) => <ProposalCard key={p.id} proposal={p} isOwner onDelete={handleDelete} />)
    )}
  </div>
);

const ProposalCard = ({ proposal, isOwner = false, onDelete }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap size={14} /> : <MapPin size={14} />;
    const offered = proposal.offeredSkills?.[0]?.name || "N/A";
    const needed = proposal.neededSkills?.map((s: any) => s.name).join(", ") || "N/A";

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{proposal.title}</h3>
                <div className={styles.cardBadge}>{modalityIcon} {proposal.modality}</div>
            </div>
            <div className={styles.cardBody}>
                <div className={styles.skillRow}>
                    <p className={`${styles.skillLabel} ${styles.offered}`}>Offers</p>
                    <p className={styles.skillName}>{offered}</p>
                </div>
                <div className={styles.skillRow}>
                    <p className={`${styles.skillLabel} ${styles.needed}`}>Wants</p>
                    <p className={styles.skillName}>{needed}</p>
                </div>
            </div>
            <div className={styles.cardFooter}>
                <ProposalDetailsModal
                    proposal={proposal}
                    isOwner={isOwner}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
                {isOwner && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{proposal._count?.applications || 0} Applicants</span>
                        <button onClick={() => onDelete(proposal.id)} className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ApplicationCard = ({ app, onAccept, onReject }: any) => (
  <div className={styles.applicationCard}>
    <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Request from</p>
          <Link href={`/profile/${app.applicant.id}`} className="font-bold text-foreground hover:underline">{app.applicant.name}</Link>
        </div>
        <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400">PENDING</span>
    </div>
    <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md border border-border mb-4">"{app.pitchMessage}"</p>
    <div className="flex gap-3">
        <button onClick={() => onAccept(app.id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md py-2 font-semibold">
            <CheckCircle size={16} /> Accept
        </button>
        <button onClick={() => onReject(app.id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-md py-2 font-semibold">
            <XCircle size={16} /> Reject
        </button>
    </div>
  </div>
);

const UserMenu = ({ user }: any) => (
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

const Notifications = ({ notifications, unreadCount, handleMarkRead }: any) => (
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
          notifications.map((n: any) => (
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
>>>>>>> 51fea53e9c3c640ee6fd7ebf5d71800b1e27a859:skill-sync/src/app/(dashboard)/dashboard/client.tsx
