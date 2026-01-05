import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClientContent from "./client";
import { getUserProfile } from "@/actions/profile";

import Link from "next/link";
import { ProfileData } from "@/types/dashboard";

// Mock data fallback
const mockUserData = {
    id: "user-12345",
    name: "Alex Developer",
    industry: "Tech Industry",
    phoneNumber: null,
    bio: "Passionate about open source and teaching. I love trading coding knowledge for practical life skills like cooking or languages. Based in Chicago but open to remote swaps.",
    skills: [
        { id: "s1", skillId: "sk1", name: "JavaScript", source: "ENDORSED", isVisible: true, endorsementCount: 5 },
        { id: "s2", skillId: "sk2", name: "Python", source: "MANUAL", isVisible: true, endorsementCount: 0 },
        { id: "s3", skillId: "sk3", name: "PostgreSQL", source: "MANUAL", isVisible: true, endorsementCount: 0 },
    ],
    reputation: {
        level: 4,
        title: "Master Mentor",
        reputationPoints: 850,
        color: "text-purple-400",
        averageRating: 4.8,
        completedSwaps: 12,
        totalEndorsements: 8,
    },
};

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const currentUserId = await getCurrentUserId();



    const isOwnProfile = currentUserId === userId;

    let profileData: ProfileData | null = null;
    let useMockData = false;

    try {
        // Fetch user profile data
        profileData = await getUserProfile(userId);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        // Fallback to mock data
        useMockData = true;
        profileData = mockUserData as unknown as ProfileData;
    }

    if (!profileData) return <div>Profile not found</div>;

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 transition-colors duration-300">
            <ProfileClientContent
                profileData={profileData}
                isOwnProfile={isOwnProfile}
                useMockData={useMockData}
                currentUserId={currentUserId}
            />
        </main>
    );
}
