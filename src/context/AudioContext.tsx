"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

export type SoundType = 'notification' | 'success' | 'error' | 'click' | 'chat-send' | 'chat-receive' | 'login' | 'logout';

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

            // iOS-Style & Luxury System Sounds
            switch (type) {
                case 'click':
                    // "Taptic" Click
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(150, now);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.005);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;

                case 'success':
                    // Clean, rising chime
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, now);
                    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;

                case 'chat-send':
                    // "Pop" (iPhone Sent) - Quick, hollow wood/bubble pop
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.15 * volume, now + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'chat-receive':
                    // "Note" (iPhone Received) - Two distinct, clean bell tones (A4 -> E5)
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now); // A4
                    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.02);
                    gain.gain.setValueAtTime(0.2 * volume, now + 0.08); // Sustain first
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.12); // Pulse second
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

                    osc.start(now);
                    osc.stop(now + 0.5);

                    // Add a high shimmery overtone
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(880, now);
                    osc2.frequency.setValueAtTime(1318.5, now + 0.1);
                    gain2.gain.setValueAtTime(0, now);
                    gain2.gain.linearRampToValueAtTime(0.05 * volume, now + 0.02);
                    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc2.start(now);
                    osc2.stop(now + 0.3);
                    break;

                case 'login':
                    // Luxury Swell - Low piano-style chord fading in with shimmery harmonics
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(65.41, now); // C2
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.5); // Slow swell
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

                    // Shimmer harmonic 1
                    const harm1 = ctx.createOscillator();
                    const hGain1 = ctx.createGain();
                    harm1.connect(hGain1);
                    hGain1.connect(ctx.destination);
                    harm1.type = 'sine';
                    harm1.frequency.setValueAtTime(130.81, now); // C3
                    hGain1.gain.setValueAtTime(0, now);
                    hGain1.gain.linearRampToValueAtTime(0.1 * volume, now + 0.8);
                    hGain1.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

                    // Shimmer harmonic 2 (Luxury bell)
                    const harm2 = ctx.createOscillator();
                    const hGain2 = ctx.createGain();
                    harm2.connect(hGain2);
                    hGain2.connect(ctx.destination);
                    harm2.type = 'sine';
                    harm2.frequency.setValueAtTime(523.25, now + 0.4); // Sparkle appears later
                    hGain2.gain.setValueAtTime(0, now);
                    hGain2.gain.linearRampToValueAtTime(0, now + 0.4);
                    hGain2.gain.linearRampToValueAtTime(0.05 * volume, now + 0.8);
                    hGain2.gain.exponentialRampToValueAtTime(0.01, now + 3.0);

                    osc.start(now);
                    harm1.start(now);
                    harm2.start(now);
                    osc.stop(now + 3.0);
                    harm1.stop(now + 3.0);
                    harm2.stop(now + 3.0);
                    break;

                case 'logout':
                    // Luxury Descent - Deep breathy exhale with a final soft "thud"
                    osc.type = 'sine'; // Breathy component
                    osc.frequency.setValueAtTime(110, now);
                    osc.frequency.exponentialRampToValueAtTime(55, now + 1.2);

                    gain.gain.setValueAtTime(0.15 * volume, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

                    // Noise-like exhale
                    const whiteNoise = ctx.createOscillator(); // Using a low square for breathiness
                    const nGain = ctx.createGain();
                    whiteNoise.connect(nGain);
                    nGain.connect(ctx.destination);
                    whiteNoise.type = 'square';
                    whiteNoise.frequency.setValueAtTime(50, now);
                    nGain.gain.setValueAtTime(0.02 * volume, now);
                    nGain.gain.linearRampToValueAtTime(0.01, now + 0.8);
                    nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

                    osc.start(now);
                    whiteNoise.start(now);
                    osc.stop(now + 1.5);
                    whiteNoise.stop(now + 1.5);
                    break;

                case 'notification':
                    // "Tri-tone"
                    osc.frequency.setValueAtTime(523.25, now);
                    osc.frequency.setValueAtTime(440.00, now + 0.15);
                    osc.frequency.setValueAtTime(587.33, now + 0.3);

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.05);
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.1);
                    gain.gain.linearRampToValueAtTime(0.1 * volume, now + 0.2);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.6);

                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;
                case 'error':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(80, now);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.02);
                    gain.gain.linearRampToValueAtTime(0, now + 0.15);

                    gain.gain.linearRampToValueAtTime(0, now + 0.25);
                    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.27);
                    gain.gain.linearRampToValueAtTime(0, now + 0.4);

                    osc.start(now);
                    osc.stop(now + 0.45);
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
