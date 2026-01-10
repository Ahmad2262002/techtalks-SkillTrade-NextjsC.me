import { listPublicProposals } from "@/actions/proposals";
import { getDashboardOverview, getLeaderboard } from "@/actions/dashboard";
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

  const activeTab = params?.tab || "browse";
  const search = params?.q ?? "";
  const rawModality = params?.modality || "";

  // Convert "ALL" or empty to undefined for API filter
  const modalityFilter = rawModality === "ALL" || rawModality === ""
    ? undefined
    : rawModality;

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  let overview: any = { proposals: [], applications: [], sentApplications: [], swaps: [], reputation: null, leaderboard: [] };
  let publicProposals: any[] = [];

  try {
    // 1. Get User overview first
    overview = await getDashboardOverview();

    // 2. Get public proposals sequentially
    publicProposals = await listPublicProposals({
      search: search || undefined,
      modality: modalityFilter,
      take: 20, // Reduced take to lower load
      includeAllStatuses: true,
    });

    // 3. Get leaderboard sequentially
    const fetchedLeaderboard = await getLeaderboard();
    overview.leaderboard = fetchedLeaderboard;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return <div>Error loading dashboard. Please try again.</div>;
  }

  // Filter: Exclude my own proposals AND proposals I've already applied to
  const proposalById = new Map<string, Proposal>();
  for (const p of publicProposals || []) {
    proposalById.set(p.id, p);
  }
  const allProposals = Array.from(proposalById.values());

  const appliedProposalIds = new Set(overview.sentApplications?.map((app: any) => app.proposalId) || []);

  const publicOnlyProposals = allProposals.filter(
    (p) => p.ownerId !== userId,
  );

  console.log(`[Dashboard] Found ${allProposals.length} total | ${publicOnlyProposals.length} shown to user ${userId}`);

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