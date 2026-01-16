import React from "react";
import Navbar from "@/components/landing/Navbar";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import LandingLayout from "@/components/landing/LandingLayout"; // We will create this

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
      <AnimatedBackground />
      <Navbar userId={userId} />
      {/* LandingLayout handles the layout and immersive components */}
      <LandingLayout
        userId={userId}
        proposals={proposals}
        reviews={reviews}
      />
    </>
  );
}