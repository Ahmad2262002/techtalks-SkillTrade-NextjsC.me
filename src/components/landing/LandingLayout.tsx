"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Spotlight from "@/components/landing/Spotlight";
import RecentReviews from "@/components/landing/RecentReviews";
import SmoothScrollProvider from "@/app/(public)/SmoothScrollProvider"; 
import styles from "@/app/(public)/Landing.module.css";

export default function LandingLayout({ userId, proposals, reviews }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On the server and first client render, show a simple structure.
  // This prevents the "Hydration Mismatch"
  if (!mounted) {
    return (
      <div className={styles.pageWrapper}>
        <main className={styles.mainContent}>
          <Hero userId={userId} />
          <Spotlight proposals={proposals} />
        </main>
      </div>
    );
  }

  // Once mounted, wrap with the SmoothScroll logic
  return (
    <SmoothScrollProvider>
      <div className={styles.pageWrapper}>
        <main className={styles.mainContent}>
          <Hero userId={userId} />
          <Spotlight proposals={proposals} />
          <Features />
          <RecentReviews reviews={reviews} />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}