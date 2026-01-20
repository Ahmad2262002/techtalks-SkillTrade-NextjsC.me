"use client";

import Footer from "./Footer";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamic imports for heavy immersive components (Client-only, non-blocking)
const CursorFollower = dynamic(() => import("./CursorFollower"), { ssr: false });
const ScrollProgress = dynamic(() => import("./ScrollProgress"), { ssr: false });
const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });
const AIChatbot = dynamic(() => import("./AIChatbot"), { ssr: false });
const AnimatedBackground = dynamic(() => import("./AnimatedBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-background -z-50" />
});

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <>
      {/* Immersive Effects Layer */}
      <AnimatedBackground />
      <CursorFollower />
      <ScrollProgress />
      <ParticleField />
      <AIChatbot />

      {/* Main Content */}
      <main className="relative z-10">
        {children}
        <Footer />
      </main>
    </>
  );
}