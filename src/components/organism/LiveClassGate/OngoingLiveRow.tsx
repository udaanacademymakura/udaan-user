import { Box, Button, Typography, useTheme } from "@mui/material";
import { Clock, People } from "iconsax-reactjs";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import type { LiveClassProps } from "../../../types/liveClass";
import { getTime } from "../../../utils/formatTime";

interface Props {
    data: LiveClassProps;
    onJoin: () => void;
}

export default function OngoingLiveRow({ data, onJoin }: Props) {
    const theme = useTheme();
    const navigate = useNavigate();

    const canJoinLive = () => {
        if (!data.start_time) return false;
        const startTime = new Date(data.start_time).getTime();
        return Date.now() >= startTime - 2 * 60 * 1000;
    };

    const handleJoin = () => {
        const courseId = data.courses?.[0] ?? data.course_id;
        onJoin();
        navigate(PATH.COURSE_MANAGEMENT.COURSES.JOIN_LIVE.ROOT(Number(courseId), Number(data.id)));
    };

    const joinable = canJoinLive();
    const teacherNames = data.teachers?.map((t) => t.name).join(", ") || "—";

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid ${theme.palette.error.main}`,
                transition: "transform 0.15s",
                "&:hover": { transform: "translateX(2px)" },
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "text.primary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.3,
                    }}
                >
                    {data.name}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "11.5px",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {teacherNames}
                </Typography>
                <Box sx={{ display: "flex", gap: "12px", mt: "4px", alignItems: "center" }}>
                    <Typography
                        sx={{ fontSize: "11px", color: "text.secondary", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                        <Clock size={12} variant="Bold" color={theme.palette.info.main} />
                        {getTime(data.start_time)} – {getTime(data.end_time)}
                    </Typography>
                    <Typography
                        sx={{ fontSize: "11px", color: "text.secondary", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                        <People size={12} variant="Bold" color={theme.palette.success.main} />
                        {data.active_students ?? 0}
                    </Typography>
                </Box>
            </Box>

            <Button
                variant="contained"
                size="small"
                color="error"
                onClick={joinable ? handleJoin : undefined}
                disabled={!joinable}
                startIcon={
                    joinable ? (
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#fff",
                                animation: "live-pulse 1.5s ease-in-out infinite",
                            }}
                        />
                    ) : null
                }
                sx={{
                    flexShrink: 0,
                    fontSize: "12px",
                    fontWeight: 600,
                    px: "14px",
                    py: "6px",
                    minWidth: "70px",
                    textTransform: "none",
                    backgroundColor: joinable ? theme.palette.error.main : undefined,
                    color: joinable ? "#fff" : undefined,
                    "&:hover": joinable
                        ? { backgroundColor: theme.palette.error.dark || theme.palette.error.main }
                        : undefined,
                }}
            >
                {joinable ? "Join" : "Soon"}
            </Button>
        </Box>
    );
}
