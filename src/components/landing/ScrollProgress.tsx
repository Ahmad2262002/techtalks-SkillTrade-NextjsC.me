"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;

            const totalScrollable = documentHeight - windowHeight;
            const scrollProgress = (scrollTop / totalScrollable) * 100;

            setProgress(Math.min(scrollProgress, 100));
            setIsVisible(scrollTop > 100);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Progress bar */}
            <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] animate-gradient-x transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
                }}
            />

            {/* Percentage indicator */}
            <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-xl border border-primary/20 text-xs font-black text-primary transition-all duration-300"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(-10px)",
                }}
            >
                {Math.round(progress)}%
            </div>
        </div>
    );
}
