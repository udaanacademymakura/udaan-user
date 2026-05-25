import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useGetAllLiveClassesQuery } from "../../../services/liveApi";
import type { LiveClassProps } from "../../../types/liveClass";
import DashboardSkeleton from "./DashboardSkeleton";
import OngoingLiveOverlay from "./OngoingLiveOverlay";

const PAGE_SIZE = 6;

const BYPASS_PATTERNS = [
    "/auth/set-password",
    "/courses/:courseId/live/:liveId",
];

interface Props {
    children: React.ReactNode;
}

export default function LiveClassGate({ children }: Props) {
    const location = useLocation();
    const shouldBypass = BYPASS_PATTERNS.some((p) => matchPath(p, location.pathname));

    const [dismissed, setDismissed] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [items, setItems] = useState<LiveClassProps[]>([]);

    const { data, isLoading, isFetching } = useGetAllLiveClassesQuery(
        {
            pageIndex,
            pageSize: PAGE_SIZE,
            type: "ongoing",
        },
        { skip: shouldBypass }
    );

    const page = data?.data?.data ?? [];
    const totalCount = data?.data?.pagination?.total ?? 0;
    const totalPages = data?.data?.pagination?.total_pages ?? 0;

    useEffect(() => {
        if (!data) return;
        if (pageIndex === 1) {
            setItems(page);
            return;
        }
        setItems((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            return [...prev, ...page.filter((p) => !seen.has(p.id))];
        });
    }, [data, page, pageIndex]);

    const handleDismiss = () => setDismissed(true);

    const handleLoadMore = () => {
        if (isFetching) return;
        if (pageIndex >= totalPages) return;
        setPageIndex((p) => p + 1);
    };

    if (shouldBypass) return <>{children}</>;
    if (dismissed) return <>{children}</>;


    if (isLoading) {
        return (
            <div className="relative h-full">
                <DashboardSkeleton />
            </div>
        );
    }

    if (totalCount === 0) return <>{children}</>;

    return (
        <div className="relative h-full">
            <DashboardSkeleton />
            <OngoingLiveOverlay
                loading={false}
                items={items}
                totalCount={totalCount}
                onDismiss={handleDismiss}
                onLoadMore={handleLoadMore}
                canLoadMore={items.length < totalCount}
                loadingMore={isFetching && pageIndex > 1}
            />
        </div>
    );
}
