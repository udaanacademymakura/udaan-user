import { Box, Button, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import type { CourseProps } from "../../../../types/course";
import Bookmark from "../../../atom/Bookmark";
import CourseStatus from "./CourseStatus";

export default function MyCourseCard({ course }: { course: CourseProps }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();

    const hasAccess =
        course.course_type === "free" ||
        course?.user?.has_purchased ||
        course?.user?.is_free_trial_valid;

    const isExpired =
        !course?.user?.has_purchased &&
        !course?.user?.is_free_trial_valid &&
        course.course_type !== "free";

    // ends_at arrives as e.g. "06 Dec 2025, Monday" — take the date part only
    const expiryLabel = course?.ends_at?.split(",")?.[0] ?? "";

    const handleContinue = () =>
        navigate(PATH.MY_COURSE.VIEW_COURSE.ROOT(Number(course.id)));
    const handlePurchase = () =>
        navigate(PATH.COURSE_MANAGEMENT.COURSES.PURCHASE.ROOT(Number(course.id), "course"));

    return (
        <Box
            className="my__course__card rounded-lg overflow-hidden flex flex-col h-full"
            sx={{
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                transition: "transform 0.15s, box-shadow 0.15s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 22px rgba(0,0,0,0.09)",
                },
            }}
        >
            {/* ── Image area ── */}
            <Box
                sx={{
                    height: 108,
                    position: "relative",
                    bgcolor: "primary.light",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Box
                    component="img"
                    src={course.thumbnail_url || "/fallback.png"}
                    alt={course.name}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = "/fallback.png";
                    }}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Status badge — top left */}
                <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                    <CourseStatus status={course.course_type} />
                </Box>

                {/* Bookmark — top right */}
                <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                    <Bookmark course={course} />
                </Box>
            </Box>

            {/* ── Card body ── */}
            <Box
                sx={{
                    p: "12px 13px 13px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                }}
            >
                {/* Subjects / category meta */}
                <Box sx={{ mb: "6px" }}>
                    {course.subjects ? (
                        <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "text.secondary" }}>
                            {course.subjects} {t("messages.subjects")}
                        </Typography>
                    ) : course.mega_categories?.length ? (
                        <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "text.secondary" }}>
                            {course.mega_categories[0]}
                        </Typography>
                    ) : null}
                </Box>

                {/* Course name — 2-line clamp */}
                <Typography
                    sx={{
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "text.primary",
                        lineHeight: 1.4,
                        mb: "5px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.name}
                </Typography>

                {/* Expiry label — only when expired */}
                {isExpired && expiryLabel && (
                    <Typography
                        sx={{ fontSize: "11px", color: "error.main", fontWeight: 500, mb: "8px" }}
                    >
                        Expired: {expiryLabel}
                    </Typography>
                )}

                {/* Push progress + actions to bottom */}
                <Box sx={{ flex: 1 }} />

                {/* Progress row */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: "5px",
                    }}
                >
                    <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
                        Progress
                    </Typography>
                    <Typography
                        sx={{ fontSize: "11px", fontWeight: 700, color: "#16A34A" }}
                    >
                        {course?.progress ?? 0}%
                    </Typography>
                </Box>

                {/* Progress bar — 4 px, green gradient fill */}
                <Box
                    sx={{
                        height: 4,
                        bgcolor: "#DCFCE7",
                        borderRadius: "99px",
                        overflow: "hidden",
                        mb: "11px",
                    }}
                >
                    <Box
                        sx={{
                            height: "100%",
                            width: `${course?.progress ?? 0}%`,
                            borderRadius: "99px",
                            background: "linear-gradient(90deg, #16A34A, #4ADE80)",
                        }}
                    />
                </Box>

                {/* Action buttons */}
                <Box sx={{ display: "flex", gap: "7px" }}>
                    {isExpired ? (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={handleContinue}
                            >
                                {t("messages.continue")}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={handlePurchase}
                            >
                                Renew
                            </Button>
                        </>
                    ) : !hasAccess ? (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={handlePurchase}
                            >
                                {t("messages.purchase_now")}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={handleContinue}
                            >
                                Browse
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={handleContinue}
                            >
                                {t("messages.continue")}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={handleContinue}
                            >
                                Browse
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
