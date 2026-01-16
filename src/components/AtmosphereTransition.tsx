"use client";

import { useTheme, CinematicTheme } from "@/context/ThemeContext";
import { useAudio } from "@/hooks/use-audio";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ATMOSPHERE_NAMES: Record<CinematicTheme, string> = {
    maybach: "MAYBACH NOIR",
    fbi: "INVESTIGATION MODE",
    neon: "NEON SYNDICATE",
    light: "EXCLUSIVE LOUNGE"
};

export function AtmosphereTransition() {
    const { theme } = useTheme();
    const { playSound } = useAudio(); // Added useAudio hook
    const [showTransition, setShowTransition] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(theme);

    useEffect(() => {
        if (theme !== currentTheme) {
            setShowTransition(true);
            setCurrentTheme(theme);

            // Signature “stamp” (keep subtle)
            playSound("hub_enter", 0.35, theme);

            const timer = setTimeout(() => {
                setShowTransition(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [theme, currentTheme, playSound]); // Added playSound to dependency array

    return (
        <AnimatePresence>
            {showTransition && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-xl pointer-events-none"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center"
                    >
                        <div className="text-xs font-black uppercase tracking-[0.5em] text-primary/60 mb-4">
                            Atmosphere Recalibrated
                        </div>
                        <div className="text-6xl font-playfair italic font-bold text-foreground">
                            {ATMOSPHERE_NAMES[currentTheme]}
                        </div>
                        <motion.div
                            className="mt-8 h-1 w-64 mx-auto bg-primary/20 rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
