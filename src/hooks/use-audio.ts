// Stub hook - audio system removed
export const useAudio = () => {
    return {
        playSound: (..._args: any[]) => { },
        playVoice: (..._args: any[]) => { },
        startAmbience: async (..._args: any[]) => { },
        stopAmbience: (..._args: any[]) => { },
        settings: { masterVolume: 0, sfxEnabled: false, voiceEnabled: false },
        updateSettings: () => { },
        isUnlocked: false,
        atmospheres: {},
        updateAtmosphereProfile: () => { },
    };
};
