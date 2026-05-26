import { useEffect, useMemo, useRef, useState } from "react";
import { PATH } from "../../../../../routes/PATH";
import { useGetCourseMediaPlaylistQuery, useGetUserPurchasedCourseQuery } from "../../../../../services/courseApi";
import type { QueryParams } from "../../../../../types";
import { EmptyList } from "../../../../molecules/EmptyList";
import PlaylistCard from "../../../../organism/Cards/PlaylistCard";
import TableFilter from "../../../../organism/TableFilter";

const VideoSkeleton = () => (
    <div className="col-span-1 animate-pulse">
        <div className="bg-gray-200 rounded-xl h-48 w-full"></div>
        <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    </div>
);

const CourseFilterSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
    </div>
);

export default function CoursePlaylist() {
    const [qp] = useState<QueryParams>({
        pageIndex: 1,
        pageSize: 10,
        search: '',
    });

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [qpVideos, setQpVideos] = useState<QueryParams>({
        pageIndex: 1,
        pageSize: 15,
    });
    const [search, setSearch] = useState<string>("");

    const initialCourseSet = useRef(false);

    const { data: myCourse, isLoading } = useGetUserPurchasedCourseQuery(qp);

    const myCourses = useMemo(() =>
        myCourse?.data?.data || [],
        [myCourse?.data?.data]
    );

    useEffect(() => {
        if (myCourses.length > 0 && !selectedCourseId && !initialCourseSet.current) {
            setSelectedCourseId(myCourses[0].id || null);
            initialCourseSet.current = true;
        }
    }, [myCourses.length, selectedCourseId]);

    const { data: playlist, isLoading: loadingPlaylist } = useGetCourseMediaPlaylistQuery(
        { id: selectedCourseId!, type: "videos", qp: qpVideos },
        { skip: !selectedCourseId }
    );

    const selectedCourse = useMemo(
        () => myCourses.find(course => course.id === selectedCourseId),
        [myCourses, selectedCourseId]
    );


    useEffect(() => {
        setQpVideos(prev => ({ ...prev, pageIndex: 1 }));
    }, [selectedCourseId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setQpVideos(prev => ({ ...prev, search, pageIndex: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);


    if (isLoading || loadingPlaylist) {
        return (
            <div className="all__video__listing">
                <div className="mb-6">
                    <CourseFilterSkeleton />
                </div>
                <div className="flex flex-col gap-4 md:grid grid-cols-2 xl:grid-cols-3 lg:gap-6">
                    {[...Array(6)].map((_, idx) => (
                        <VideoSkeleton key={idx} />
                    ))}
                </div>
            </div>
        );
    }

    if (!myCourses.length) {
        return (
            <EmptyList
                title="You Haven't Purchased any course"
                description="Please purchase a course to view the videos."
                cta={{
                    label: "Explore Course",
                    url: PATH.COURSE_MANAGEMENT.COURSES.ROOT
                }}
            />
        );
    }

    return (
        <div className="all__video__listing h-full flex flex-col overflow-hidden">
            <div className="mb-6">
                <TableFilter
                    search={search || ""}
                    setSearch={(search) => setSearch(search)}
                    onFilter={() => { }}
                    myCourses={myCourses}
                    selectedCourseId={selectedCourseId}
                    setSelectedCourseId={setSelectedCourseId}
                />
            </div>

            {selectedCourse && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {selectedCourse.name}
                    </h2>
                </div>)}

            <div className="h-full overflow-auto">
                {playlist && playlist?.data?.data?.length > 0 ? (
                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                        {playlist?.data?.data?.map((item) => (
                            <PlaylistCard data={item} key={item.chapter_id} courseId={selectedCourse?.id} />
                        ))}
                    </div>
                ) : (
                    <EmptyList
                        title="No Videos Found"
                        description="There are no videos available for the selected course."
                    />
                )}
            </div>
        </div >
    );
}