/**
 * React Server Component caching utilities
 * Aggressive caching for database queries
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache database queries with aggressive revalidation
 */
export function cacheQuery<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keys: string[],
    options: {
        revalidate?: number; // seconds
        tags?: string[];
    } = {}
): T {
    const { revalidate = 60, tags = [] } = options; // Default 60 seconds

    return unstable_cache(fn, keys, {
        revalidate,
        tags,
    }) as T;
}

/**
 * Predefined cache configurations
 */
export const CACHE_CONFIG = {
    // Very fast changing data (notifications, messages)
    REALTIME: { revalidate: 10, tags: ['realtime'] },

    // Fast changing data (proposals, applications)
    FAST: { revalidate: 30, tags: ['fast'] },

    // Medium changing data (user profiles, skills)
    MEDIUM: { revalidate: 60, tags: ['medium'] },

    // Slow changing data (reviews, completed swaps)
    SLOW: { revalidate: 300, tags: ['slow'] },

    // Static data (skills list, categories)
    STATIC: { revalidate: 3600, tags: ['static'] },
} as const;

/**
 * Example usage:
 * 
 * const getCachedProposals = cacheQuery(
 *   async () => {
 *     return await prisma.proposal.findMany();
 *   },
 *   ['proposals', 'list'],
 *   CACHE_CONFIG.FAST
 * );
 */
