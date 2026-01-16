"use client";

import { useEffect, useRef, useState } from "react";
import { detectPerformanceTier } from "@/lib/performance";

export default function CursorFollower() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorGlowRef = useRef<HTMLDivElement>(null);
    const [isPointer, setIsPointer] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const mousePos = useRef({ x: 0, y: 0 });
    const cursorPos = useRef({ x: 0, y: 0 });
    const glowPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Hide on mobile/touch devices or low-end devices
        if (typeof window !== "undefined" && "ontouchstart" in window) {
            setIsHidden(true);
            return;
        }

        // Detect performance tier
        const perfMetrics = detectPerformanceTier();
        if (perfMetrics.tier === 'low') {
            setIsHidden(true);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            // Check if hovering over interactive element
            const target = e.target as HTMLElement;
            const isInteractive =
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.closest("a") ||
                target.closest("button") ||
                target.classList.contains("proto-btn") ||
                target.classList.contains("stat-card") ||
                target.classList.contains("feature-card");

            setIsPointer(!!isInteractive);
        };

        const handleMouseLeave = () => {
            setIsHidden(true);
        };

        const handleMouseEnter = () => {
            setIsHidden(false);
        };

        // Smooth animation loop
        const animate = () => {
            // Cursor follows with slight delay (easing)
            cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
            cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;

            // Glow follows with more delay for trailing effect
            glowPos.current.x += (mousePos.current.x - glowPos.current.x) * 0.08;
            glowPos.current.y += (mousePos.current.y - glowPos.current.y) * 0.08;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`;
            }

            if (cursorGlowRef.current) {
                cursorGlowRef.current.style.transform = `translate(${glowPos.current.x}px, ${glowPos.current.y}px)`;
            }

            requestAnimationFrame(animate);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        const animationId = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            cancelAnimationFrame(animationId);
        };
    }, []);

    if (isHidden) return null;

    return (
        <>
            {/* Glow effect - More subtle */}
            <div
                ref={cursorGlowRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen transition-opacity duration-300"
                style={{
                    width: "300px",
                    height: "300px",
                    marginLeft: "-150px",
                    marginTop: "-150px",
                    opacity: isPointer ? 0.15 : 0.08,
                }}
            >
                <div
                    className="w-full h-full rounded-full"
                    style={{
                        background: `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)`,
                        filter: "blur(50px)",
                    }}
                />
            </div>

            {/* Main cursor ring - Subtle accent */}
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 pointer-events-none z-[10000] transition-all duration-200 ${isPointer ? "scale-125 opacity-100" : "scale-100 opacity-60"
                    }`}
                style={{
                    width: "32px",
                    height: "32px",
                    marginLeft: "-16px",
                    marginTop: "-16px",
                }}
            >
                <div
                    className={`w-full h-full rounded-full border transition-all duration-200 ${isPointer
                        ? "border-primary/40 bg-primary/5"
                        : "border-primary/20 bg-transparent"
                        }`}
                    style={{
                        boxShadow: isPointer
                            ? "0 0 15px hsl(var(--primary) / 0.3)"
                            : "0 0 8px hsl(var(--primary) / 0.15)",
                    }}
                />
            </div>
        </>
    );
}
