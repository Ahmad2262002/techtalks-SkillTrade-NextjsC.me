"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const container = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useGSAP(() => {
        // Simple, high-performance fade-in + slide-up
        gsap.fromTo(
            container.current,
            { opacity: 0, y: 20, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }
        );
    }, { scope: container, dependencies: [pathname] });

    return (
        <div ref={container} className="w-full">
            {children}
        </div>
    );
}
