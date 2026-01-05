"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import {
    ArrowLeft, Settings, Star, CheckCircle, Award, Briefcase, Phone,
    Upload, Loader2, Plus, X, AlertTriangle, MessageSquare, Zap, Trophy, Shield, Medal, Quote
} from "lucide-react";

// UI & Action Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReputationBadge } from "@/components/ReputationBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertProfile } from "@/actions/profile";
import { addSkillToCurrentUser, removeManualSkillFromCurrentUser } from "@/actions/skills";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { findActiveSwapBetweenUsers } from "@/actions/swaps";
import { ChatModal } from "@/components/ChatModal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const COUNTRY_CODES = [
    { code: "+961", country: "�� Lebanon" },
    { code: "+1", country: "�� USA/Canada" },
    { code: "+44", country: "�� United Kingdom" },
    { code: "+91", country: "�� India" },
    { code: "+971", country: "�🇪 UAE" },
    { code: "+20", country: "�� Egypt" },
    { code: "+33", country: "�� France" },
    { code: "+49", country: "�� Germany" },
    { code: "+61", country: "�� Australia" },
    { code: "+81", country: "�� Japan" },
    { code: "+86", country: "�� China" },
    { code: "+55", country: "�� Brazil" },
    { code: "+34", country: "🇪🇸 Spain" },
    { code: "+39", country: "🇮🇹 Italy" },
    { code: "+52", country: "🇲🇽 Mexico" },
    { code: "+62", country: "🇮🇩 Indonesia" },
    { code: "+63", country: "🇵🇭 Philippines" },
    { code: "+66", country: "🇹🇭 Thailand" },
    { code: "+84", country: "🇻🇳 Vietnam" },
    { code: "+27", country: "🇿🇦 South Africa" },
];

// --- Type Definitions ---
import { ProfileData } from "@/types/dashboard";

interface ProfileClientContentProps {
    profileData: ProfileData; isOwnProfile: boolean; useMockData: boolean; currentUserId: string | null;
}

// --- Main Client Component ---
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import AnimatedBackground from "@/components/landing/AnimatedBackground";

