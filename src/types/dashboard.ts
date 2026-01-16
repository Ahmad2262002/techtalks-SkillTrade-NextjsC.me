export type Skill = {
    id: string;
    name: string;
    source?: string; // "MANUAL" | "ENDORSED"
    isVisible?: boolean;
};

export type Review = {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date | string;
    author: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
    };
    swap: {
        id: string;
        proposal: {
            title: string;
        };
    };
};

export type ProfileData = {
    id: string;
    name: string | null;
    industry: string | null;
    bio: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    skills: Array<{
        id: string;
        skillId: string;
        name: string;
        source: string;
        isVisible: boolean;
        endorsementCount: number;
    }>;
    reputation: {
        level: number;
        title: string;
        reputationPoints: number;
        color: string;
        averageRating: number;
        completedSwaps: number;
        totalEndorsements: number;
    };
    reviewsReceived: Review[];
};

export type User = {
    id: string;
    name: string | null;
    email?: string;
    industry: string | null;
    bio: string | null;
    avatarUrl?: string | null;
    skills?: { skill: Skill }[] | Skill[]; // Handle both Prisma include and flattened structure
    reputation?: {
        reputationPoints: number;
        level: number;
        title: string;
        color: string;
        averageRating?: number;
        completedSwaps?: number;
        totalEndorsements?: number;
    };
};

export type Proposal = {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    modality: "REMOTE" | "IN_PERSON";
    status?: string;
    imageUrl?: string | null;
    createdAt: Date | string;
    owner?: User;
    offeredSkills?: { skill: Skill }[] | Skill[];
    offeredSkill?: Skill; // Deprecated/Mock support
    neededSkills: { skill?: Skill; name?: string; id?: string }[] | Skill[];
    _count?: {
        applications: number;
        swaps: number;
    };
};

export type Swap = {
    id: string;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "CLOSED";
    startedAt: Date | string;
    teacherId: string;
    studentId: string;
    teacher: User;
    student: User;
    proposal: Proposal;
    teacherHasCompleted: boolean;
    studentHasCompleted: boolean;
    reviews?: any[];
    messages?: any[];
};

export type Application = {
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    applicantId: string;
    proposalId: string;
    applicant: User;
    proposal: Proposal;
    pitchMessage?: string;
};

export type Notification = {
    id: string;
    type: string | null;
    message: string;
    isRead: boolean;
    createdAt: string | Date;
    link?: string | null;
};

export type LeaderboardEntry = {
    id: string;
    name: string;
    avatarUrl: string | null;
    industry: string | null;
    reputation: {
        reputationPoints: number;
        level: number;
        title: string;
        color: string;
    };
};

export type DashboardOverview = {
    user: User | null;
    proposals: Proposal[];
    applications: Application[];
    sentApplications?: Application[];
    swaps: Swap[];
    reputation?: {
        averageRating: number;
        completedSwaps: number;
        totalReviews: number;
        totalEndorsements: number;
        level: number;
        title: string;
        color: string;
    };
    leaderboard?: LeaderboardEntry[];
};
