import { Box, Skeleton, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import { useGetAllLiveClassesQuery } from "../../../services/liveApi";


export default function DashboardTopBanners() {
    const navigate = useNavigate();

    const [liveDismissed, setLiveDismissed] = useState(false);

    const { data, isLoading } = useGetAllLiveClassesQuery({
        pageIndex: 1,
        pageSize: 2,
        type: "ongoing",
    });

    const ongoingClass = data?.data?.data?.[0] ?? null;
    const hasOngoing = Boolean(ongoingClass);

    const handleJoin = () => {
        if (!ongoingClass) return;
        const courseId = ongoingClass.courses?.[0];
        navigate(
            PATH.COURSE_MANAGEMENT.COURSES.JOIN_LIVE.ROOT(
                courseId ? Number(courseId) : undefined,
                Number(ongoingClass.id)
            )
        );
    };

    const startedLabel = (() => {
        if (!ongoingClass?.start_time) return "";
        const diff = Math.floor((Date.now() - new Date(ongoingClass.start_time).getTime()) / 60000);
        return diff > 0 ? `Started ${diff} min${diff === 1 ? "" : "s"} ago` : "Just started";
    })();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/**   {!noticeDismissed && (
                <Box sx={{
                    background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                    border: "1px solid #FDE68A",
                    borderLeft: "4px solid #F59F0A",
                    borderRadius: "10px",
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    position: "relative",
                }}>
                    <Box sx={{
                        width: 34, height: 34,
                        background: "#FEF3C7",
                        borderRadius: "6px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0Z"
                                stroke="#F59F0A" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#78350F", mb: "3px" }}>
                            {STATIC_NOTICE.title}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#92400E", lineHeight: 1.55 }}>
                            {STATIC_NOTICE.body}
                        </Typography>
                    </Box>

                    <Box
                        component="button"
                        onClick={() => setNoticeDismissed(true)}
                        sx={{
                            position: "absolute", top: 10, right: 12,
                            background: "#FEF3C7", border: "none",
                            width: 22, height: 22, borderRadius: "4px",
                            cursor: "pointer", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            color: "#92400E",
                            "&:hover": { background: "#FDE68A" },
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </Box>
                </Box>
            )}
            */}
            {!liveDismissed && (isLoading || hasOngoing) && (
                <Box sx={{
                    background: "linear-gradient(135deg, #8B0000 0%, #E21D48 60%, #F25077 100%)",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -30, right: -30,
                        width: 120, height: 120,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.07)",
                    },
                }}>
                    {isLoading ? (
                        <>
                            <Skeleton variant="circular" width={10} height={10} sx={{ bgcolor: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton width="50%" height={14} sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: "4px" }} />
                                <Skeleton width="70%" height={18} sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />
                            </Box>
                        </>
                    ) : (
                        <>
                            {/* Pulsing white dot */}
                            <Box sx={{
                                width: 10, height: 10, borderRadius: "50%",
                                bgcolor: "#fff", flexShrink: 0,
                                boxShadow: "0 0 0 3px rgba(255,255,255,0.3)",
                                animation: "liveBannerPulse 1.4s infinite",
                                "@keyframes liveBannerPulse": {
                                    "0%, 100%": { boxShadow: "0 0 0 3px rgba(255,255,255,0.3)" },
                                    "50%": { boxShadow: "0 0 0 7px rgba(255,255,255,0.08)" },
                                },
                            }} />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{
                                    fontSize: "10px", fontWeight: 700,
                                    color: "rgba(255,255,255,0.85)",
                                    letterSpacing: "0.8px", textTransform: "uppercase",
                                    mb: "3px",
                                }}>
                                    Live Now
                                </Typography>
                                <Typography sx={{
                                    fontSize: "14px", fontWeight: 700, color: "#fff",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {ongoingClass!.name}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", mt: "2px" }}>
                                    {startedLabel}
                                    {ongoingClass!.active_students
                                        ? ` · ${ongoingClass!.active_students} students watching`
                                        : ""}
                                </Typography>
                            </Box>

                            {/* Join button */}
                            <Box
                                component="button"
                                onClick={handleJoin}
                                sx={{
                                    background: "#fff",
                                    color: "#E21D48",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "8px 18px",
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    "&:hover": { opacity: 0.9 },
                                }}
                            >
                                Join Class
                            </Box>
                        </>
                    )}

                    {/* Close button */}
                    <Box
                        component="button"
                        onClick={() => setLiveDismissed(true)}
                        sx={{
                            position: "absolute", top: 10, right: 12,
                            background: "rgba(255,255,255,0.15)",
                            border: "none", color: "#fff",
                            borderRadius: "4px",
                            width: 22, height: 22,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            "&:hover": { background: "rgba(255,255,255,0.28)" },
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
