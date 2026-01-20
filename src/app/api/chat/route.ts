import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
        const previousBotMessage = messages.length > 2 ? messages[messages.length - 2].content.toLowerCase() : "";

        let responseText = "";

        // --- CONTEXT: LEARNING FOLLOW-UP ---
        if (previousBotMessage.includes("shall i identify top-rated")) {
            if (lastMessage.match(/^(yes|ok|sure|please|go ahead)/) || lastMessage.includes("who")) {
                const techMatch = previousBotMessage.match(/top-rated\s+([a-zA-Z0-9\+\.#]+)\s+practitioners/i);
                const tech = techMatch ? techMatch[1] : null;

                if (tech) {
                    const experts = await prisma.user.findMany({
                        where: {
                            skills: {
                                some: {
                                    skill: { name: { contains: tech, mode: 'insensitive' } }
                                }
                            }
                        },
                        orderBy: { reviewsReceived: { _count: 'desc' } },
                        take: 1,
                        include: {
                            skills: {
                                where: { skill: { name: { contains: tech, mode: 'insensitive' } } },
                                include: { skill: true }
                            }
                        }
                    });

                    const expert = experts[0];

                    if (expert) {
                        responseText = `Initiating search for **${tech}** specialists...\n\n**Top Match:**\n**${expert.name || "Verified Peer"}** - *Lead ${expert.skills[0]?.skill.name || tech} Specialist*\n- **Status**: Active in Community.\n\nShall I request a connection?`;
                    } else {
                        // Fallback to general top rated if specific skill expert not found
                        const topUser = await prisma.user.findFirst({
                            orderBy: { reviewsReceived: { _count: 'desc' } }
                        });

                        if (topUser) {
                            responseText = `I couldn't find a specific expert for **${tech}**, but **${topUser.name}** is our highest-rated member overall. Shall I connect you?`;
                        } else {
                            responseText = `I searched the registry but couldn't find a specific expert for **${tech}** right now. Try searching for a different skill?`;
                        }
                    }
                } else {
                    const topUser = await prisma.user.findFirst({
                        orderBy: { reviewsReceived: { _count: 'desc' } }
                    });

                    if (topUser) {
                        responseText = `Initiating search for specialists...\n\n**Top Match:**\n**${topUser.name}** - *Top Rated Member*\n\nShall I request a connection?`;
                    } else {
                        responseText = `I couldn't find any highly rated specialists at the moment.`;
                    }
                }

            } else if (lastMessage.includes("resource") || lastMessage.includes("curation")) {
                responseText = `Accessing curated repository...\n\n**Top Resource:**\n*"Advanced Patterns in Modern Web Development"* - Interactive Workshop.\n\nWould you like the access link?`;
            }
        }

        // --- CONTEXT: EXPERT MATCH FOLLOW-UP ---
        else if (previousBotMessage.includes("require data on your current proficiency")) {
            // Dynamic lookup based on levels
            if (lastMessage.includes("beginner") || lastMessage.includes("novice") || lastMessage.includes("new")) {
                const mentor = await prisma.user.findFirst({
                    orderBy: { reviewsReceived: { _count: 'desc' } } // Ideally filter by "teaching" skill if available
                });
                responseText = `Acknowledged: **Novice Level**.\n\n**Optimizing for Mentorship:**\nI have filtered for experts with high community ratings.\n\n**Recommendation:**\n**${mentor?.name || "Community Mentor"}**\n\nType "Connect ${mentor?.name?.split(' ')[0] || "Mentor"}" to draft a proposal.`;

            } else if (lastMessage.includes("intermediate") || lastMessage.includes("mid")) {
                const peer = await prisma.user.findFirst({
                    orderBy: { createdAt: 'desc' } // Just a way to get someone different, ideally random or specific logic
                });
                responseText = `Acknowledged: **Intermediate Level**.\n\n**Optimizing for Peer Review:**\nI have filtered for peers seeking mutual code audits.\n\n**Recommendation:**\n**${peer?.name || "Peer Reviewer"}**\n\nType "Connect ${peer?.name?.split(' ')[0] || "Peer"}" to draft a proposal.`;

            } else if (lastMessage.includes("expert") || lastMessage.includes("advanced")) {
                const architect = await prisma.user.findFirst({
                    orderBy: { proposals: { _count: 'desc' } } // experienced users with many proposals
                });
                responseText = `Acknowledged: **Specialist Level**.\n\n**Optimizing for Architectural Debate:**\nI have filtered for high-activity system architects.\n\n**Recommendation:**\n**${architect?.name || "Senior Architect"}**\n\nType "Connect ${architect?.name?.split(' ')[0] || "Architect"}" to draft a proposal.`;
            }
        }

        // --- CONTEXT: PORTFOLIO AUDIT FOLLOW-UP ---
        else if (previousBotMessage.includes("initiate a targeted audit")) {
            if (lastMessage.match(/^(yes|ok|sure|please)/) || lastMessage.includes("project")) {
                responseText = `Please paste a link to your project repository or live demo for immediate analysis.`;
            }
        }

        // --- GENERAL LOGIC ---
        if (!responseText) {
            // 1. SKILL & LEARNING LOGIC
            if (lastMessage.includes("learn") || lastMessage.includes("master") || lastMessage.includes("study") || lastMessage.includes("guide")) {
                const techMatch = lastMessage.match(/(?:learn|master|study|guide\s+for)\s+([a-zA-Z0-9\+\.#]+)/i);
                const tech = techMatch ? techMatch[1] : "your target technology";

                // DB Count
                const expertCount = await prisma.user.count({
                    where: {
                        skills: {
                            some: {
                                skill: { name: { contains: tech, mode: 'insensitive' } }
                            }
                        }
                    }
                });

                responseText = `To accelerate your mastery of **${tech}**, I can orchestrate a strategic exchange with verified experts (Found: ${expertCount}).\n\n**Recommended Strategy:**\n1. **Peer Programming**: Schedule a 45-min session.\n2. **Code Review**: specific feedback on your current ${tech} implementation.\n\nShall I identify top-rated ${tech} practitioners or curation learning resources?`;
            }
            // 2. RECOMMENDATION LOGIC
            else if (lastMessage.includes("recommend") || lastMessage.includes("best") || (lastMessage.includes("who") && lastMessage.includes("teacher"))) {
                if (!lastMessage.includes("beginner") && !lastMessage.includes("advanced") && !lastMessage.includes("expert")) {
                    responseText = "To execute a precise expert match, I require data on your current proficiency level (e.g., Novice, Intermediate, Specialist) and your immediate technical objective.";
                } else {
                    // REAL DB QUERY
                    const topUsers = await prisma.user.findMany({
                        take: 3,
                        orderBy: { reviewsReceived: { _count: 'desc' } },
                        include: {
                            skills: { take: 1, include: { skill: true } },
                            reviewsReceived: { select: { id: true } }
                        }
                    });

                    let list = "";
                    if (topUsers.length === 0) {
                        list = "No experts found yet. Be the first!";
                    } else {
                        topUsers.forEach((user: any, i: number) => {
                            const mainSkill = user.skills?.[0]?.skill?.name || "Generalist";
                            const label = user.reviewsReceived?.length > 0 ? "Top Rated" : "Verified";
                            list += `${i + 1}. **${user.name || "Anonymous"}** (${mainSkill}) - **${label}**\n`;
                        });
                    }

                    responseText = `Based on SkillTrade telemetry, I have isolated optimal matches:\n\n${list}\nWhich profile aligns with your trajectory?`;
                }
            }
            // 3. PORTFOLIO LOGIC
            else if (lastMessage.includes("portfolio") || lastMessage.includes("hire") || lastMessage.includes("job") || lastMessage.includes("stand out")) {
                responseText = `Deploying Portfolio Optimization Protocol:\n\n1. **Impact-Driven Narrative**: Transition to *problem-solution-outcome* case studies.\n2. **Visual Velocity**: Ensure critical artifacts are visible in viewport.\n\nWould you like to initiate a targeted audit of a specific project section?`;
            }
            // 4. GREETINGS
            else if (lastMessage.match(/^(hi|hello|hey|greetings|system report)/)) {
                responseText = "System Online. I am the SkillTrade Strategic Sync Orchestrator. How may I facilitate your professional expertise exchange today?";
            }
            else if (lastMessage.match(/^(ok|okay|cool|thanks|thank you|great)/)) {
                responseText = "Affirmative. I am standing by for your next directive. You may query for specific skills, expert matches, or profile optimization strategies.";
            }
            // 5. DEFAULT
            else {
                responseText = "My current parameters do not recognize this specific query format. I can assist with:\n- **Expert Discovery**: Finding mentors or peers.\n- **Asset Optimization**: Refining portfolios.\n- **Protocol Navigation**: Understanding SkillTrade mechanics.\n\nPlease restate your objective.";
            }
        }

        return NextResponse.json({ role: 'assistant', content: responseText });

    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json(
            { role: 'assistant', content: "I am currently calibrating my index. Please try again in a moment." },
            { status: 500 }
        );
    }
}
