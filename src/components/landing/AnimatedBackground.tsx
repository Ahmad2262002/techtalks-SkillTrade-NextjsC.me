"use client";
import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./Background.module.css";

export default function AnimatedBackground() {
    useGSAP(() => {
        const moveOrbs = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.15;
            const y = (e.clientY - window.innerHeight / 2) * 0.15;

            gsap.to(".orb", {
                x: (i) => x * (i % 2 === 0 ? 1 : -1) * (i + 1),
                y: (i) => y * (i % 2 === 0 ? -1 : 1) * (i + 1),
                duration: 6, // Ultra-viscous
                ease: "expo.out",
                stagger: 0.15
            });
        };

        window.addEventListener("mousemove", moveOrbs);

        // Slow cinematic drift
        gsap.to(".orb", {
            x: "+=50",
            y: "-=30",
            duration: 15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: {
                amount: 4,
                from: "random"
            }
        });

        // Slight scaling pulse
        gsap.to(".orb", {
            scale: 1.15,
            duration: 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        return () => window.removeEventListener("mousemove", moveOrbs);
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
