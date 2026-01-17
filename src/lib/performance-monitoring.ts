/**
 * Performance monitoring utilities for tracking and optimizing app performance
 */

export interface PerformanceMetrics {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
    fps?: number; // Frames per second
    memory?: {
        used: number;
        total: number;
        limit: number;
    };
}

/**
 * Monitor Core Web Vitals
 */
export function monitorWebVitals(callback: (metric: PerformanceMetrics) => void): void {
    if (typeof window === 'undefined') return;

    // FCP - First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
                callback({ fcp: entry.startTime });
            }
        }
    });

    try {
        fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
        // Ignore if not supported
    }

    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        callback({ lcp: lastEntry.startTime });
    });

    try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        // Ignore if not supported
    }

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            callback({ fid: (entry as any).processingStart - entry.startTime });
        }
    });

    try {
        fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
        // Ignore if not supported
    }

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
                callback({ cls: clsValue });
            }
        }
    });

    try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
        // Ignore if not supported
    }

    // TTFB - Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
        callback({ ttfb: navigationEntry.responseStart - navigationEntry.requestStart });
    }
}

/**
 * Monitor FPS (Frames Per Second)
 */
export function monitorFPS(callback: (fps: number) => void): () => void {
    if (typeof window === 'undefined') return () => { };

    let lastTime = performance.now();
    let frames = 0;
    let rafId: number;

    const measureFPS = () => {
        frames++;
        const currentTime = performance.now();

        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (currentTime - lastTime));
            callback(fps);
            frames = 0;
            lastTime = currentTime;
        }

        rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => {
        cancelAnimationFrame(rafId);
    };
}

/**
 * Monitor memory usage (Chrome only)
 */
export function monitorMemory(callback: (memory: PerformanceMetrics['memory']) => void): () => void {
    if (typeof window === 'undefined') return () => { };

    const checkMemory = () => {
        const memory = (performance as any).memory;
        if (memory) {
            callback({
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
            });
        }
    };

    const intervalId = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => {
        clearInterval(intervalId);
    };
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

    monitorWebVitals(() => {
        // Monitors vitals in background for reportWebVitals
    });

    const stopFPS = monitorFPS(() => {
        // Background FPS monitoring
    });

    const stopMemory = monitorMemory(() => {
        // Background memory monitoring
    });

    // Cleanup after 30 seconds
    setTimeout(() => {
        stopFPS();
        stopMemory();
    }, 30000);
}

/**
 * Report to analytics (Vercel Speed Insights compatible)
 */
export function reportWebVitals(metric: PerformanceMetrics): void {
    // This will be automatically picked up by Vercel Speed Insights
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            value: Math.round(metric.fcp || metric.lcp || metric.fid || metric.cls || 0),
            event_label: Object.keys(metric)[0],
            non_interaction: true,
        });
    }
}
