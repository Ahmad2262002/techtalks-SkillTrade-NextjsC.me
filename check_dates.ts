
import { prisma } from './src/lib/prisma';

async function checkDates() {
    try {
        const proposals = await prisma.proposal.findMany({
            select: { title: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        console.log("Current Server Time:", new Date().toISOString());
        console.log("Recent Proposals:");
        proposals.forEach(p => {
            console.log(`- ${p.title}: ${p.createdAt.toISOString()}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDates();
