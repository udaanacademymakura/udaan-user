import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { Clock, People } from "iconsax-reactjs";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import type { LiveClassProps } from "../../../types/liveClass";
import { getTime } from "../../../utils/formatTime";

type StatusVariantKey = "error" | "info" | "success";
const statusVariantMap: Record<string, StatusVariantKey> = {
    ended: "error",
    upcoming: "info",
    ongoing: "error",
};

function initialOf(name?: string): string {
    if (!name) return "?";
    const first = name.trim().split(/\s+/)[0] ?? "";
    return first.charAt(0).toUpperCase() || "?";
}

function avatarBgColor(seed: string, theme: Theme): string {
    const palette = [
        theme.palette.primary.main,
        theme.palette.primary.main,
        theme.palette.primary.main,
        theme.palette.primary.main,
        theme.palette.primary.main,
    ];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) | 0;
    return palette[Math.abs(h) % palette.length];
}

export default function LiveClassCard({ data, courseId }: { data: LiveClassProps; courseId?: number }) {
    const theme = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();

    const canJoinLive = () => {
        if (!data.start_time) return false;
        const startTime = new Date(data.start_time).getTime();
        return Date.now() >= startTime - 2 * 60 * 1000;
    };

    const startTimeLabel = getTime(data.start_time);

    const handleJoinClass = () => {
        navigate(PATH.COURSE_MANAGEMENT.COURSES.JOIN_LIVE.ROOT(Number(courseId ? courseId : id), Number(data?.id)));
    };

    const variant = statusVariantMap[data?.status] ?? "info";
    const primaryTeacher = data?.teachers?.[0];
    const teacherImage = primaryTeacher?.live_preview_url || primaryTeacher?.thumbnail_url || undefined;
    const teacherNames = data?.teachers?.map((t) => t.name).join(", ") || "—";
    const joinable = data.status === "ongoing" && canJoinLive();

    return (
        <Box
            className="live-class-card"
            sx={{
                position: "relative",
                display: "flex",
                gap: { xs: "12px", sm: "14px" },
                padding: { xs: "12px", sm: "14px" },
                borderRadius: "12px",
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.separator.dark}`,
                // borderTop: `4px solid ${theme.palette[variant].main}`,
                width: "100%",
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: { xs: 120, sm: 160 },
                    aspectRatio: "16 / 9",
                    flexShrink: 0,
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: teacherImage
                        ? "transparent"
                        : avatarBgColor(primaryTeacher?.name ?? data.name ?? "?", theme),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                {teacherImage ? (
                    <Box
                        component="img"
                        src={teacherImage}
                        alt={primaryTeacher?.name ?? "Teacher"}
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                ) : (
                    <Typography
                        sx={{
                            fontSize: { xs: "26px", sm: "36px" },
                            fontWeight: 700,
                            color: "#fff",
                            lineHeight: 1,
                            userSelect: "none",
                        }}
                    >
                        {initialOf(primaryTeacher?.name ?? data.name)}
                    </Typography>
                )}

                {data?.status !== "ongoing" && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            backgroundColor: theme.palette[variant].main,
                            color: "#fff",
                            fontSize: "9.5px",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            lineHeight: 1,
                            boxShadow: `0 2px 6px rgba(0,0,0,0.18)`,
                        }}
                    >
                        {data?.status === "upcoming"
                            ? "Upcoming"
                            : data?.status === "ended"
                                ? "Ended"
                                : data?.status ?? ""}
                    </Box>
                )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                        fontSize: { xs: "13px", sm: "14px" },
                        color: "text.dark",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {data.name}
                </Typography>
                <Typography
                    variant="overline"
                    color="text.middle"
                    sx={{
                        fontSize: { xs: "10.5px", sm: "11px" },
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {teacherNames}
                </Typography>

                <Divider sx={{ my: "4px" }} />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: "8px", sm: "12px" } }}>
                    <Typography
                        variant="caption"
                        color="text.dark"
                        sx={{ display: "flex", alignItems: "center", gap: "4px", fontSize: { xs: "11px", sm: "12px" } }}
                    >
                        <Box sx={{ color: theme.palette.info.main, display: "inline-flex" }}>
                            <Clock size={14} variant="Bold" />
                        </Box>
                        {getTime(data.start_time)} – {getTime(data.end_time)}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.dark"
                        sx={{ display: "flex", alignItems: "center", gap: "4px", fontSize: { xs: "11px", sm: "12px" } }}
                    >
                        <Box sx={{ color: theme.palette.success.main, display: "inline-flex" }}>
                            <People size={14} variant="Bold" />
                        </Box>
                        <strong>{data?.active_students ?? 0}</strong> active
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    variant={joinable ? "contained" : "text"}
                    size="small"
                    color={joinable ? "error" : "inherit"}
                    onClick={joinable ? handleJoinClass : undefined}
                    disabled={data.status === "ended" || (data.status === "ongoing" && !joinable)}
                    startIcon={
                        joinable ? (
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    animation: "live-pulse 1.5s ease-in-out infinite",
                                    "@keyframes live-pulse": {
                                        "0%, 100%": { opacity: 1 },
                                        "50%": { opacity: 0.3 },
                                    },
                                }}
                            />
                        ) : data.status === "upcoming" ? (
                            <Clock size={16} />
                        ) : null
                    }
                    sx={{
                        mt: "auto",
                        alignSelf: "flex-start",
                        fontSize: { xs: "12px", sm: "13px" },
                        fontWeight: 600,
                        textTransform: "none",
                        px: "14px",
                        py: "6px",
                        backgroundColor: joinable ? theme.palette.error.main : "button.light",
                        color: joinable ? "#fff" : undefined,
                        "&:hover": joinable
                            ? { backgroundColor: theme.palette.error.dark || theme.palette.error.main }
                            : undefined,
                    }}
                >
                    {data.status === "upcoming" && `Starts at ${startTimeLabel}`}
                    {data.status === "ongoing" && (joinable ? "Join Live" : `Join at ${startTimeLabel}`)}
                    {data.status === "ended" && "Class Ended"}
                </Button>
            </Box>
        </Box>
    );
}
