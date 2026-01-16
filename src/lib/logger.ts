/**
 * Production-safe logger utility
 * Logs only in development, errors always logged
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    /**
     * Log information (development only)
     */
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Log errors (always logged)
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * Log warnings (always logged)
     */
    warn: (...args: any[]) => {
        console.warn(...args);
    },

    /**
     * Log info (development only)
     */
    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    /**
     * Log debug (development only)
     */
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
};
