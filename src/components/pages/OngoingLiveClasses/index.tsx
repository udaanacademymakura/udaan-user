import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSkeleton from "../../organism/LiveClassGate/DashboardSkeleton";
import OngoingLiveOverlay from "../../organism/LiveClassGate/OngoingLiveOverlay";
import { PATH } from "../../../routes/PATH";
import { useGetAllLiveClassesQuery } from "../../../services/liveApi";
import type { LiveClassProps } from "../../../types/liveClass";

const PAGE_SIZE = 6;
const LIVE_CLASS_DISMISSED_KEY = "live_class_dismissed";

export default function OngoingLiveClassesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const fromLogin = (location.state as { from?: string } | null)?.from === "login";

    const [pageIndex, setPageIndex] = useState(1);
    const [items, setItems] = useState<LiveClassProps[]>([]);

    const { data, isLoading, isFetching } = useGetAllLiveClassesQuery({
        pageIndex,
        pageSize: PAGE_SIZE,
        type: "ongoing",
    });

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

    useEffect(() => {
        if (!isLoading && totalCount === 0) {
            navigate(PATH.DASHBOARD.ROOT, { replace: true });
        }
    }, [isLoading, totalCount, navigate]);

    const handleDismiss = () => {
        const current = parseInt(sessionStorage.getItem(LIVE_CLASS_DISMISSED_KEY) ?? "0", 10);
        sessionStorage.setItem(LIVE_CLASS_DISMISSED_KEY, String(current + 1));
        if (fromLogin) {
            navigate(PATH.DASHBOARD.ROOT, { replace: true });
        } else {
            navigate(-1);
        }
    };

    const handleLoadMore = () => {
        if (isFetching || pageIndex >= totalPages) return;
        setPageIndex((p) => p + 1);
    };

    return (
        <div className="relative h-full">
            <DashboardSkeleton />
            {!isLoading && totalCount > 0 && (
                <OngoingLiveOverlay
                    loading={false}
                    items={items}
                    totalCount={totalCount}
                    onDismiss={handleDismiss}
                    onLoadMore={handleLoadMore}
                    canLoadMore={items.length < totalCount}
                    loadingMore={isFetching && pageIndex > 1}
                />
            )}
        </div>
    );
}