export default function ProfileClientContent({ profileData, isOwnProfile, useMockData, currentUserId }: ProfileClientContentProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'reviews'>('about');
    const containerRef = React.useRef(null);

    const [formData, setFormData] = useState({
        name: profileData.name || "", industry: profileData.industry || "", bio: profileData.bio || "",
        avatarUrl: profileData.avatarUrl || "", phoneNumber: profileData.phoneNumber || "",
    });

    const [mutualSwapId, setMutualSwapId] = useState<string | null>(null);

    useEffect(() => {
        const findMutualSwap = async () => {
            if (!isOwnProfile && profileData.id) {
                const swap = await findActiveSwapBetweenUsers(profileData.id);
                if (swap) setMutualSwapId(swap.id);
            }
        };
        findMutualSwap();
    }, [isOwnProfile, profileData.id]);

    // Cinematic Entrance with GSAP
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.from(".profile-nav", {
            y: -20,
            autoAlpha: 0,
            duration: 0.8,
            delay: 0.1
        })
            .from([".profile-sidebar", ".profile-main"], {
                y: 20,
                autoAlpha: 0,
                duration: 0.8,
                stagger: 0.1,
            }, "-=0.6");

    }, { scope: containerRef });

    const handleSave = useCallback(async () => {
        await upsertProfile(formData);
        setEditMode(false);
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
        router.refresh();
    }, [formData, router, toast]);

    const handleCancel = useCallback(() => {
        setFormData({
            name: profileData.name || "", industry: profileData.industry || "", bio: profileData.bio || "",
            avatarUrl: profileData.avatarUrl || "", phoneNumber: profileData.phoneNumber || "",
        });
        setEditMode(false);
    }, [profileData]);

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30">
            {/* Cinematic Animated Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AnimatedBackground />
            </div>

            <div className={cn(styles.profileLayout, "max-w-7xl mx-auto px-6 py-8 relative z-10")}>
                <div className="profile-nav">
                    <ProfileNavbar
                        isOwnProfile={isOwnProfile}
                        editMode={editMode}
                        onEditToggle={() => setEditMode(true)}
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-4">
                    <div className="lg:w-[320px] shrink-0 profile-sidebar">
                        {useMockData && <MockDataWarning />}
                        <ProfileSidebar
                            profileData={profileData} formData={formData} setFormData={setFormData}
                            editMode={editMode} isOwnProfile={isOwnProfile}
                            currentUserId={currentUserId} mutualSwapId={mutualSwapId}
                        />
                    </div>

                    <div className="flex-1 profile-main h-full">
                        <ProfileMainContent
                            profileData={profileData} formData={formData} setFormData={setFormData}
                            editMode={editMode} activeTab={activeTab} setActiveTab={setActiveTab}
                        />
                    </div>
                </div>
            </div>

            {editMode && <EditModeActions onSave={handleSave} onCancel={handleCancel} />}
        </div>
    );
}

// --- Sub-Components ---

function ProfileSidebar({ profileData, formData, setFormData, editMode, isOwnProfile, currentUserId, mutualSwapId }: {
    profileData: ProfileData, formData: any, setFormData: Function, editMode: boolean,
    isOwnProfile: boolean, currentUserId: string | null, mutualSwapId: string | null
}) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const supabase = getSupabaseBrowserClient();
        const filePath = `${profileData.id}/${Date.now()}_${file.name}`;

        const { error } = await supabase.storage.from("avatars").upload(filePath, file);

        if (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: error.message });
        } else {
            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            setFormData((prev: any) => ({ ...prev, avatarUrl: data.publicUrl }));
        }
        setIsUploading(false);
    };

    const nextLevelExp = profileData.reputation.level === 5 ? profileData.reputation.reputationPoints :
        profileData.reputation.level === 4 ? 1000 :
            profileData.reputation.level === 3 ? 400 :
                profileData.reputation.level === 2 ? 150 : 50;

    const progressPercent = Math.min(100, (profileData.reputation.reputationPoints / nextLevelExp) * 100);

    return (
        <aside className={cn("rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 group", "bg-background/60 backdrop-blur-2xl border border-white/[0.08]", "shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.16)]", styles.sidebar)}>

            {/* Subtle iOS-style gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className={styles.avatarWrapper}>
                <div className="relative inline-block">
                    {/* iOS-style subtle shadow ring */}
                    <div className="absolute inset-0 bg-primary/[0.08] blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <Avatar className="h-32 w-32 border-[3px] border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.15)] relative z-10 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] group-hover:border-white/20">
                        <AvatarImage src={formData.avatarUrl || ""} className="object-cover" />
                        <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-primary/5 to-primary/10 text-primary">{formData.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                </div>

                {editMode && (
                    <label className={cn(styles.avatarUploadButton, "hover:scale-105 active:scale-95 shadow-lg bg-primary/90 backdrop-blur-sm text-white border border-white/20 z-20 transition-all duration-300")}>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                )}
            </div>

            <div className="mt-4 flex flex-col items-center w-full relative z-10">
                {editMode ? (
                    <div className="space-y-4 w-full animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Full Name</p>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your Name" className="text-center text-lg font-semibold rounded-xl border h-10 bg-background/50 backdrop-blur-sm focus:bg-background transition-all" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Industry</p>
                            <Input value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} placeholder="Industry / Title" className="text-center rounded-xl border h-10 bg-background/50 backdrop-blur-sm focus:bg-background transition-all text-sm" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Phone Number</p>
                            <div className="flex gap-2">
                                <Select
                                    value={(() => {
                                        const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                                        return matched ? matched.code : "+1";
                                    })()}
                                    onValueChange={(code) => {
                                        const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                                        const currentNum = matched ? formData.phoneNumber!.slice(matched.code.length) : formData.phoneNumber;
                                        setFormData({ ...formData, phoneNumber: code + (currentNum || "") });
                                    }}
                                >
                                    <SelectTrigger className="w-[110px] h-12 rounded-2xl border-2 font-black bg-background/50 shrink-0">
                                        <SelectValue placeholder="Code" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border shadow-2xl rounded-2xl">
                                        {COUNTRY_CODES.map(c => (
                                            <SelectItem key={c.code} value={c.code} className="font-bold cursor-pointer rounded-lg focus:bg-primary/10">
                                                {c.country} ({c.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={(() => {
                                        const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                                        return matched ? formData.phoneNumber!.slice(matched.code.length) : formData.phoneNumber;
                                    })() || ''}
                                    onChange={e => {
                                        const matched = COUNTRY_CODES.find(c => formData.phoneNumber?.startsWith(c.code));
                                        const code = matched ? matched.code : "+1";
                                        setFormData({ ...formData, phoneNumber: code + e.target.value });
                                    }}
                                    placeholder="Number"
                                    className="flex-1 h-12 rounded-2xl border-2 font-bold bg-background/50"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-[22px] font-semibold text-foreground tracking-tight leading-tight">{profileData.name}</h1>
                        <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-primary/[0.06] text-primary text-[11px] font-medium border border-primary/[0.08]">
                            <Briefcase className="w-3 h-3" />
                            {profileData.industry || "General Expert"}
                        </div>
                        <div className="mt-5">
                            <ReputationBadge reputation={profileData.reputation} size="md" />
                        </div>
                        {profileData.phoneNumber && (
                            <div className="mt-4 px-4 py-2 bg-background/40 backdrop-blur-sm rounded-xl border border-white/[0.08] flex items-center gap-2 text-[13px] font-medium text-muted-foreground shadow-sm">
                                <Phone className="w-3 h-3 text-primary" />
                                {profileData.phoneNumber}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="grid grid-cols-3 gap-0 w-full mt-6 p-0 border-y border-white/[0.06] py-4 relative z-10">
                <div className="flex flex-col items-center border-r border-white/[0.06] transition-all duration-300 hover:bg-white/[0.02] py-1">
                    <StatItem value={profileData.reputation.completedSwaps} label="Swaps" />
                </div>
                <div className="flex flex-col items-center border-r border-white/[0.06] transition-all duration-300 hover:bg-white/[0.02] py-1">
                    <StatItem value={profileData.reputation.averageRating > 0 ? profileData.reputation.averageRating.toFixed(1) : "—"} label="Rating" />
                </div>
                <div className="flex flex-col items-center transition-all duration-300 hover:bg-white/[0.02] py-1">
                    <StatItem value={profileData.reputation.totalEndorsements} label="Kudos" />
                </div>
            </div>

            <div className="w-full mt-6 space-y-3 px-1 relative z-10">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Progression</span>
                        <span className="text-[15px] font-semibold text-foreground">{profileData.reputation.reputationPoints} XP</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wide bg-white/[0.03] px-2 py-1 rounded-lg">
                        {profileData.reputation.level === 5 ? "MAX" : `${nextLevelExp} XP`}
                    </span>
                </div>
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden relative">
                    <div
                        className={cn("h-full relative overflow-hidden transition-all duration-700 ease-out",
                            profileData.reputation.level === 5 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                profileData.reputation.level === 4 ? "bg-gradient-to-r from-purple-400 to-purple-500" :
                                    profileData.reputation.level === 3 ? "bg-gradient-to-r from-sky-400 to-sky-500" :
                                        profileData.reputation.level === 2 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-slate-400 to-slate-500"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_infinite]" />
                    </div>
                </div>
            </div>

            {!isOwnProfile && currentUserId && mutualSwapId && (
                <div className="mt-8 w-full relative z-10">
                    <ChatModal
                        swapId={mutualSwapId}
                        currentUserId={currentUserId}
                        otherUserName={profileData.name || "User"}
                        triggerClassName="w-full h-12 rounded-xl font-bold text-base bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all hover:bg-primary/90"
                    />
                </div>
            )}
        </aside>
    );
}


// --- Other Unchanged Sub-Components ---
function ProfileNavbar({ isOwnProfile, editMode, onEditToggle }: { isOwnProfile: boolean, editMode: boolean, onEditToggle: () => void }) {
    const router = useRouter();
    return (
        <nav className="sticky top-6 z-50 w-full max-w-7xl mx-auto rounded-2xl bg-background/80 backdrop-blur-xl border border-white/10 shadow-premium hover:shadow-intense transition-all duration-700 p-3 flex justify-between items-center mb-8 animate-in slide-in-from-top-4 duration-700">

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="rounded-xl h-10 pl-3 pr-4 bg-background/40 hover:bg-background/80 border border-white/5 hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-300 group"
                >
                    <div className="w-6 h-6 rounded-lg bg-background flex items-center justify-center mr-2 group-hover:scale-105 transition-transform shadow-sm">
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-sm">Dashboard</span>
                </Button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 opacity-50 select-none pointer-events-none">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Profile</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-background/40 p-1 rounded-xl border border-white/5">
                    <ThemeCustomizer />
                </div>

                {isOwnProfile && !editMode && (
                    <Button
                        onClick={onEditToggle}
                        className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-md transition-all duration-300"
                    >
                        <Settings className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
                        Edit Profile
                    </Button>
                )}
            </div>
        </nav>
    );
}

function MockDataWarning() {
    return (
        <div className="mb-8 rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-6 text-amber-500 flex items-start gap-4 animate-pulse">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div className="text-sm">
                <p className="font-black uppercase tracking-widest text-xs mb-1">Developer Notice</p>
                <p className="font-bold leading-relaxed">This profile is currently using placeholder data because the specific record wasn't found in our database.</p>
            </div>
        </div>
    );
}

function StatItem({ value, label }: { value: string | number, label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-foreground tabular-nums leading-none tracking-tight">{value}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">{label}</span>
        </div>
    );
}

function Milestone({ icon, label, active, color, bgColor }: { icon: React.ReactNode, label: string, active: boolean, color: string, bgColor?: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-700 group relative overflow-hidden",
            active
                ? cn("bg-background/50 border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-white/20 opacity-100 hover:scale-105")
                : "bg-muted/5 border-transparent opacity-30 grayscale hover:opacity-40"
        )}>
            {active && (
                <>
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700", bgColor)} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
            )}

            <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-700 relative z-10 shadow-lg",
                active ? cn("bg-background shadow-inner group-hover:scale-110 group-hover:rotate-3", color) : "bg-muted"
            )}>
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight text-foreground relative z-10">{label}</span>
            {active && <div className={cn("mt-2 w-1.5 h-1.5 rounded-full animate-pulse relative z-10 shadow-lg", color.replace('text-', 'bg-'))} />}
        </div>
    );
}

function ProfileMainContent({ profileData, formData, setFormData, editMode, activeTab, setActiveTab }: any) {
    return (
        <div className="glass-panel rounded-3xl p-8 min-h-[600px] flex flex-col relative overflow-hidden bg-background/30 border border-white/10 hover:border-white/15 transition-all duration-700 hover:shadow-intense">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none opacity-30" />

            <nav className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-white/5 w-fit mb-8 relative z-10 shadow-lg">
                <button
                    onClick={() => setActiveTab('about')}
                    className={cn(
                        "px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-500 hover:scale-105",
                        activeTab === 'about' ? "bg-background text-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    About
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={cn(
                        "px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-500 hover:scale-105",
                        activeTab === 'skills' ? "bg-background text-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    Expertise
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={cn(
                        "px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-500 hover:scale-105",
                        activeTab === 'reviews' ? "bg-background text-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    Reviews
                </button>
            </nav>

            <div className="relative z-10 flex-1">
                {activeTab === 'about' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AboutTab bio={formData.bio} setFormData={setFormData} editMode={editMode} defaultBio={profileData.bio} />

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                                <h2 className="text-xl font-bold text-foreground tracking-tight">Milestones</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                <Milestone
                                    icon={<Zap className="w-6 h-6" />}
                                    label="Fast Responder"
                                    active={profileData.reputation.completedSwaps > 0}
                                    color="text-amber-500"
                                    bgColor="bg-amber-500/10"
                                />
                                <Milestone
                                    icon={<Trophy className="w-6 h-6" />}
                                    label="Skill Master"
                                    active={profileData.reputation.level >= 3}
                                    color="text-purple-500"
                                    bgColor="bg-purple-500/10"
                                />
                                <Milestone
                                    icon={<CheckCircle className="w-6 h-6" />}
                                    label="Trusted User"
                                    active={profileData.reputation.averageRating >= 4.5}
                                    color="text-emerald-500"
                                    bgColor="bg-emerald-500/10"
                                />
                            </div>
                        </section>
                    </div>
                )}
                {activeTab === 'skills' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SkillsTab skills={profileData.skills} editMode={editMode} />
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ReviewsTab reviews={profileData.reviewsReceived} />
                    </div>
                )}
            </div>
        </div>
    );
}

function AboutTab({ bio, setFormData, editMode, defaultBio }: any) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">Background</h2>
            </div>
            {editMode ? (
                <Textarea
                    value={bio}
                    onChange={e => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell everyone about yourself, your skills, and what you're looking to learn..."
                    rows={10}
                    className="rounded-3xl border-2 border-white/10 bg-background/50 backdrop-blur-md focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all p-8 text-lg font-medium leading-relaxed resize-none shadow-inner"
                />
            ) : (
                <div className="relative pl-6 border-l-2 border-white/10">
                    <p className="text-lg leading-relaxed text-muted-foreground font-medium transition-all duration-700 whitespace-pre-wrap">
                        {defaultBio || "This user hasn't written a biography yet. Knowledge exchange is better when you know who you're trading with!"}
                    </p>
                </div>
            )}
        </div>
    );
}

function SkillsTab({ skills, editMode }: { skills: ProfileData['skills'], editMode: boolean }) {
    const router = useRouter();
    const [newSkill, setNewSkill] = useState("");
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const visibleSkills = skills.filter(s => s.isVisible);

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        setIsAddingSkill(true);
        await addSkillToCurrentUser({ name: newSkill.trim() });
        setNewSkill("");
        setIsAddingSkill(false);
        router.refresh();
    };

    const handleRemoveSkill = async (id: string) => {
        await removeManualSkillFromCurrentUser(id);
        router.refresh();
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Expertise</h2>
                </div>
                {editMode && (
                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl transition-all duration-500 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/20 focus-within:shadow-glow">
                        <Input
                            value={newSkill}
                            onChange={e => setNewSkill(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Add a skill..."
                            className="border-none focus-visible:ring-0 font-bold w-[200px] h-10 bg-transparent"
                        />
                        <Button size="sm" onClick={handleAddSkill} disabled={isAddingSkill} className="rounded-xl h-10 w-10 p-0 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 hover:scale-110">
                            {isAddingSkill ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {visibleSkills.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-16 opacity-40 border-2 border-dashed border-white/10 rounded-[2rem]">
                        <Award className="w-12 h-12 mb-3" />
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No skills listed yet.</p>
                    </div>
                ) : visibleSkills.map((skill, i) => (
                    <div
                        key={skill.id}
                        className={cn(
                            "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-500 border animate-in fade-in zoom-in-95 fill-mode-both hover:scale-105 hover:shadow-lg",
                            skill.source === 'ENDORSED'
                                ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 shadow-emerald-500/10"
                                : "bg-background/40 backdrop-blur-md border-white/5 text-foreground hover:bg-background/60 hover:border-white/10 shadow-md"
                        )}
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {/* Background Glow for Endorsed Skills */}
                        {skill.source === 'ENDORSED' && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-50 animate-shimmer pointer-events-none rounded-xl" />
                                <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            </>
                        )}

                        {skill.source === 'ENDORSED' ? <Award size={16} className="fill-current animate-pulse shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />}

                        <span className="relative z-10 text-sm">{skill.name}</span>

                        {editMode && skill.source !== 'ENDORSED' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveSkill(skill.id); }}
                                className="relative z-10 ml-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white p-1 transition-all"
                            >
                                <X size={12} />
                            </button>
                        )}

                        {skill.source === 'ENDORSED' && (
                            <div className="relative z-10 flex items-center justify-center min-w-[1.5rem] px-1.5 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-sm ml-1">
                                +{skill.endorsementCount}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReviewsTab({ reviews }: { reviews: any[] }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 select-none animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 opacity-50" />
                </div>
                <p className="font-black uppercase tracking-[0.2em] text-sm">No reviews yet</p>
                <p className="text-sm mt-2 text-muted-foreground w-64">Feedback will appear here once you complete a swap as a teacher.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                <h2 className="text-xl font-bold text-foreground tracking-tighter">Community Feedback</h2>
            </div>

            <div className="grid gap-5">
                {reviews.map((review, i) => (
                    <div
                        key={review.id}
                        className="bg-background/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-700 hover:bg-background/60 hover:shadow-2xl hover:-translate-y-1 hover:border-white/10 group relative overflow-hidden"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        {/* Subtle background glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                                    <AvatarImage src={review.author?.avatarUrl || ""} />
                                    <AvatarFallback className="font-black text-sm bg-muted text-muted-foreground">{review.author?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-foreground">{review.author?.name || "Anonymous"}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span className="text-sm font-black text-amber-600">{review.rating.toFixed(1)}</span>
                            </div>
                        </div>

                        <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-6 h-6 text-muted-foreground/10 rotate-180" />
                            <p className="text-base font-medium leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors pl-4">
                                {review.comment}
                            </p>
                        </div>

                        {review.swap?.proposal?.title && (
                            <div className="mt-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary/70 bg-primary/5 w-fit px-3 py-1.5 rounded-lg">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Swapped for: {review.swap.proposal.title}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function EditModeActions({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) {
    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-foreground p-3 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-background/10 backdrop-blur-xl animate-float">
            <Button variant="ghost" onClick={onCancel} className="h-14 px-8 rounded-2xl font-bold text-background hover:bg-background/20 hover:text-background transition-all">
                Discard Changes
            </Button>
            <Button onClick={onSave} className="h-14 px-10 rounded-2xl font-bold text-foreground bg-background hover:bg-primary hover:text-white transition-all shadow-xl">
                Confirm & Save
            </Button>
        </div>
    );
}