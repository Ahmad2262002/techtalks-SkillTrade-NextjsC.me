"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "../../app/(public)/Landing.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePerformanceTier } from "@/lib/performance";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface HeroClientProps {
    children: ReactNode;
    userId?: string | null;
}

export default function HeroClient({ children, userId }: HeroClientProps) {
    const container = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null); // We will need to attach this via a callback or find it
    const specs = usePerformanceTier();

    const [particles, setParticles] = useState<{ left: string; top: string }[]>([]);

    // Generate particles only once on mount to avoid double-render cycle
    useEffect(() => {
        if (!specs?.tier) return;
        const particleCount = specs.tier === 'ultra' ? 40 :
            specs.tier === 'high' ? 25 :
                specs.tier === 'medium' ? 15 : 5;

        setParticles([...Array(particleCount)].map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
        })));
    }, [specs?.tier]);

    useGSAP(() => {
        // IMPORTANT: We need to find the specific elements within the children since refs won't pass through automatically
        // or we assume the structure matches.

        // We can find the title by class since we can't easily pass a ref to a server component child's specific node deeply
        const titleElement = container.current?.querySelector(`.${styles.heroTitle}`) as HTMLElement;
        const originalHTML = titleElement?.innerHTML;

        const splitTextWithLines = (element: HTMLElement): void => {
            if (!element || !originalHTML) return;

            const processNode = (node: Node): string => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent || "";
                    return text.split("").map((c: string) =>
                        `<span class="char" style="display:inline-block; transform: translateZ(0); -webkit-backface-visibility: hidden; backface-visibility: hidden;">${c === " " ? "&nbsp;" : c}</span>`
                    ).join("");
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    if (el.tagName === "BR") return "<br>";
                    const content = Array.from(el.childNodes).map(processNode).join("");
                    const attributes = Array.from(el.attributes)
                        .map(attr => `${attr.name}="${attr.value}"`)
                        .join(" ");
                    return `<${el.tagName.toLowerCase()} ${attributes}>${content}</${el.tagName.toLowerCase()}>`;
                }
                return "";
            };

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = originalHTML;
            element.innerHTML = Array.from(tempDiv.childNodes).map(processNode).join("");
        };

        // Unified Smart Animation Sequence
        const primaryEase = "power4.out";
        const durationMultiplier = specs?.tier === 'ultra' ? 1.6 : specs?.tier === 'high' ? 1.4 : 1.2;
        const isMobile = window.innerWidth < 768;
        const isUltra = specs?.tier === 'ultra';

        if (isUltra && titleElement) {
            splitTextWithLines(titleElement);
        }

        const chars = gsap.utils.toArray<HTMLElement>(".char");
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
            .fromTo(chars.length > 0 ? chars : `.${styles.heroTitle}`, {
                opacity: 0.01,
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
                clearProps: "all",
                force3D: true
            }, "-=1.2");

        // Optimize GSAP ticker for 60fps target
        gsap.ticker.fps(60);
        gsap.ticker.lagSmoothing(1000, 16);

        // Scroll-based parallax (Optimized)
        gsap.to(".parallax-content", {
            scrollTrigger: {
                trigger: container.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
                fastScrollEnd: true,
                preventOverlaps: true
            },
            y: 150,
            opacity: 0.5,
            ease: "none",
            force3D: true
        });

        // Floating particles (Optimized)
        gsap.to(".particle", {
            y: "random(-100, 100)",
            x: "random(-100, 100)",
            opacity: "random(0.1, 0.4)",
            duration: "random(15, 25)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            force3D: true
        });

        // Cursor tracking for spotlight effect (State-less for performance)
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (!container.current) return;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!container.current) return;
                const rect = container.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                container.current.style.setProperty('--mouse-x', `${x}%`);
                container.current.style.setProperty('--mouse-y', `${y}%`);
            });
        };

        container.current?.addEventListener("mousemove", handleMouseMove, { passive: true } as any);

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
            if (titleElement && originalHTML) {
                titleElement.innerHTML = originalHTML;
            }
            container.current?.removeEventListener("mousemove", handleMouseMove);
        };
    }, { scope: container });

    return (
        <section id="hero" ref={container} className={cn(styles.hero, "relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden min-h-[100dvh] flex items-center justify-center w-full max-w-full overflow-x-hidden")}>

            {/* Cursor-following Spotlight */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 hover:opacity-100"
                style={{
                    background: `radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary), 0.15), transparent 40%)`,
                }}
            />

            {/* Mesh Gradient Overlay - Softened for Elegance */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.07),transparent)] pointer-events-none" />

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                {particles.map((p, i) => (
                    <div
                        key={i}
                        className="particle absolute w-1 h-1 bg-primary/20 rounded-full will-change-transform"
                        style={{
                            left: p.left,
                            top: p.top,
                            willChange: "transform"
                        }}
                    />
                ))}
            </div>

            {children}

        </section>
    );
}
