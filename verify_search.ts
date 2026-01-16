
import { prisma } from './src/lib/prisma';
import { listPublicProposals } from './src/actions/proposals';

async function verifyFilters() {
    try {
        // 1. Check Statuses
        const recentProps = await prisma.proposal.findMany({
            where: { createdAt: { gte: new Date("2025-12-31") } },
            select: { title: true, status: true, createdAt: true }
        });
        console.log("--- Proposals from last 7 days ---");
        console.log(recentProps);

        // 2. Test the server action directly
        console.log("\n--- Testing listPublicProposals('week') ---");
        const weekResults = await listPublicProposals({
            dateRange: 'week',
            take: 10
        });
        console.log(`Found ${weekResults.length} proposals using server action.`);
        weekResults.forEach((p: any) => console.log(`- ${p.title} (${p.status})`));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFilters();
