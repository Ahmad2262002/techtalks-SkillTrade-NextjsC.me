"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Spotlight from "@/components/landing/Spotlight";
import RecentReviews from "@/components/landing/RecentReviews";
import SmoothScrollProvider from "@/app/(public)/SmoothScrollProvider";
import styles from "../../app/(public)/Landing.module.css";

export default function LandingLayout({ userId, proposals, reviews }: any) {
  // Render all content immediately
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