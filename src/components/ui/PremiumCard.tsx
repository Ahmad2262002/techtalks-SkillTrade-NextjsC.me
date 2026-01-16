"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface PremiumCardProps extends HTMLMotionProps<"div"> {
    variant?: "glass" | "solid" | "ghost";
    glowing?: boolean;
}

export function PremiumCard({
    className,
    variant = "glass",
    glowing = false,
    children,
    ...props
}: PremiumCardProps) {

    const variants = {
        glass: "glass-panel bg-card/40 backdrop-blur-xl border border-white/5",
        solid: "bg-card border border-border shadow-soft",
        ghost: "bg-transparent border border-transparent hover:bg-card/30"
    };

    return (
        <motion.div
            className={cn(
                "relative rounded-[1.5rem] overflow-hidden group transition-all duration-500",
                variants[variant],
                glowing && "shadow-premium-glow border-primary/20",
                "premium-shimmer", // Always add subtle shimmer possibility
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Premium "outfit" ease
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
            {...props}
        >
            {/* Dynamic Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Content */}
            <motion.div className="relative z-10">
                {children}
            </motion.div>
        </motion.div>
    );
}
