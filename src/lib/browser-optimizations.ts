/**
 * Browser-specific optimizations and detection
 * Handles Brave, Chrome, Firefox, Safari, and Edge
 */

export interface BrowserInfo {
    name: 'brave' | 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
    version: string;
    isChromium: boolean;
    supportsOffscreenCanvas: boolean;
    supportsWebGL2: boolean;
    hasShields: boolean; // Brave Shields
}

/**
 * Detect browser and its capabilities
 */
export function detectBrowser(): BrowserInfo {
    if (typeof window === 'undefined') {
        return {
            name: 'unknown',
            version: '0',
            isChromium: false,
            supportsOffscreenCanvas: false,
            supportsWebGL2: false,
            hasShields: false,
        };
    }

    const ua = navigator.userAgent;
    let name: BrowserInfo['name'] = 'unknown';
    let version = '0';
    let isChromium = false;

    // Detect Brave (must be checked before Chrome)
    const isBrave = !!(navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';

    if (isBrave) {
        name = 'brave';
        isChromium = true;
    } else if (ua.includes('Edg/')) {
        name = 'edge';
        isChromium = true;
        version = ua.match(/Edg\/(\d+)/)?.[1] || '0';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
        name = 'chrome';
        isChromium = true;
        version = ua.match(/Chrome\/(\d+)/)?.[1] || '0';
    } else if (ua.includes('Firefox/')) {
        name = 'firefox';
        version = ua.match(/Firefox\/(\d+)/)?.[1] || '0';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        name = 'safari';
        version = ua.match(/Version\/(\d+)/)?.[1] || '0';
    }

    // Check for OffscreenCanvas support
    const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

    // Check for WebGL2 support
    let supportsWebGL2 = false;
    try {
        const canvas = document.createElement('canvas');
        supportsWebGL2 = !!canvas.getContext('webgl2');
    } catch (e) {
        supportsWebGL2 = false;
    }

    return {
        name,
        version,
        isChromium,
        supportsOffscreenCanvas,
        supportsWebGL2,
        hasShields: isBrave, // Brave always has shields
    };
}

/**
 * Apply browser-specific optimizations
 */
export function applyBrowserOptimizations(): void {
    if (typeof window === 'undefined') return;

    const browser = detectBrowser();

    // Brave-specific optimizations
    if (browser.name === 'brave') {
        // Brave Shields can block some features, use fallbacks
        // Disable some aggressive animations if shields are active
        document.documentElement.style.setProperty('--animation-complexity', 'balanced');
    }

    // Safari-specific optimizations
    if (browser.name === 'safari') {
        // Safari has different rendering engine, optimize accordingly
        document.documentElement.style.setProperty('--blur-quality', 'medium');
    }

    // Firefox-specific optimizations
    if (browser.name === 'firefox') {
        // Firefox handles backdrop-filter differently
        document.documentElement.style.setProperty('--use-backdrop-filter', 'false');
    }

    // Enable hardware acceleration hints
    if (browser.isChromium) {
        document.documentElement.classList.add('chromium-browser');
    }
}

/**
 * Get optimal canvas context settings based on browser
 */
export function getCanvasContextOptions(browser?: BrowserInfo): CanvasRenderingContext2DSettings {
    const info = browser || detectBrowser();

    return {
        alpha: true,
        desynchronized: info.isChromium, // Better performance on Chromium
        willReadFrequently: false,
    };
}

/**
 * Check if browser supports passive event listeners
 */
export function supportsPassiveEvents(): boolean {
    if (typeof window === 'undefined') return false;

    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: () => {
                supportsPassive = true;
                return true;
            },
        });
        window.addEventListener('testPassive', () => { }, opts);
        window.removeEventListener('testPassive', () => { }, opts);
    } catch (e) {
        supportsPassive = false;
    }
    return supportsPassive;
}

/**
 * Get event listener options with passive support
 */
export function getEventListenerOptions(passive = true): AddEventListenerOptions | boolean {
    if (!supportsPassiveEvents()) {
        return false;
    }
    return { passive, capture: false };
}

/**
 * Optimize for Brave Shields
 * Brave Shields can block fingerprinting, adjust accordingly
 */
export function getBraveOptimizedSettings() {
    return {
        // Reduce fingerprinting surface
        useSimplifiedAnimations: true,
        disableAdvancedGPUDetection: true,
        // Use more conservative particle counts
        particleMultiplier: 0.7,
    };
}
