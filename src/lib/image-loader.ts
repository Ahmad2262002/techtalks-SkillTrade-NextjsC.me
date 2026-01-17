/**
 * Optimized image loader for faster loading
 * Uses modern formats and proper sizing
 */

export default function optimizedImageLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    // For external images, return as-is
    if (src.startsWith('http')) {
        return src;
    }

    // For local images, optimize
    const params = [`w=${width}`];

    if (quality) {
        params.push(`q=${quality || 75}`);
    }

    // Add format parameter for modern browsers
    params.push('f=webp');

    return `${src}?${params.join('&')}`;
}
