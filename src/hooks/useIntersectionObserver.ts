import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
    freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options: UseIntersectionObserverOptions = {}
): (node: Element | null) => void {
    const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const frozenRef = useRef(false);

    const setRef = useCallback(
        (node: Element | null) => {
            // Cleanup previous observer
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            // Skip if frozen
            if (frozenRef.current) return;

            // Create new observer
            if (node) {
                observerRef.current = new IntersectionObserver(
                    ([entry]) => {
                        callback(entry);

                        // Freeze if visible and freezeOnceVisible is true
                        if (freezeOnceVisible && entry.isIntersecting) {
                            frozenRef.current = true;
                            observerRef.current?.disconnect();
                        }
                    },
                    { threshold, root, rootMargin }
                );

                observerRef.current.observe(node);
            }
        },
        [callback, threshold, root, rootMargin, freezeOnceVisible]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return setRef;
}
