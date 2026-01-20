import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import styles from "../../app/(public)/Landing.module.css";
import { PostProposalModal } from "@/components/PostProposalModal";
import Image from "next/image";
import HeroClient from "./HeroClient";

export default function Hero({ userId }: { userId?: string | null }) {
  return (
    <HeroClient userId={userId}>
      <div className={`${styles.container} relative z-10 text-center parallax-content`}>

        {/* Social Proof & Badge Stack */}
        <div className="flex flex-col items-center gap-6 mb-12">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md shadow-[0_0_20px_rgba(var(--primary),0.1)]">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90">
              The Cooperative Growth Protocol
            </span>
          </div>

          {/* Social Proof Group */}
          <div className="flex flex-col items-center gap-2 group cursor-default hero-badge">
            <div className="flex -space-x-4 transition-transform duration-300 group-hover:scale-105">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
              ].map((src, i) => (
                <div key={i} className="relative w-10 h-10 rounded-full border-2 border-background overflow-hidden shadow-lg cursor-pointer" title="Elite Learner">
                  <Image
                    src={src}
                    alt="Elite Learner"
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority={i < 3} // Prioritize first few avatars
                    loading={i < 3 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
              <div className="flex items-center gap-1">
                <span className="text-foreground font-black">2.4k</span> Elite Learners
              </div>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-1 text-emerald-500 font-bold">
                <span>★</span> Joined this week
              </div>
            </div>
          </div>
        </div>

        {/* Hero Title - Maybach Typography */}
        <h1 className={cn(styles.heroTitle, "mb-10 font-playfair font-medium px-4 break-words text-5xl sm:text-7xl md:text-8xl leading-[1.05] tracking-tight text-balance")}>
          The Pinnacle of <br className="hidden sm:block" />
          <span className="text-primary italic relative inline-block">
            Collaborative Expertise.
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-30" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C2.00025 6.99997 102.5 1.49997 197.5 6.49997" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          </span>
        </h1>

        <p className={cn(styles.heroDescription, "text-balance max-w-2xl mx-auto font-medium text-lg sm:text-xl mb-14 sm:mb-24 leading-relaxed text-muted-foreground/90 tracking-wide px-4")}>
          Share Your Expertise. Master New Skills. SkillTrade is a premium ecosystem for collaborative growth. We bridge the gap between your unique talents and the expertise you seek, fostering a community where knowledge is the only currency.
        </p>

        <div className={cn(styles.heroActions, "flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 sm:mb-32 relative px-4 w-full")}>
          <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10 animate-pulse" />
          {userId ? (
            <PostProposalModal
              buttonText="Initiate Strategic Synergy"
              triggerClassName={cn(styles.glassyBtn, styles.silverHub, "h-16 sm:h-20 px-10 sm:px-16 rounded-full text-xs sm:text-sm font-playfair italic font-medium tracking-tight shadow-2xl hover:scale-105 active:scale-98 transition-all duration-700 border-none relative overflow-hidden group w-full sm:w-auto")}
            />
          ) : (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className={cn(styles.glassyBtn, "h-16 sm:h-20 w-full sm:w-auto px-10 sm:px-16 rounded-full text-xs sm:text-sm font-playfair italic font-medium tracking-tight shadow-2xl hover:scale-105 active:scale-98 transition-all duration-700 group border-none relative overflow-hidden")}>
                Join the Elite Collective
              </Button>
            </Link>
          )}
        </div>

        {/* Maybach Stats - Faded Glass Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto px-4 mt-20">
          {[
            { label: "Elite Members", value: "2.4k", sub: "VETTED" },
            { label: "Active Syncs", value: "12,402", sub: "COMPLETE" },
            { label: "Global Trust", value: "4.98", sub: "RATING" },
            { label: "Market Status", value: "Locked", sub: "STABLE" }
          ].map((stat, i) => (
            <div key={i} className="stat-card flex flex-col items-center gap-2 bg-primary/5 hover:bg-primary/10 backdrop-blur-sm border border-white/5 p-6 rounded-2xl transition-all duration-500 hover:scale-105 cursor-default group shadow-lg shadow-black/5">
              <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors font-medium">{stat.label}</span>
              <span className="text-3xl font-playfair italic text-foreground leading-none">{stat.value}</span>
              <span className="text-[8px] tracking-[0.2em] text-muted-foreground/60">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Global Marquee */}
        <div className="mt-32 anim-load">
          <div className="text-[9px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 mb-12 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/5" />
            DECENTRALIZED FROM
            <div className="h-px w-12 bg-white/5" />
          </div>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeContent}>
              {["EXCLUSIVITY", "CALM", "CONFIDENCE", "POWER", "REFINEMENT", "MASTERY"].map(brand => (
                <div key={brand} className="flex items-center gap-12 mx-16">
                  <span className="text-3xl font-playfair italic font-light tracking-[0.2em] text-foreground/20 hover:text-primary/40 transition-colors duration-1000 cursor-default whitespace-nowrap">{brand}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                </div>
              ))}
              {["EXCLUSIVITY", "CALM", "CONFIDENCE", "POWER", "REFINEMENT", "MASTERY"].map(brand => (
                <div key={`${brand}-dup`} className="flex items-center gap-12 mx-16">
                  <span className="text-3xl font-playfair italic font-light tracking-[0.2em] text-foreground/20 hover:text-primary/40 transition-colors duration-1000 cursor-default whitespace-nowrap">{brand}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Softened and Refined */}
        {/* Note: This interaction is handled in client logic by the fact that it's just scrolling, but we can't easily attach the click handler here in server component 
            We should probably move this specific interactive bit to a small client component or just let HeroClient handle it if we can find it.
            Actually, let's keep it simple: We can leave the onClick here if we wrap it in a client component or if we just remove the JS click dependency and use href="#footer" or similar, 
            but for smooth scroll it needs JS. 
            For now, let's just make it a simple anchor or accept that it might be static until hydrated. 
            Better: Use a client component for this small button or just let HeroClient attach the listener if we give it a class.
        */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-pulse-slow opacity-30 hover:opacity-100 transition-all duration-500 cursor-pointer group scroll-indicator">
          <span className="text-[9px] font-medium uppercase tracking-[0.6em] text-primary/40 group-hover:text-primary/80 transition-all duration-700">Ascend</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </HeroClient>
  );
}
