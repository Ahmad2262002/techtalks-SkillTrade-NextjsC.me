"use client";

import Hero from "./Hero";
import Features from "./Features";
import Spotlight from "./Spotlight";
import RecentReviews from "./RecentReviews";
import Footer from "./Footer";
import dynamic from "next/dynamic";

// Dynamic imports for heavy immersive components (Client-only, non-blocking)
const CursorFollower = dynamic(() => import("./CursorFollower"), { ssr: false });
const ScrollProgress = dynamic(() => import("./ScrollProgress"), { ssr: false });
const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });
const AIChatbot = dynamic(() => import("./AIChatbot"), { ssr: false });

interface LandingLayoutProps {
  userId?: string | null;
  proposals: any[];
  reviews: any[];
}

export default function LandingLayout({ userId, proposals, reviews }: LandingLayoutProps) {
  return (
    <>
      {/* Immersive Effects Layer */}
      <CursorFollower />
      <ScrollProgress />
      <ParticleField />
      <AIChatbot />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero userId={userId} />
        <Features />
        <Spotlight proposals={proposals} />
        <RecentReviews reviews={reviews} />
        <Footer />
      </main>
    </>
  );
}