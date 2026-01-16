// Stub hook - audio system removed
export const useAudio = () => {
    const dummyProfile = {
        name: "Default",
        tagline: "Atmosphere Recalibrated",
        masterPresenceDb: 0,
        masterWarmthDb: 0,
        masterStereoWidth: 1,
        masterComp: { threshold: -20, ratio: 4 },
        ambienceVolume: 0.5,
        ambienceLPF: 20000,
        ambienceHPF: 20,
        hoverThrottleMs: 100,
        clickHumanize: 0.01,
    };

    return {
        playSound: (..._args: any[]) => { },
        playVoice: (..._args: any[]) => { },
        startAmbience: async (..._args: any[]) => { },
        stopAmbience: (..._args: any[]) => { },
        settings: { masterVolume: 0, sfxEnabled: false, voiceEnabled: false },
        updateSettings: (..._args: any[]) => { },
        isUnlocked: false,
        atmospheres: {
            programmer: dummyProfile,
            "elite-light": dummyProfile,
            "elite-dark": dummyProfile,
            cybersecurity: dummyProfile,
            // Fallback for any old theme names
            maybach: dummyProfile,
            fbi: dummyProfile,
            neon: dummyProfile,
            light: dummyProfile,
        } as any,
        updateAtmosphereProfile: (..._args: any[]) => { },
    };
};
