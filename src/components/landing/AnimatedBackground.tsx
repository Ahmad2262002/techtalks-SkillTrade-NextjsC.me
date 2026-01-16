"use client";
import React, { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./Background.module.css";
import { detectPerformanceTier } from "@/lib/performance";

export default function AnimatedBackground() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isLowPerf, setIsLowPerf] = useState(false);

    useGSAP(() => {
        const isMobile = window.innerWidth < 768;
        const perfMetrics = detectPerformanceTier();
        const isLowEnd = perfMetrics.tier === 'low';
        setIsLowPerf(isLowEnd);

        // Enhanced mouse movement with magnetic attraction (skip on low-end)
        if (!isMobile && !isLowEnd) {
            const moveOrbs = (e: MouseEvent) => {
                const x = (e.clientX - window.innerWidth / 2) * 0.02;
                const y = (e.clientY - window.innerHeight / 2) * 0.02;

                setMousePos({ x: e.clientX, y: e.clientY });

                gsap.to(".orb", {
                    x: (i) => x * (i % 2 === 0 ? 1 : -1) * (i + 1) * 8,
                    y: (i) => y * (i % 2 === 0 ? -1 : 1) * (i + 1) * 8,
                    duration: 8,
                    ease: "expo.out",
                    stagger: 0.2
                });
            };
            window.addEventListener("mousemove", moveOrbs);
            return () => window.removeEventListener("mousemove", moveOrbs);
        }

        // Organic drift animation (simplified on low-end)
        gsap.to(".orb", {
            x: "random(-50, 50)",
            y: "random(-50, 50)",
            duration: isLowEnd ? 30 : (isMobile ? 25 : 20),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: {
                amount: isLowEnd ? 2 : (isMobile ? 3 : 5),
                from: "random"
            }
        });

        // Pulsing scale animation (skip on low-end)
        if (!isLowEnd) {
            gsap.to(".orb", {
                scale: "random(0.95, 1.15)",
                duration: 15,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: {
                    amount: 2,
                    from: "random"
                }
            });

            // Rotation for more organic feel
            gsap.to(".orb", {
                rotation: "random(-15, 15)",
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

    }, []);

    return (
        <div className={styles.bgLayer}>
            <div className={`${styles.orb} orb ${styles.pOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.bOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.aOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.sOrb}`}></div>

            {/* Cursor-following gradient mesh (disabled on low-end) */}
            {!isLowPerf && (
                <div
                    className="fixed inset-0 pointer-events-none z-[1] opacity-30 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 50%)`,
                    }}
                />
            )}
        </div>
    );
}
