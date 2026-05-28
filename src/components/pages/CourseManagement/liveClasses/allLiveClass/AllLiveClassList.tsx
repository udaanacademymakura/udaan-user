import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { PATH } from "../../../../../routes/PATH";
import { useGetUserPurchasedCourseQuery } from "../../../../../services/courseApi";
import { useGetAllLiveClassesQuery } from "../../../../../services/liveApi";
import type { QueryParams } from "../../../../../types";
import type { LiveClassProps } from "../../../../../types/liveClass";
import { EmptyList } from "../../../../molecules/EmptyList";
import TabController from "../../../../molecules/TabController";
import LiveClassCard from "../../../../organism/Cards/LiveClassCard";
import PageHeader from "../../../../organism/PageHeader";
import TableFilter from "../../../../organism/TableFilter";

type Status = "ongoing" | "upcoming";

/* ---------------- Skeletons ---------------- */

const VideoSkeleton = () => (
  <div className="col-span-1 animate-pulse">
    <div className="bg-gray-200 rounded-xl h-48 w-full" />
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const CourseFilterSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-12 bg-gray-200 rounded-lg" />
    <div className="h-10 bg-gray-200 rounded w-1/2" />
  </div>
);

/* ---------------- Component ---------------- */

export default function AllLiveClassList() {
  const { t } = useTranslation();

  /* ---------- Course Query ---------- */
  const [courseQP] = useState<QueryParams>({
    pageIndex: 1,
    pageSize: 10,
    search: "",
  });

  const { data: myCourse, isLoading } =
    useGetUserPurchasedCourseQuery(courseQP);

  const myCourses = myCourse?.data?.data ?? [];

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Status>("ongoing");

  const [qp, setQp] = useState<QueryParams>({
    pageIndex: 1,
    pageSize: 15,
  });

  const [items, setItems] = useState<LiveClassProps[]>([]);

  const { data, isLoading: loadingLiveClass, isFetching } =
    useGetAllLiveClassesQuery({
      id: selectedCourseId!,
      ...qp,
      type: activeTab,
    });

  const list = data?.data?.data ?? [];
  const totalPages = data?.data?.pagination?.total_pages ?? 0;
  const hasMore = qp.pageIndex < totalPages;

  const selectedCourse = myCourses.find(
    course => course.id === selectedCourseId
  );

  /* ---------- Merge Pagination ---------- */
  useEffect(() => {
    if (qp.pageIndex === 1) {
      setItems(list);
      return;
    }

    setItems(prev => {
      const ids = new Set(prev.map(v => v.id));
      return [...prev, ...list.filter(v => !ids.has(v.id))];
    });
  }, [list, qp.pageIndex]);

  /* ---------- Reset on Filter Change ---------- */
  useEffect(() => {
    setQp(prev => ({ ...prev, pageIndex: 1 }));
  }, [selectedCourseId, activeTab]);

  /* ---------- Search Debounce ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setQp(prev => ({ ...prev, pageIndex: 1, search }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------- Infinite Scroll ---------- */
  const fetchMore = () => {
    if (!loadingLiveClass && hasMore) {
      setQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
    }
  };

  /* ---------------- UI States ---------------- */

  if (isLoading) {
    return (
      <div className="all__video__listing">
        <div className="mb-6">
          <CourseFilterSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!myCourses.length) {
    return (
      <EmptyList
        title="You Haven't Purchased any course"
        description="Please purchase a course to view the live class."
        cta={{
          label: "Explore Course",
          url: PATH.COURSE_MANAGEMENT.COURSES.ROOT,
        }}
      />
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="all__note__listing">
      <div className="mb-6">
        <PageHeader
          breadcrumb={[{ title: t("menus.liveClasses") }]}
        />

        <TableFilter
          search={search}
          setSearch={setSearch}
          myCourses={myCourses}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
        />
      </div>

      {selectedCourse && (
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">
            {selectedCourse.name}
          </h2>
        </div>
      )}

      <TabController
        options={[
          { value: "ongoing", label: "Ongoing Classes" },
          { value: "upcoming", label: "Upcoming Classes" },
        ]}
        currentActive={activeTab}
        setActiveTab={value => setActiveTab(value as Status)}
      />

      <div className="media__listing__wrapper mt-4">
        <Box
          id="video__listing__wrapper"
          sx={{
            maxHeight: "100%",
            overflow: "auto",
          }}
        >
          {loadingLiveClass && qp.pageIndex === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <VideoSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div style={{ opacity: isFetching ? 0.5 : 1, transition: "opacity 0.2s", pointerEvents: isFetching ? "none" : "auto" }}>
              {items.length ? (
                <InfiniteScroll
                  dataLength={items.length}
                  next={fetchMore}
                  hasMore={hasMore}
                  scrollableTarget="video__listing__wrapper"
                  loader={
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <VideoSkeleton key={i} />
                      ))}
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map(item => (
                      <LiveClassCard
                        key={item.id}
                        data={item}
                        courseId={Number(item.course_id)}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              ) : (
                !isFetching && (
                  <EmptyList
                    title="No Live Classes Found"
                    description="There are no live classes for the selected filters."
                  />
                )
              )}
            </div>
          )}
        </Box>
      </div>
    </div>
  );
}
