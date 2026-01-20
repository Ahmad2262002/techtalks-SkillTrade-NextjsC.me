"use client";
import React, { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./Background.module.css";
import { detectPerformanceTier } from "@/lib/performance";

export default function AnimatedBackground() {
    const [isLowPerf, setIsLowPerf] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const isMobile = window.innerWidth < 768;
        const perfMetrics = detectPerformanceTier();
        setIsLowPerf(perfMetrics.tier === 'low' || perfMetrics.tier === 'medium');
        const isLowEnd = perfMetrics.tier === 'low';
        const isMediumOrLow = perfMetrics.tier === 'low' || perfMetrics.tier === 'medium';

        // Enhanced mouse movement with magnetic attraction (skip on low-end)
        if (!isMobile && !isLowEnd) {
            let rafId: number;
            const moveOrbs = (e: MouseEvent) => {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    if (containerRef.current) {
                        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
                        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
                    }

                    const x = (e.clientX - window.innerWidth / 2) * 0.02;
                    const y = (e.clientY - window.innerHeight / 2) * 0.02;

                    gsap.to(".orb", {
                        x: (i) => x * (i % 2 === 0 ? 1 : -1) * (i + 1) * 8,
                        y: (i) => y * (i % 2 === 0 ? -1 : 1) * (i + 1) * 8,
                        duration: 8,
                        ease: "expo.out",
                        stagger: 0.1,
                        force3D: true
                    });
                });
            };
            window.addEventListener("mousemove", moveOrbs, { passive: true } as any);
            return () => {
                window.removeEventListener("mousemove", moveOrbs);
                cancelAnimationFrame(rafId);
            };
        }
        // Organic drift animation continues below...

        // Organic drift animation (Simplified for 60fps)
        gsap.to(".orb", {
            x: "random(-50, 50)",
            y: "random(-50, 50)",
            duration: isLowEnd ? 20 : (isMobile ? 15 : 12), // Faster animations
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            force3D: true,
            stagger: {
                amount: isLowEnd ? 1 : (isMobile ? 2 : 3), // Reduced stagger
                from: "random"
            }
        });

        // Pulsing scale animation (skip on low/medium-end)
        if (!isMediumOrLow) {
            gsap.to(".orb", {
                scale: "random(0.98, 1.08)", // Reduced scale range
                duration: 10, // Faster
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: {
                    amount: 1.5, // Reduced
                    from: "random"
                }
            });

            // Rotation for more organic feel
            gsap.to(".orb", {
                rotation: "random(-10, 10)", // Reduced rotation
                duration: 15, // Faster
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

    }, []);

    return (
        <div ref={containerRef} className={styles.bgLayer}>
            <div className={`${styles.orb} orb ${styles.pOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.bOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.aOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.sOrb}`}></div>

            {/* Cursor-following gradient mesh (disabled on low-end) */}
            {!isLowPerf && (
                <div
                    className="fixed inset-0 pointer-events-none z-[1] opacity-30 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle 800px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.15), transparent 50%)`,
                    }}
                />
            )}
        </div>
    );
}
