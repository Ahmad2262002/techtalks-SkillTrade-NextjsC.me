/**
 * Web Worker for offloading heavy computations
 * This improves main thread performance
 */

// Example: Particle calculations can be moved here
self.addEventListener('message', (e: MessageEvent) => {
    const { type, data } = e.data;

    switch (type) {
        case 'CALCULATE_PARTICLES':
            const result = calculateParticlePositions(data);
            self.postMessage({ type: 'PARTICLES_CALCULATED', data: result });
            break;

        default:
            break;
    }
});

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

function calculateParticlePositions(data: {
    particles: Particle[];
    mouse: { x: number; y: number };
    canvasWidth: number;
    canvasHeight: number;
}): Particle[] {
    const { particles, mouse, canvasWidth, canvasHeight } = data;

    return particles.map((particle) => {
        // Mouse interaction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            particle.vx -= Math.cos(angle) * force * 0.05;
            particle.vy -= Math.sin(angle) * force * 0.05;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary check
        if (particle.x < 0) particle.x = canvasWidth;
        if (particle.x > canvasWidth) particle.x = 0;
        if (particle.y < 0) particle.y = canvasHeight;
        if (particle.y > canvasHeight) particle.y = 0;

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        return particle;
    });
}

export { };
