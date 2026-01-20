/**
 * Performance detection utility for adaptive rendering
 * Detects device capabilities and returns performance tier
 */

export type PerformanceTier = 'ultra' | 'high' | 'medium' | 'low';

export interface PerformanceMetrics {
    tier: PerformanceTier;
    deviceMemory?: number;
    hardwareConcurrency?: number;
    gpu?: string;
    connectionSpeed?: string;
    reducedMotion: boolean;
}

// Singleton cache for performance metrics
let cachedMetrics: PerformanceMetrics | null = null;

/**
 * Detect device performance tier
 */
export function detectPerformanceTier(): PerformanceMetrics {
    if (typeof window === 'undefined') {
        return {
            tier: 'medium',
            reducedMotion: false,
        };
    }

    if (cachedMetrics) return cachedMetrics;

    // Check for reduced motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Get device memory (GB) - Chrome only
    const deviceMemory = (navigator as any).deviceMemory || 4;

    // Get CPU cores
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    // Detect Brave browser
    const isBrave = !!(navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';

    // Detect GPU
    let gpu = 'unknown';
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
    } catch (e) { }

    // Get connection speed
    const connection = (navigator as any).connection;
    const connectionSpeed = connection?.effectiveType || '4g';

    // Determine tier based on metrics
    let tier: PerformanceTier = 'medium';

    const isDiscreteGPU = /NVIDIA|AMD|Radeon|GeForce|RTX/i.test(gpu);
    const isHighEndSilicon = /Apple M[1-9]/i.test(gpu);

    // Brave browser may have shields that affect performance detection
    // Use more conservative tier if Brave is detected
    if (isBrave) {
        if ((hardwareConcurrency >= 8 && deviceMemory >= 8) || isHighEndSilicon) {
            tier = 'high'; // Cap at high for Brave
        } else if (hardwareConcurrency >= 6 || deviceMemory >= 8) {
            tier = 'medium';
        } else if (hardwareConcurrency >= 4) {
            tier = 'medium';
        } else {
            tier = 'low';
        }
    } else {
        if ((hardwareConcurrency >= 8 && isDiscreteGPU) || isHighEndSilicon) {
            tier = 'ultra';
        } else if (hardwareConcurrency >= 6 || isDiscreteGPU || deviceMemory >= 8) {
            tier = 'high';
        } else if (hardwareConcurrency >= 4) {
            tier = 'medium';
        } else {
            tier = 'low';
        }
    }

    // Override to low if reduced motion is preferred
    if (reducedMotion) {
        tier = 'low';
    }

    cachedMetrics = {
        tier,
        deviceMemory,
        hardwareConcurrency,
        gpu,
        connectionSpeed,
        reducedMotion,
    };

    return cachedMetrics;
}

/**
 * Get particle count based on performance tier
 */
export function getParticleCount(tier: PerformanceTier): number {
    switch (tier) {
        case 'ultra':
            return 50; // Reduced from 100
        case 'high':
            return 30; // Reduced from 60
        case 'medium':
            return 15; // Reduced from 30
        case 'low':
            return 8;  // Reduced from 15
        default:
            return 15;
    }
}

/**
 * Check if animations should be enabled
 */
export function shouldEnableAnimations(tier: PerformanceTier): boolean {
    return tier !== 'low';
}

/**
 * Get animation complexity level
 */
export function getAnimationComplexity(tier: PerformanceTier): 'full' | 'high' | 'balanced' | 'reduced' | 'minimal' {
    switch (tier) {
        case 'ultra':
            return 'full';
        case 'high':
            return 'high';
        case 'medium':
            return 'balanced';
        case 'low':
            return 'minimal';
        default:
            return 'balanced';
    }
}

/**
 * Hook to use performance metrics in components
 */
import { useState, useEffect } from 'react';

export function usePerformanceTier() {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

    useEffect(() => {
        setMetrics(detectPerformanceTier());
    }, []);

    return metrics;
}
