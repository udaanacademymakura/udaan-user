import { Box, OutlinedInput, Skeleton, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PATH } from "../../../../routes/PATH";
import { useGetUserPurchasedCourseQuery } from "../../../../services/courseApi";
import { useDebounce } from "../../../../utils/useDebounce";
import { EmptyList } from "../../../molecules/EmptyList";
import TablePagination from "../../../molecules/Pagination";
import TabController from "../../../molecules/TabController";
import MyCourseCard from "../../../organism/Cards/CourseCard/MyCourseCard";
import PageHeader from "../../../organism/PageHeader";

export default function MyCourseRoot() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"trial" | "purchased" | "free">("purchased");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    });
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const theme = useTheme();
    const { data, isLoading } = useGetUserPurchasedCourseQuery({ ...qp, type: activeTab, search: debouncedSearch });

    const courses = data?.data?.data || [];
    const pagination = data?.data?.pagination || null;


    return (
        <div className="flex flex-col justify-between h-full">
            <PageHeader
                breadcrumb={[{
                    title: t("messages.my_course")
                }]}
            />
            <Box className="h-full overflow-auto">
                <div className="mb-4 lg:mb-6 flex justify-between items-center flex-col gap-3 sm:flex-row
                ">
                    <TabController
                        options={[
                            { value: "purchased", label: "Purchased" },
                            { value: "trial", label: "Free Trial" },
                            { value: "free", label: "Free" },
                        ]}
                        currentActive={activeTab}
                        setActiveTab={(value) => { setQp({ ...qp, pageIndex: 1 }); setActiveTab(value as any) }}
                    />
                    <OutlinedInput
                        sx={{
                            width: {
                                xs: "100%",
                                md: "auto",
                            }
                        }}
                        name="search"
                        placeholder="Enter Course Name"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {!isLoading && !courses.length ?
                    <EmptyList
                        title="No Course Purchased Yet !"
                        description="You are not enrolled in any course yet." cta={{
                            label: "Explore Course",
                            url: PATH.COURSE_MANAGEMENT.COURSES.ROOT
                        }} /> :

                    <div className="flex flex-col gap-4 lg:gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 pb-4">
                        {isLoading ? Array.from({ length: 8 }).map((_, index) => (
                            <Box
                                className="course__card rounded-md overflow-hidden relative h-full flex flex-col"
                                sx={{ border: `1px solid ${theme.palette.textField.border}` }}
                                key={index.toString()}
                            >

                                <Skeleton variant="rectangular" height={110} width="100%" />

                                <Box className="course__content h-full p-3 bg-slate-50 flex flex-col gap-2 justify-between">
                                    <div className="top__content">
                                        {/* Category Badge */}
                                        <Skeleton width={90} height={28} />

                                        {/* Title */}
                                        <Skeleton width="85%" height={25} sx={{ mt: 1.5, mb: 2 }} />

                                        {/* Features (2–3 lines) */}
                                        <Skeleton width="70%" height={18} />
                                        <Skeleton width="50%" height={18} />
                                    </div>

                                    <div className="footer__content mt-3">
                                        <Skeleton height={1} width="100%" sx={{ mb: 2 }} />

                                        {/* Buttons */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <Skeleton height={38} />
                                            <Skeleton height={38} />
                                        </div>
                                    </div>
                                </Box>

                                {/* Status badge */}
                                <Skeleton
                                    variant="rectangular"
                                    width={60}
                                    height={22}
                                    sx={{ position: "absolute", top: 8, right: 8, borderRadius: 1 }}
                                />
                            </Box>
                        )) :
                            courses.map((course) => (
                                <div className="col-span-1">
                                    {/* <CourseCard  havePurchased={true} /> */}
                                    <MyCourseCard course={course} />
                                </div>
                            ))
                        }
                    </div>
                }
            </Box>
            {pagination && pagination?.total_pages > 1 ? <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={pagination?.total_pages || 0}
            /> : ""}
        </div>
    )
}
