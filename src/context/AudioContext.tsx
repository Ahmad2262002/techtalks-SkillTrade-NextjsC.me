"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

export type SoundType = 'notification' | 'success' | 'error' | 'click' | 'chat-send' | 'chat-receive';

interface AudioContextType {
    playSound: (type: SoundType) => void;
    volume: number;
    setVolume: (volume: number) => void;
    isMuted: boolean;
    setIsMuted: (isMuted: boolean) => void;
}

const AudioContextData = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const sounds = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load settings from localStorage
        const savedVolume = localStorage.getItem('skilltrade_audio_volume');
        const savedMuted = localStorage.getItem('skilltrade_audio_muted');

        if (savedVolume) setVolume(parseFloat(savedVolume));
        if (savedMuted) setIsMuted(savedMuted === 'true');

        /* 
        // Preload sounds - Commented out to prevent 404s since assets are missing
        const soundFiles: SoundType[] = ['notification', 'success', 'error', 'click'];
        soundFiles.forEach(type => {
            try {
                const audio = new Audio(`/sounds/${type}.mp3`);
                audio.preload = 'auto';
                sounds.current[type] = audio;
            } catch (e) {
                console.warn(`Failed to initialize audio for ${type}:`, e);
            }
        });
        */
    }, []);

    // Persist settings
    useEffect(() => {
        localStorage.setItem('skilltrade_audio_volume', volume.toString());
        localStorage.setItem('skilltrade_audio_muted', isMuted.toString());
    }, [volume, isMuted]);

    const playSynthFallback = (type: SoundType) => {
        if (typeof window === 'undefined') return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            // iOS-Style System Sounds
            switch (type) {
                case 'click':
                    // "Taptic" Click - Short, low frequency, dull
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(150, now);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.3, now + 0.005);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;

                case 'success':
                    // "Payment Success" - Clean, rising chime (Apple Pay style)
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, now); // D5
                    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

                    const oscS2 = ctx.createOscillator();
                    const gainS2 = ctx.createGain();
                    oscS2.connect(gainS2);
                    gainS2.connect(ctx.destination);
                    oscS2.frequency.setValueAtTime(880, now); // A5

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                    gainS2.gain.setValueAtTime(0, now);
                    gainS2.gain.linearRampToValueAtTime(0.1, now + 0.05);
                    gainS2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                    osc.start(now);
                    osc.stop(now + 0.6);
                    oscS2.start(now);
                    oscS2.stop(now + 0.6);
                    break;
                case 'error':
                    // "Haptic Failure" - Low, double pulse
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(80, now);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
                    gain.gain.linearRampToValueAtTime(0, now + 0.15); // End pulse 1

                    gain.gain.linearRampToValueAtTime(0, now + 0.25); // Gap
                    gain.gain.linearRampToValueAtTime(0.2, now + 0.27); // Start pulse 2
                    gain.gain.linearRampToValueAtTime(0, now + 0.4);

                    osc.start(now);
                    osc.stop(now + 0.45);
                    break;
                case 'notification':
                    // "Tri-tone" (Classic iOS) - Three distinct notes
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(440.00, now + 0.15); // A4
                    osc.frequency.setValueAtTime(587.33, now + 0.3); // D5

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
                    gain.gain.setValueAtTime(0.2, now + 0.1);
                    gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.6);

                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;
                case 'chat-send':
                    // "Swoosh" / "Pop" - Quick upward swipe
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                case 'chat-receive':
                    // "Note" (Modern iOS) - Clean, simple bell
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now); // A5

                    // Add a slight overtone for "bell" character
                    const oscR2 = ctx.createOscillator();
                    const gainR2 = ctx.createGain();
                    oscR2.connect(gainR2);
                    gainR2.connect(ctx.destination);
                    oscR2.frequency.setValueAtTime(1760, now); // A6 (Octave up)

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

                    gainR2.gain.setValueAtTime(0, now);
                    gainR2.gain.linearRampToValueAtTime(0.05, now + 0.01);
                    gainR2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                    osc.start(now);
                    osc.stop(now + 0.4);
                    oscR2.start(now);
                    oscR2.stop(now + 0.2);
                    break;
            }
        } catch (e) {
            console.warn('Synth fallback failed:', e);
        }
    };

    const playSound = (type: SoundType) => {
        if (isMuted) return;

        // Always use synthesis-based audio until .mp3 assets are provided in /public/sounds
        playSynthFallback(type);
    };

    return (
        <AudioContextData.Provider value={{ playSound, volume, setVolume, isMuted, setIsMuted }}>
            {children}
        </AudioContextData.Provider>
    );
}

export const useAudioContext = () => {
    const context = useContext(AudioContextData);

    if (!context) {
        // Fallback for SSR or missing provider to prevent crash
        return {
            playSound: () => { },
            volume: 0.5,
            setVolume: () => { },
            isMuted: false,
            setIsMuted: () => { }
        };
    }
    return context;
};
