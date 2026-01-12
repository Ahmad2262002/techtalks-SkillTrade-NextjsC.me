"use client";
import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./Background.module.css";

export default function AnimatedBackground() {
    useGSAP(() => {
        const isMobile = window.innerWidth < 768;

        // Skip mouse movement logic on mobile to save battery and main thread
        if (!isMobile) {
            const moveOrbs = (e: MouseEvent) => {
                const x = (e.clientX - window.innerWidth / 2) * 0.15;
                const y = (e.clientY - window.innerHeight / 2) * 0.15;

                gsap.to(".orb", {
                    x: (i) => x * (i % 2 === 0 ? 1 : -1) * (i + 1),
                    y: (i) => y * (i % 2 === 0 ? -1 : 1) * (i + 1),
                    duration: 6,
                    ease: "expo.out",
                    stagger: 0.15
                });
            };
            window.addEventListener("mousemove", moveOrbs);
            return () => window.removeEventListener("mousemove", moveOrbs);
        }

        // Simpler drift for both mobile and desktop
        gsap.to(".orb", {
            x: "+=30",
            y: "-=20",
            duration: isMobile ? 20 : 15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: {
                amount: isMobile ? 2 : 4,
                from: "random"
            }
        });

        // Even simpler scaling
        gsap.to(".orb", {
            scale: 1.1,
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

    }, []);

    return (
        <div className={styles.bgLayer}>
            <div className={`${styles.orb} orb ${styles.pOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.bOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.aOrb}`}></div>
            <div className={`${styles.orb} orb ${styles.sOrb}`}></div>
        </div>
    );
}
