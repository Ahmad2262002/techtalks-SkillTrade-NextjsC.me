import React from "react";
import Navbar from "@/components/landing/Navbar";
import LandingLayout from "@/components/landing/LandingLayout";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Spotlight from "@/components/landing/Spotlight";
import RecentReviews from "@/components/landing/RecentReviews";

import { getCurrentUserId } from "@/actions/auth";
import { listPublicProposals } from "@/actions/proposals";
import { getPublicReviews } from "@/actions/reviews";

export default async function Home() {
  const [userId, proposals, reviews] = await Promise.all([
    getCurrentUserId(),
    listPublicProposals({ take: 6, includeAllStatuses: true }),
    getPublicReviews(3)
  ]);

  return (
    <>
      <Navbar userId={userId} />
      {/* LandingLayout handles the layout and immersive components */}
      <LandingLayout>
        <Hero userId={userId} />
        <Features />
        <Spotlight proposals={proposals} />
        <RecentReviews reviews={reviews} />
      </LandingLayout>
    </>
  );
}