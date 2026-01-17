import { useRef, useCallback } from 'react';

/**
 * Throttle hook - limits function execution to once per specified delay
 * @param callback Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    const lastRun = useRef(Date.now());
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastRun = now - lastRun.current;

            if (timeSinceLastRun >= delay) {
                callback(...args);
                lastRun.current = now;
            } else {
                // Schedule for later
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(
                    () => {
                        callback(...args);
                        lastRun.current = Date.now();
                    },
                    delay - timeSinceLastRun
                );
            }
        },
        [callback, delay]
    );
}
