// Stub hook - audio system removed
export const useAudio = () => {
    return {
        playSound: () => { },
        playVoice: () => { },
        startAmbience: async () => { },
        stopAmbience: () => { },
        settings: { masterVolume: 0, sfxEnabled: false, voiceEnabled: false },
        updateSettings: () => { },
        isUnlocked: false,
        atmospheres: {},
        updateAtmosphereProfile: () => { },
    };
};
