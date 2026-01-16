"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, Trophy } from "lucide-react";
import styles from "../../app/(public)/Landing.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PostProposalModal } from "@/components/PostProposalModal";
import Image from "next/image";
import { usePerformanceTier } from "@/lib/performance";
// Audio removed for simplicity

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero({ userId }: { userId?: string | null }) {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const specs = usePerformanceTier();

  const [particles, setParticles] = useState<{ left: string; top: string }[]>([]);

  useGSAP(() => {
    // Dynamic Particle Count based on Hardware Specs
    const particleCount = specs?.tier === 'ultra' ? 60 :
      specs?.tier === 'high' ? 40 :
        specs?.tier === 'medium' ? 20 : 10;

    setParticles([...Array(particleCount)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    })));

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

    // Unified Smart Animation Sequence
    const primaryEase = "power4.out";
    const durationMultiplier = specs?.tier === 'ultra' ? 1.6 : specs?.tier === 'high' ? 1.4 : 1.2;
    const isMobile = window.innerWidth < 768;

    splitTextWithLines(`.${styles.heroTitle}`);
    const chars = gsap.utils.toArray(".char");
    const introTl = gsap.timeline();

    // Universal entrance sequence adjusted by spec tier
    introTl
      .fromTo(".hero-badge", {
        opacity: 0,
        y: isMobile ? -20 : -10,
        scale: isMobile ? 0.9 : 1
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: (isMobile ? 1.2 : 1.8) * durationMultiplier,
        ease: primaryEase,
        clearProps: specs?.tier === 'ultra' ? "" : "all"
      })
      .fromTo(chars, {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        stagger: specs?.tier === 'ultra' ? 0.02 : specs?.tier === 'high' ? 0.01 : 0,
        duration: (isMobile ? 1.2 : 2) * durationMultiplier,
        ease: primaryEase,
        clearProps: specs?.tier === 'ultra' ? "" : "all"
      }, "-=2.8")
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
      .fromTo(`.${styles.heroActions}`, {
        opacity: 0,
        y: 20,
        scale: 0.95
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
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
        stagger: specs?.tier === 'ultra' ? 0.1 : 0.05,
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

    // Floating particles
    gsap.to(".particle", {
      y: "random(-100, 100)",
      x: "random(-100, 100)",
      opacity: "random(0.1, 0.4)",
      duration: "random(15, 25)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Cursor tracking for spotlight effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!container.current) return;
      const rect = container.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCursorPos({ x, y });
    };

    container.current?.addEventListener("mousemove", handleMouseMove);

    // Enhanced Magnetic Button Effect with Spring Physics
    const magneticBtns = container.current?.querySelectorAll(".proto-btn") as NodeListOf<HTMLElement>;
    magneticBtns.forEach(btn => {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, {
          scale: 1.05,
          duration: 0.4,
          ease: "power2.out"
        });

      });

      btn.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);
        gsap.to(btn, {
          x: x * 0.4,
          y: y * 0.4,
          duration: 0.5,
          ease: "power3.out"
        });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out"
        });
      });
    });

    // Floating animation for hero badge
    gsap.to(".hero-badge", {
      y: -10,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      if (titleRef.current && originalHTML) {
        titleRef.current.innerHTML = originalHTML;
      }
    };
  }, { scope: container });

  return (
    <section id="hero" ref={container} className={cn(styles.hero, "relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden min-h-[100dvh] flex items-center justify-center w-full max-w-full overflow-x-hidden")}>

      {/* Cursor-following Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 hover:opacity-100"
        style={{
          background: `radial-gradient(circle 600px at ${cursorPos.x}% ${cursorPos.y}%, rgba(var(--primary), 0.15), transparent 40%)`,
        }}
      />

      {/* Mesh Gradient Overlay - Softened for Elegance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.07),transparent)] pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: p.left,
              top: p.top,
            }}
          />
        ))}
      </div>

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
                "https://randomuser.me/api/portraits/women/44.jpg",
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/68.jpg",
                "https://randomuser.me/api/portraits/men/86.jpg",
                "https://randomuser.me/api/portraits/women/12.jpg"
              ].map((src, i) => (
                <div key={i} className="relative w-10 h-10 rounded-full border-2 border-background overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500 shadow-lg cursor-pointer" title="Elite Learner">
                  <Image
                    src={src}
                    alt="Elite Learner"
                    fill
                    className="object-cover"
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
        <h1 ref={titleRef} className={cn(styles.heroTitle, "mb-10 font-playfair font-medium px-4 break-words text-5xl sm:text-7xl md:text-8xl leading-[1.05] tracking-tight text-balance")}>
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-pulse-slow opacity-30 hover:opacity-100 transition-all duration-500 cursor-pointer group" onClick={() => {
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }}>
          <span className="text-[9px] font-medium uppercase tracking-[0.6em] text-primary/40 group-hover:text-primary/80 transition-all duration-700">Ascend</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </section>
  );
}
