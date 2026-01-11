import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            {/* Sidebar Skeleton (Desktop) */}
            <div className="hidden md:flex w-64 flex-col gap-4 p-4 border-r border-white/5 bg-white/[0.02]">
                <div className="h-8 w-32 bg-primary/10 rounded-lg animate-pulse mb-8" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Header Skeleton */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.01]">
                    <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
                        <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 p-4 md:p-8 overflow-hidden">
                    {/* Tabs Skeleton */}
                    <div className="flex gap-4 mb-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 w-32 bg-white/5 rounded-full animate-pulse" />
                        ))}
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[300px] rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 flex flex-col gap-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent animate-pulse" />

                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white/5" />
                                    <div className="flex-1">
                                        <div className="h-4 w-24 bg-white/5 rounded mb-2" />
                                        <div className="h-3 w-16 bg-white/5 rounded" />
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 space-y-3 mt-4">
                                    <div className="h-4 w-full bg-white/5 rounded" />
                                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                                </div>

                                {/* Footer */}
                                <div className="mt-auto flex gap-2">
                                    <div className="h-8 w-20 bg-white/5 rounded-lg" />
                                    <div className="h-8 w-20 bg-white/5 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loading Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-background/20 backdrop-blur-[1px]">
                    <LoadingSpinner />
                </div>
            </div>
        </div>
    );
}
