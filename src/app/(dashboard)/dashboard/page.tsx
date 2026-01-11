import { listPublicProposals } from "@/actions/proposals";
import { getDashboardUserBasic, getMySentApplications, getMyProposals, getMySwapsAndInteractions, getLeaderboard } from "@/actions/dashboard";
import { getCurrentUserId } from "@/actions/auth";
import DashboardClientContent from "./client";
import { redirect } from "next/navigation";

import { Proposal, Skill } from "@/types/dashboard";

type DashboardSearchParams = {
  tab?: "browse" | "my-proposals" | "active-swaps" | "leaderboard";
  q?: string;
  modality?: string;
};

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<DashboardSearchParams>
}) {
  const params = await searchParams;

  // --- FORMULA 1 MODE: Conditional Fetching ---
  const activeTab = params?.tab || "browse";
  const search = params?.q ?? "";
  const rawModality = params?.modality || "";

  // Convert "ALL" or empty to undefined for API filter
  const modalityFilter = rawModality === "ALL" || rawModality === "" ? undefined : rawModality;

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  // Initialize empty containers
  let overview: any = {
    // Default minimal user for header
    user: { id: userId, name: "User", avatarUrl: null, skills: [] },
    proposals: [],
    applications: [],
    sentApplications: [],
    swaps: [],
    reputation: null,
    leaderboard: []
  };
  let publicProposals: any[] = [];
  let fetchedLeaderboard: any[] = [];

  try {
    // 1. ALWAYS needed: User Context (fast)
    const userBasic = await getDashboardUserBasic();
    if (userBasic) overview.user = userBasic;

    const promises: Promise<any>[] = [];

    // 2. CONDITIONAL Fetching based on Tab
    // "Browse" -> SentApps (filter), PublicProposals, Leaderboard
    if (activeTab === "browse") {
      promises.push(
        getMySentApplications().then(res => overview.sentApplications = res),
        listPublicProposals({
          search: search || undefined,
          modality: modalityFilter,
          take: 20,
          includeAllStatuses: true,
        }).then(res => publicProposals = res),
        getLeaderboard().then(res => overview.leaderboard = res)
      );
    }

    // "My Proposals" -> My Proposals
    else if (activeTab === "my-proposals") {
      promises.push(
        getMyProposals().then(res => overview.proposals = res)
      );
    }

    // "Active Swaps" -> Swaps + Received Apps
    else if (activeTab === "active-swaps") {
      promises.push(
        getMySwapsAndInteractions().then(res => {
          overview.swaps = res.swaps;
          overview.applications = res.receivedApplications;
        })
      );
    }

    // "Leaderboard" -> Leaderboard
    else if (activeTab === "leaderboard") {
      promises.push(
        getLeaderboard().then(res => overview.leaderboard = res)
      );
    }

    // Execute all needed queries in parallel
    await Promise.all(promises);

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return <div>Error loading dashboard. Please try again.</div>;
  }

  // Filter: Exclude my own proposals AND proposals I've already applied to
  // (Only relevant for Browse tab)
  const proposalById = new Map<string, Proposal>();
  for (const p of publicProposals || []) {
    proposalById.set(p.id, p);
  }
  const allProposals = Array.from(proposalById.values());
  const publicOnlyProposals = allProposals.filter(p => p.ownerId !== userId);

  console.log(`[Dashboard] Tab: ${activeTab} | ${publicOnlyProposals.length} public items`);

  const myProposals = overview.proposals;

  return (
    <main>
      <DashboardClientContent
        overview={overview}
        myProposals={myProposals}
        publicOnlyProposals={publicOnlyProposals}
        search={search}
        rawModality={rawModality}
        activeTab={activeTab}
        swaps={overview.swaps}
        applications={overview.applications}
      />
    </main>
  );
}