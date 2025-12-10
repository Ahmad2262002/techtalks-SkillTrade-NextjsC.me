import { createProposalAction } from "@/actions/proposal-actions";
import { ProposalValues } from "@/lib/validation";

export async function createProposal(data: ProposalValues) {
  try {
    // We pass undefined for userId to trigger the temp user logic in the action
    const result = await createProposalAction(data, undefined);

    if (result.success) {
      return { status: "success", id: result.proposalId };
    }

    throw new Error(result.error || "Unknown error");
  } catch (error) {
    console.error("[proposalService] Failed to create proposal:", error);
    throw error;
  }
}