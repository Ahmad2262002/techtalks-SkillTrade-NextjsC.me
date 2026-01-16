"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useTheme, Theme } from "@/context/ThemeContext";
import { useAudio } from "@/hooks/use-audio";

interface CinematicContextType {
    cinematicMode: boolean;
    toggleCinematicMode: () => void;
    introPlayed: Record<Theme, boolean>;
    playIntro: (theme: Theme) => void;
}

const CinematicContextData = createContext<CinematicContextType | null>(null);

const AMBIENCE_URLS: Record<Theme, string> = {
    "elite-dark": 'https://cdn.pixabay.com/audio/2022/10/05/audio_6863004889.mp3', // Gentle City Rain / Hum
    cybersecurity: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2542a20977.mp3', // Low drone
    programmer: 'https://cdn.pixabay.com/audio/2022/03/15/audio_732a9a46a6.mp3', // Cyber swell
    "elite-light": 'https://cdn.pixabay.com/audio/2022/10/05/audio_6863004889.mp3'
};

export function CinematicProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const { playSound, playVoice, startAmbience, stopAmbience, settings, isUnlocked } = useAudio();

    const [cinematicMode, setCinematicMode] = useState(false);
    const [introPlayed, setIntroPlayed] = useState<Record<Theme, boolean>>({
        programmer: false,
        "elite-light": false,
        "elite-dark": false,
        cybersecurity: false
    });

    const ambienceRef = useRef<HTMLAudioElement | null>(null);

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('skilltrade-cinematic-mode');
        const savedIntros = localStorage.getItem('skilltrade-intro-played');
        if (saved) setCinematicMode(JSON.parse(saved));
        if (savedIntros) setIntroPlayed(JSON.parse(savedIntros));
    }, []);

    useEffect(() => {
        localStorage.setItem('skilltrade-cinematic-mode', JSON.stringify(cinematicMode));
        localStorage.setItem('skilltrade-intro-played', JSON.stringify(introPlayed));
    }, [cinematicMode, introPlayed]);


    // Ambience Logic handled by AudioContext Atmosphere Engine
    useEffect(() => {
        if (!isUnlocked) return;

        if (cinematicMode && settings.sfxEnabled) {
            startAmbience(theme);
        } else {
            stopAmbience();
        }
    }, [theme, cinematicMode, settings.sfxEnabled, isUnlocked, startAmbience, stopAmbience]);


    // Intro Logic
    const playIntro = (targetTheme: Theme) => {
        if (introPlayed[targetTheme]) return;

        // Play Voice
        playVoice('welcome', targetTheme);

        // Mark as played
        setIntroPlayed(prev => ({ ...prev, [targetTheme]: true }));
    };

    const toggleCinematicMode = () => setCinematicMode(prev => !prev);

    return (
        <CinematicContextData.Provider value={{
            cinematicMode,
            toggleCinematicMode,
            introPlayed,
            playIntro
        }}>
            {children}
        </CinematicContextData.Provider>
    );
}

export const useCinematic = () => {
    const context = useContext(CinematicContextData);
    if (!context) throw new Error("useCinematic must be used within CinematicProvider");
    return context;
};
