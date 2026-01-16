"use client";

import React from 'react';
import { useAudio } from "@/hooks/use-audio";
import { useTheme, Theme } from "@/context/ThemeContext";

// Local type for stubbed atmosphere profile
export interface AtmosphereProfile {
    name: string;
    tagline: string;
    masterPresenceDb: number;
    masterWarmthDb: number;
    masterStereoWidth: number;
    masterComp: { threshold: number; ratio: number };
    ambienceVolume: number;
    ambienceLPF: number;
    ambienceHPF: number;
    hoverThrottleMs: number;
    clickHumanize: number;
}
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RotateCcw, Activity, Mic, Music, Sliders } from "lucide-react";

export function SonicLaboratory() {
    const {
        atmospheres,
        updateAtmosphereProfile,
        startAmbience,
        playSound,
        settings
    } = useAudio();
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    // Only show in dev or via secret trigger (ctrl+shift+L)?
    // For now, let's just make it a floating orb in the corner.

    const activeProfile = atmospheres[theme] || atmospheres.maybach;

    const handleUpdate = (field: keyof AtmosphereProfile, value: number | string | object) => {
        updateAtmosphereProfile(theme, { [field]: value });
    };

    const handleNestedUpdate = (parent: "masterComp", field: "threshold" | "ratio", value: number) => {
        updateAtmosphereProfile(theme, {
            [parent]: {
                ...activeProfile[parent],
                [field]: value
            }
        });
    };

    if (!atmospheres) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-black/90 text-primary border border-primary/30 p-3 rounded-full shadow-2xl hover:bg-primary/20 transition-colors backdrop-blur-md"
                        onClick={() => setIsOpen(true)}
                    >
                        <Activity className="w-5 h-5 animate-pulse" />
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-[400px] bg-black/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase">
                                <Activity className="w-4 h-4" />
                                <span>Sonic Laboratory</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Theme Info */}
                        <div className="p-4 bg-primary/5 border-b border-primary/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white/50 uppercase tracking-wider text-[10px]">Active Calibration</span>
                                <span className="text-primary font-bold">{activeProfile.name}</span>
                            </div>
                            <div className="text-[10px] text-white/40 italic truncate">{activeProfile.tagline}</div>
                        </div>

                        {/* Scroll Content */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-6">

                            {/* MASTER BUS */}
                            <section>
                                <div className="flex items-center gap-2 mb-3 text-white/80 font-bold border-b border-white/10 pb-1">
                                    <Sliders className="w-3 h-3 text-primary" />
                                    <span>Master Chain</span>
                                </div>
                                <div className="space-y-3">
                                    <SliderControl
                                        label="Presence (2.8k)"
                                        value={activeProfile.masterPresenceDb}
                                        min={-12} max={12} step={0.1}
                                        onChange={(v) => handleUpdate("masterPresenceDb", v)}
                                    />
                                    <SliderControl
                                        label="Warmth (200Hz)"
                                        value={activeProfile.masterWarmthDb}
                                        min={-12} max={12} step={0.1}
                                        onChange={(v) => handleUpdate("masterWarmthDb", v)}
                                    />
                                    <SliderControl
                                        label="Stereo Width"
                                        value={activeProfile.masterStereoWidth}
                                        min={0} max={2} step={0.05}
                                        onChange={(v) => handleUpdate("masterStereoWidth", v)}
                                    />
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <SliderControl
                                            label="Comp Threshold"
                                            value={activeProfile.masterComp.threshold}
                                            min={-60} max={0} step={1}
                                            onChange={(v) => handleNestedUpdate("masterComp", "threshold", v)}
                                        />
                                        <SliderControl
                                            label="Comp Ratio"
                                            value={activeProfile.masterComp.ratio}
                                            min={1} max={20} step={0.5}
                                            onChange={(v) => handleNestedUpdate("masterComp", "ratio", v)}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* AMBIENCE */}
                            <section>
                                <div className="flex items-center gap-2 mb-3 text-white/80 font-bold border-b border-white/10 pb-1">
                                    <Music className="w-3 h-3 text-primary" />
                                    <span>Atmosphere Bed</span>
                                </div>
                                <div className="space-y-3">
                                    <SliderControl
                                        label="Volume"
                                        value={activeProfile.ambienceVolume}
                                        min={0} max={1} step={0.01}
                                        onChange={(v) => handleUpdate("ambienceVolume", v)}
                                    />
                                    <SliderControl
                                        label="LPF (Cutoff)"
                                        value={activeProfile.ambienceLPF}
                                        min={500} max={20000} step={100}
                                        onChange={(v) => handleUpdate("ambienceLPF", v)}
                                    />
                                    <SliderControl
                                        label="HPF (Rumble)"
                                        value={activeProfile.ambienceHPF}
                                        min={10} max={500} step={10}
                                        onChange={(v) => handleUpdate("ambienceHPF", v)}
                                    />
                                </div>
                            </section>

                            {/* BEHAVIOR */}
                            <section>
                                <div className="flex items-center gap-2 mb-3 text-white/80 font-bold border-b border-white/10 pb-1">
                                    <Mic className="w-3 h-3 text-primary" />
                                    <span>Behavior</span>
                                </div>
                                <div className="space-y-3">
                                    <SliderControl
                                        label="Hover Throttle (ms)"
                                        value={activeProfile.hoverThrottleMs}
                                        min={0} max={500} step={10}
                                        onChange={(v) => handleUpdate("hoverThrottleMs", v)}
                                    />
                                    <SliderControl
                                        label="Humanize (Var)"
                                        value={activeProfile.clickHumanize}
                                        min={0} max={0.1} step={0.005}
                                        onChange={(v) => handleUpdate("clickHumanize", v)}
                                    />
                                </div>
                            </section>

                            <div className="pt-4 flex justify-between">
                                <button
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] rounded flex items-center gap-1"
                                    onClick={() => startAmbience(theme)}
                                >
                                    <RotateCcw className="w-3 h-3" /> Restart Audio
                                </button>
                                <div className="text-[10px] text-zinc-500">
                                    Changes apply instantly.
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SliderControl({ label, value, min, max, step, onChange }: {
    label: string, value: number, min: number, max: number, step: number,
    onChange: (val: number) => void
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-white/60">
                <span>{label}</span>
                <span className="text-primary font-mono">{Math.round(value * 100) / 100}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
    );
}
