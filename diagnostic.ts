import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function diagnose() {
    const proposals = await prisma.proposal.findMany({
        take: 15,
        select: {
            id: true,
            title: true,
            description: true,
            modality: true,
            status: true,
            imageUrl: true,
            createdAt: true,
            ownerId: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    industry: true,
                }
            },
            offeredSkills: { select: { id: true, name: true } },
            neededSkills: { select: { id: true, name: true } },
            _count: { select: { applications: true, swaps: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    console.log(`Proposals fetched: ${proposals.length}`);

    for (let i = 0; i < proposals.length; i++) {
        const item = proposals[i];
        const size = Buffer.byteLength(JSON.stringify(item));
        console.log(`Item ${i} size: ${size} bytes`);

        if (size > 10000) { // If larger than 10KB
            console.log(`--- Item ${i} details (Large) ---`);
            for (const key in item) {
                const fieldStr = JSON.stringify((item as any)[key]);
                const fieldSize = Buffer.byteLength(fieldStr);
                console.log(`Field "${key}" size: ${fieldSize} bytes`);
                if (fieldSize > 5000) {
                    console.log(`Field "${key}" value (start): ${fieldStr.substring(0, 200)}...`);
                }
            }
        }
    }
}

diagnose().catch(console.error).finally(() => prisma.$disconnect());
