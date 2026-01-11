import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <LoadingSpinner />
        </div>
    );
}
