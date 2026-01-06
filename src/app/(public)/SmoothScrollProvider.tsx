"use client";

// We are disabling GSAP ScrollSmoother to rely on native browser scrolling.
// This repairs the "double scrollbar" issue on mobile and improves performance.
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full overflow-x-hidden">
            {children}
        </div>
    );
}
