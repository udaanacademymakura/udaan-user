import { useEffect, useMemo, useState } from "react";
import type { TestStatus } from "../components/pages/TestManagement/allTest/AllTestList";
import { useGetUserAllTestQuery, useGetUserPurchasedTestRelatedToBundleQuery } from "../services/testApi";
import type { QueryParams } from "../types";
import type { QuestionTypeProps, TestProps } from "../types/question";
const PAGE_SIZE = 8;

export function usePaginatedTests(
    baseParams: QueryParams,
    type: QuestionTypeProps,
    status: TestStatus,
    resetKey: unknown,
) {
    const [pageIndex, setPageIndex] = useState(1);
    const [accumulated, setAccumulated] = useState<TestProps[]>([]);

    useEffect(() => {
        setPageIndex(1);
        setAccumulated([]);
    }, [resetKey]);

    const { data, isLoading } = useGetUserAllTestQuery({
        ...baseParams,
        pageIndex,
        pageSize: PAGE_SIZE,
        type,
        status,
    });

    const page = useMemo<TestProps[]>(() => data?.data?.data ?? [], [data]);
    const totalPages = data?.data?.pagination?.total_pages ?? 0;

    useEffect(() => {
        if (page.length === 0 && pageIndex === 1) {
            setAccumulated((prev) => (prev.length === 0 ? prev : []));
            return;
        }
        if (page.length === 0) return;

        setAccumulated((prev) => {
            if (pageIndex === 1) return page;
            const existingIds = new Set(prev.map((v) => v.id));
            const additions = page.filter((v) => !existingIds.has(v.id));
            return additions.length === 0 ? prev : [...prev, ...additions];
        });
    }, [page, pageIndex]);

    const loadMore = () => setPageIndex((p) => p + 1);
    const hasMore = pageIndex < totalPages;

    return { tests: accumulated, isLoading, hasMore, loadMore };
}
export function usePaginatedBunldeTests(
    baseParams: QueryParams,
    type: QuestionTypeProps,
    status: TestStatus,
    resetKey: unknown,
    id: number
) {
    const [pageIndex, setPageIndex] = useState(1);
    const [accumulated, setAccumulated] = useState<TestProps[]>([]);

    useEffect(() => {
        setPageIndex(1);
        setAccumulated([]);
    }, [resetKey]);

    const { data, isLoading } = useGetUserPurchasedTestRelatedToBundleQuery({
        ...baseParams,
        pageIndex,
        pageSize: PAGE_SIZE,
        type,
        status,
        id
    });

    const page = useMemo<TestProps[]>(() => data?.data?.data ?? [], [data]);
    const totalPages = data?.data?.pagination?.total_pages ?? 0;

    useEffect(() => {
        if (page.length === 0 && pageIndex === 1) {
            setAccumulated((prev) => (prev.length === 0 ? prev : []));
            return;
        }
        if (page.length === 0) return;

        setAccumulated((prev) => {
            if (pageIndex === 1) return page;
            const existingIds = new Set(prev.map((v) => v.id));
            const additions = page.filter((v) => !existingIds.has(v.id));
            return additions.length === 0 ? prev : [...prev, ...additions];
        });
    }, [page, pageIndex]);

    const loadMore = () => setPageIndex((p) => p + 1);
    const hasMore = pageIndex < totalPages;

    return { tests: accumulated, isLoading, hasMore, loadMore };
}

