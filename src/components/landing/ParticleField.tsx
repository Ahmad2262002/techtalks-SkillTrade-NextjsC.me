"use client";

import { useEffect, useRef, useState } from "react";
import { detectPerformanceTier, getParticleCount } from "@/lib/performance";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

export default function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef<number>(0);
    const [tier, setTier] = useState<string>('medium');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Detect performance tier
        const perfMetrics = detectPerformanceTier();
        const isLowEnd = perfMetrics.tier === 'low';
        const isUltra = perfMetrics.tier === 'ultra';
        setTier(perfMetrics.tier);

        // Track visibility with IntersectionObserver
        let isVisible = true;
        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
                // Pause animation when not visible
                if (!isVisible && animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = 0;
                } else if (isVisible && !animationRef.current) {
                    animate();
                }
            },
            { threshold: 0 }
        );
        observer.observe(canvas);

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas, { passive: true } as any);

        // Initialize particles with performance-based count
        const particleCount = getParticleCount(perfMetrics.tier);
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * (isLowEnd ? 0.3 : 0.5),
            vy: (Math.random() - 0.5) * (isLowEnd ? 0.3 : 0.5),
            radius: Math.random() * (isLowEnd ? 1.5 : 2) + 1,
            opacity: Math.random() * 0.5 + 0.2,
        }));

        // Mouse tracking with passive listener
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouseMove, { passive: true } as any);

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas || !isVisible) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            // Update and draw particles
            particles.forEach((particle, i) => {
                // Mouse interaction - attraction/repulsion
                const dx = mouse.x - particle.x;
                const dy = mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    const angle = Math.atan2(dy, dx);
                    // Repulsion
                    particle.vx -= Math.cos(angle) * force * 0.05;
                    particle.vy -= Math.sin(angle) * force * 0.05;
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Boundary check with wrap-around
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Damping
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(var(--primary), ${particle.opacity})`;
                ctx.fill();

                // Draw connections to nearby particles (skip on low-end devices)
                // Use spatial partitioning for better performance (O(n) instead of O(n²))
                if (!isLowEnd) {
                    const maxConnDist = isUltra ? 150 : 120;
                    // Only check a subset of particles for connections
                    const checkRange = Math.min(10, particles.length - i - 1);
                    for (let j = i + 1; j < i + 1 + checkRange && j < particles.length; j++) {
                        const other = particles[j];
                        const dx = particle.x - other.x;
                        const dy = particle.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < maxConnDist) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(other.x, other.y);
                            const opacity = (1 - distance / maxConnDist) * (isUltra ? 0.25 : 0.15);
                            ctx.strokeStyle = `hsla(var(--primary), ${opacity})`;
                            ctx.lineWidth = isUltra ? 0.8 : 0.5;
                            ctx.stroke();
                        }
                    }
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: tier === 'low' ? 0.3 : 0.6 }}
        />
    );
}
