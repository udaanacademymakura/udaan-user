import { Box, Button, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Clock, People, VideoSquare } from "iconsax-reactjs";
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
    const isDark = theme.palette.mode === "dark";

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
    const teacherNames = data.teachers?.map((t) => t.name).join(", ") || "Instructor not assigned";
    const activeStudents = data.active_students ?? 0;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: "12px", sm: "14px" },
                padding: { xs: "13px", sm: "14px 16px" },
                borderRadius: "14px",
                background: isDark
                    ? alpha(theme.palette.background.paper, 0.82)
                    : theme.palette.primary.contrastText,
                border: `1px solid ${alpha(theme.palette.separator.dark, isDark ? 0.52 : 0.95)}`,
                boxShadow: joinable
                    ? `0 14px 34px ${alpha(theme.palette.error.main, isDark ? 0.18 : 0.12)}`
                    : "none",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    insetBlock: 0,
                    left: 0,
                    width: 4,
                    background: joinable ? theme.palette.error.main : theme.palette.info.main,
                },
                "&:hover": {
                    transform: "translateY(-1px)",
                    borderColor: joinable
                        ? alpha(theme.palette.error.main, 0.48)
                        : alpha(theme.palette.info.main, 0.42),
                    boxShadow: `0 16px 36px ${alpha(theme.palette.common.black, isDark ? 0.22 : 0.08)}`,
                },
            }}
        >
            <Box sx={{ minWidth: 0, pl: "2px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, mb: "5px" }}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: joinable ? "error.main" : "info.main",
                            boxShadow: `0 0 0 4px ${alpha(joinable ? theme.palette.error.main : theme.palette.info.main, 0.12)}`,
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        sx={{
                            fontSize: "11px",
                            lineHeight: 1,
                            color: joinable ? "error.main" : "info.main",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: 0,
                        }}
                    >
                        {joinable ? "Live now" : "Opening soon"}
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: { xs: "13.5px", sm: "14px" },
                        fontWeight: 800,
                        color: "text.dark",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.35,
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
                        mt: "2px",
                    }}
                >
                    {teacherNames}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        mt: "9px",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "11px",
                            color: "text.middle",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            borderRadius: "999px",
                            px: "8px",
                            py: "4px",
                        }}
                    >
                        <Clock size={12} variant="Bold" color={theme.palette.info.main} />
                        {getTime(data.start_time)} - {getTime(data.end_time)}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "11px",
                            color: "text.middle",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            borderRadius: "999px",
                            px: "8px",
                            py: "4px",
                        }}
                    >
                        <People size={12} variant="Bold" color={theme.palette.success.main} />
                        {activeStudents} active
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
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                color: "error.contrastText",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                isolation: "isolate",
                                "&::before, &::after": {
                                    content: '""',
                                    position: "absolute",
                                    inset: -3,
                                    borderRadius: "50%",
                                    border: `1px solid ${alpha(theme.palette.error.contrastText, 0.78)}`,
                                    animation: "live-button-ripple 1.55s ease-out infinite",
                                    zIndex: -1,
                                },
                                "&::after": {
                                    animationDelay: "0.55s",
                                },
                                "@keyframes live-button-ripple": {
                                    "0%": {
                                        transform: "scale(0.68)",
                                        opacity: 0.85,
                                    },
                                    "70%": {
                                        opacity: 0.12,
                                    },
                                    "100%": {
                                        transform: "scale(1.75)",
                                        opacity: 0,
                                    },
                                },
                            }}
                        >
                            <VideoSquare size={15} variant="Bold" />
                        </Box>
                    ) : null
                }
                sx={{
                    flexShrink: 0,
                    alignSelf: { xs: "stretch", sm: "center" },
                    fontSize: "12px",
                    fontWeight: 800,
                    px: "16px",
                    py: "8px",
                    minWidth: { xs: "100%", sm: 106 },
                    borderRadius: "10px",
                    textTransform: "none",
                    overflow: "hidden",
                    backgroundColor: joinable ? theme.palette.error.main : theme.palette.button.light,
                    color: joinable ? theme.palette.error.contrastText : theme.palette.text.middle,
                    boxShadow: joinable ? `0 10px 24px ${alpha(theme.palette.error.main, 0.28)}` : "none",
                    "& .MuiButton-startIcon": {
                        mr: joinable ? "8px" : 0,
                    },
                    "&:hover": joinable
                        ? {
                            backgroundColor: theme.palette.error.hover || theme.palette.error.main,
                            boxShadow: `0 14px 30px ${alpha(theme.palette.error.main, 0.34)}`,
                        }
                        : undefined,
                    "&.Mui-disabled": {
                        backgroundColor: alpha(theme.palette.button.light, isDark ? 0.32 : 0.9),
                        color: theme.palette.text.middle,
                    },
                }}
            >
                {joinable ? "Join Live" : "Soon"}
            </Button>
        </Box>
    );
}
