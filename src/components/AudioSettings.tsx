"use client";

import React from "react";
import { useAudio } from "@/hooks/use-audio";
import { useCinematic } from "@/context/CinematicContext";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX, Mic, Film } from "lucide-react";

export function AudioSettings() {
    const { settings, updateSettings, playSound } = useAudio();
    const { cinematicMode, toggleCinematicMode } = useCinematic();

    const handleVolumeChange = (vals: number[]) => {
        updateSettings({ masterVolume: vals[0] });
    };

    const handleSfxToggle = (checked: boolean) => {
        updateSettings({ sfxEnabled: checked });
        if (checked) playSound('click_secure');
    };

    const handleVoiceToggle = (checked: boolean) => {
        updateSettings({ voiceEnabled: checked });
        if (checked) playSound('click_secure');
    };

    const handleCinematicToggle = (checked: boolean) => {
        if (checked !== cinematicMode) toggleCinematicMode();
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Master Volume */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Master Volume</Label>
                    <span className="text-[10px] font-mono text-primary">{(settings.masterVolume * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => updateSettings({ masterVolume: settings.masterVolume === 0 ? 0.5 : 0 })}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        {settings.masterVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <Slider
                        value={[settings.masterVolume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Toggles Group */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="sfx-mode" className="text-sm font-medium">Sound Effects</Label>
                    </div>
                    <Switch
                        id="sfx-mode"
                        checked={settings.sfxEnabled}
                        onCheckedChange={handleSfxToggle}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="voice-mode" className="text-sm font-medium">Voice Lines</Label>
                    </div>
                    <Switch
                        id="voice-mode"
                        checked={settings.voiceEnabled}
                        onCheckedChange={handleVoiceToggle}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                            <Label htmlFor="cinematic-mode" className="text-sm font-medium">Cinematic Mode</Label>
                            <span className="text-[10px] text-muted-foreground/60">Ambience & Rich Motion</span>
                        </div>
                    </div>
                    <Switch
                        id="cinematic-mode"
                        checked={cinematicMode}
                        onCheckedChange={handleCinematicToggle}
                    />
                </div>
            </div>
        </div>
    );
}
