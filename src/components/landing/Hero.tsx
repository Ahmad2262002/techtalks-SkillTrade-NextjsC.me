"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Globe, Sparkles, Trophy } from "lucide-react";
import styles from "../../app/(public)/Landing.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PostProposalModal } from "@/components/PostProposalModal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero({ userId }: { userId?: string | null }) {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const originalHTML = titleRef.current?.innerHTML;

    const splitTextWithLines = (selector: string): void => {
      const title = container.current?.querySelector(selector) as HTMLElement | null;
      if (!title || !originalHTML) return;

      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          return text.split("").map((c: string) =>
            `<span class="char" style="display:inline-block; transform: translateZ(0); -webkit-backface-visibility: hidden; backface-visibility: hidden;">${c === " " ? "&nbsp;" : c}</span>`
          ).join("");
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName === "BR") return "<br>";
          const content = Array.from(element.childNodes).map(processNode).join("");
          const attributes = Array.from(element.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(" ");
          return `<${element.tagName.toLowerCase()} ${attributes}>${content}</${element.tagName.toLowerCase()}>`;
        }
        return "";
      };

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = originalHTML;
      title.innerHTML = Array.from(tempDiv.childNodes).map(processNode).join("");
    };

    splitTextWithLines(`.${styles.heroTitle}`);

    const chars = gsap.utils.toArray(".char");
    const introTl = gsap.timeline();

    // No need for set autoAlpha: 1 since we removed opacity-0
    // The introTl will now animate FROM hidden state to visible state.

    introTl
      .fromTo(".hero-badge", {
        opacity: 0,
        scale: 0.95,
        y: -20,
      }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "all"
      })
      .fromTo(`.${styles.eyebrow}`, {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "all"
      }, "-=1.1")
      .fromTo(chars, {
        opacity: 0,
        y: 40,
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.012,
        duration: 1.4,
        ease: "expo.out",
        clearProps: "all"
      }, "-=1.0")
      .fromTo(`.${styles.heroDescription}`, {
        opacity: 0,
        y: 20,
      }, {
        opacity: 0.9,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        clearProps: "all"
      }, "-=1.1")
      .fromTo(`.${styles.heroActions} .proto-btn`, {
        opacity: 0,
        y: 20,
        scale: 0.95
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.15,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "all"
      }, "-=1.0")
      .fromTo(".stat-card", {
        opacity: 0,
        y: 30,
        scale: 0.95,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.1,
        duration: 1.4,
        ease: "expo.out",
        clearProps: "all"
      }, "-=1.1")
      .fromTo(".anim-load", {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "all"
      }, "-=1.2");

    // Scroll-based parallax
    gsap.to(".parallax-content", {
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      },
      y: 150,
      opacity: 0.5,
      ease: "none"
    });

    return () => {
      if (titleRef.current && originalHTML) {
        titleRef.current.innerHTML = originalHTML;
      }
    };
  }, { scope: container });

  return (
    <section ref={container} className={cn(styles.hero, "relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden min-h-[100dvh] flex items-center justify-center w-full max-w-full overflow-x-hidden")}>

      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.1),transparent)] pointer-events-none" />

      <div className={`${styles.container} relative z-10 text-center parallax-content`}>

        {/* Elite Badge - Made responsive */}
        <div className="hero-badge inline-flex flex-col sm:flex-row items-center gap-2 px-6 py-2 rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-xl mb-12 shadow-[0_10px_30px_hsl(var(--primary)/0.1)]">
          <div className="flex -space-x-3 mb-2 sm:mb-0">
            {[15, 22, 33, 44].map(id => (
              <div key={id} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} alt="Avatar" className="object-cover" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 pl-0 sm:pl-2 border-l-0 sm:border-l border-white/10 ml-0 sm:ml-2">
            <Trophy className="w-3 h-3 inline-block -mt-1 mr-1 text-primary" />
            2.4k Elite Learners
          </span>
        </div>

        <span className={cn(styles.eyebrow, "hero-badge")}>
          The Peer-to-Peer Protocol
        </span>

        {/* Hero Title - Made responsive with word breaking */}
        <h1 ref={titleRef} className={cn(styles.heroTitle, "mb-8 sm:mb-12 font-[Outfit] px-4 break-words text-4xl sm:text-6xl md:text-7xl leading-[1.1] sm:leading-[0.9]")}>
          Exchange Your <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent italic drop-shadow-sm inline-block will-change-transform">Intelligence.</span>
          <br className="hidden sm:block" />
          No Money <span className="text-foreground/40 font-black tracking-tight underline decoration-primary/30 decoration-wavy underline-offset-8 inline-block will-change-transform">Required.</span>
        </h1>

        <p className={cn(styles.heroDescription, "text-balance max-w-2xl mx-auto font-medium text-lg mb-16 leading-relaxed text-muted-foreground/90 px-4")}>
          SkillTrade is a high-octane peer-to-peer marketplace. We bypass traditional education by connecting your expertise directly with the skills you crave. <span className="text-primary font-bold">Your talent is the only currency here.</span>
        </p>

        <div className={cn(styles.heroActions, "flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 relative px-4 w-full")}>
          <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10 animate-pulse" />
          {userId ? (
            <PostProposalModal
              buttonText="Initialize New Sync"
              triggerClassName="proto-btn h-20 px-12 rounded-[2rem] text-xs font-black uppercase tracking-widest bg-primary text-white shadow-[0_20px_50px_hsl(var(--primary)/0.4)] hover:scale-110 active:scale-95 transition-all border-none relative overflow-hidden group w-full sm:w-auto break-words whitespace-normal text-center"
            />
          ) : (
            <Link href="/dashboard" className="proto-btn w-full sm:w-auto">
              <Button size="lg" className="h-20 w-full sm:w-auto px-12 rounded-[2rem] text-xs font-black uppercase tracking-widest bg-primary text-white shadow-[0_20px_50px_hsl(var(--primary)/0.4)] hover:scale-110 active:scale-95 transition-all group border-none relative overflow-hidden whitespace-normal break-words text-center">
                <span className="relative z-10 flex items-center justify-center">
                  Access Explorer
                  <Zap className="ml-3 w-4 h-4 group-hover:fill-current transition-all shrink-0" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
          )}
        </div>

        {/* Dynamic Stats Grid - Optimized for Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto border-t border-white/5 pt-20 px-4">
          {[
            { label: "Network Volume", value: "12,402", sub: "SYNCED", color: "from-blue-500/20" },
            { label: "Active Nodes", value: "840+", sub: "VETTED", color: "from-purple-500/20" },
            { label: "Skill Vector", value: "154", sub: "UNIQUE", color: "from-emerald-500/20" },
            { label: "Trust Index", value: "4.95", sub: "RATING", color: "from-amber-500/20" }
          ].map((stat, i) => (
            <div key={i} className="stat-card relative group p-px rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent hover:from-primary/50 transition-all duration-500">
              <div className={cn("bg-background/40 backdrop-blur-2xl rounded-[1.9rem] sm:rounded-[2.4rem] p-6 sm:p-10 h-full flex flex-col items-center justify-center group-hover:bg-background/20 transition-all duration-700 relative overflow-hidden")}>
                <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700", stat.color)} />
                <span className="relative z-10 text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-3 sm:mb-4 opacity-60 group-hover:opacity-100">{stat.label}</span>
                <span className="relative z-10 text-3xl sm:text-4xl font-black text-foreground tracking-tighter mb-2 italic">{stat.value}</span>
                <div className="relative z-10 px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">{stat.sub}</div>
              </div>
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
              {["GSAP", "NEXT.JS", "PRISMA", "SUPABASE", "SHADCN", "CLERK", "RESEND", "TAILWIND"].map(brand => (
                <div key={brand} className="flex items-center gap-8 mx-12">
                  <span className="text-4xl font-black tracking-tighter text-foreground/20 italic hover:text-primary transition-colors cursor-default whitespace-nowrap">{brand}</span>
                  <Sparkles className="w-5 h-5 text-primary/20" />
                </div>
              ))}
              {["GSAP", "NEXT.JS", "PRISMA", "SUPABASE", "SHADCN", "CLERK", "RESEND", "TAILWIND"].map(brand => (
                <div key={`${brand}-dup`} className="flex items-center gap-8 mx-12">
                  <span className="text-4xl font-black tracking-tighter text-foreground/20 italic hover:text-primary transition-colors cursor-default whitespace-nowrap">{brand}</span>
                  <Sparkles className="w-5 h-5 text-primary/20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }}>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary">Slide to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </section>

  );
}
