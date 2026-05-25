import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Typography,
    useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CloseCircle, VideoSquare } from "iconsax-reactjs";
import { useState } from "react";
import type { MouseEvent } from "react";
import type { LiveClassProps } from "../../../types/liveClass";
import OngoingLiveRow from "./OngoingLiveRow";

interface Props {
    loading: boolean;
    items: LiveClassProps[];
    totalCount: number;
    onDismiss: () => void;
    onLoadMore: () => void;
    canLoadMore: boolean;
    loadingMore: boolean;
}

export default function OngoingLiveOverlay({
    loading,
    items,
    totalCount,
    onDismiss,
    onLoadMore,
    canLoadMore,
    loadingMore,
}: Props) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [shaking, setShaking] = useState(false);
    const remainingCount = Math.max(totalCount - items.length, 0);

    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !shaking) {
            setShaking(true);
        }
    };

    return (
        <Box
            onClick={handleBackdropClick}
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 1.5, sm: 2 },
                py: 2,
                background: isDark
                    ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.82)}, ${alpha(theme.palette.primary.main, 0.2)})`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.66)}, ${alpha(theme.palette.primary.contrastText, 0.84)})`,
                backdropFilter: "blur(18px) saturate(150%)",
                WebkitBackdropFilter: "blur(18px) saturate(150%)",
            }}
        >
            <Box
                onAnimationEnd={() => setShaking(false)}
                sx={{
                    width: "100%",
                    maxWidth: 560,
                    maxHeight: "min(86vh, 720px)",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: { xs: "16px", sm: "18px" },
                    background: isDark
                        ? alpha(theme.palette.background.paper, 0.92)
                        : alpha(theme.palette.primary.contrastText, 0.94),
                    border: `1px solid ${alpha(theme.palette.separator.dark, isDark ? 0.5 : 0.85)}`,
                    boxShadow: isDark
                        ? `0 28px 70px ${alpha(theme.palette.common.black, 0.42)}`
                        : `0 28px 70px ${alpha(theme.palette.primary.main, 0.16)}`,
                    backdropFilter: "blur(22px) saturate(165%)",
                    WebkitBackdropFilter: "blur(22px) saturate(165%)",
                    overflow: "hidden",
                    transformOrigin: "center center",
                    willChange: "transform",
                    animation: shaking ? "live-gate-attention 0.45s ease-in-out 2" : "none",
                    "@keyframes live-gate-attention": {
                        "0%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.035)" },
                        "100%": { transform: "scale(1)" },
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        padding: { xs: "16px", sm: "18px 20px" },
                        borderBottom: `1px solid ${alpha(theme.palette.separator.dark, 0.75)}`,
                        background: isDark
                            ? alpha(theme.palette.primary.light, 0.24)
                            : `linear-gradient(90deg, ${alpha(theme.palette.error.light, 0.76)}, ${alpha(theme.palette.primary.light, 0.46)})`,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "12px",
                                backgroundColor: "error.main",
                                color: "error.contrastText",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 12px 28px ${alpha(theme.palette.error.main, 0.28)}`,
                                position: "relative",
                                flexShrink: 0,
                                "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    inset: -5,
                                    borderRadius: "15px",
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.28)}`,
                                },
                            }}
                        >
                            <VideoSquare size={22} variant="Bold" />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: { xs: "15px", sm: "16px" },
                                    fontWeight: 800,
                                    color: "text.dark",
                                    lineHeight: 1.25,
                                }}
                            >
                                Live Class In Progress
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: "text.secondary" }}>
                                {loading
                                    ? "Checking your classes..."
                                    : totalCount === 1
                                        ? "1 class is ongoing now"
                                        : `${totalCount} classes are ongoing now`}
                            </Typography>
                        </Box>
                    </Box>

                    <IconButton
                        onClick={onDismiss}
                        aria-label="Close"
                        size="small"
                        sx={{
                            color: "error.main",
                            flexShrink: 0,
                            "&:hover": {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                            },
                        }}
                    >
                        <CloseCircle size={26} variant="Bold" />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        padding: { xs: "12px", sm: "14px 16px" },
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        minHeight: 120,
                        backgroundColor: isDark
                            ? alpha(theme.palette.background.default, 0.18)
                            : alpha(theme.palette.background.paper, 0.68),
                    }}
                >
                    {loading && items.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <>
                            {items.map((item) => (
                                <OngoingLiveRow key={item.id} data={item} onJoin={onDismiss} />
                            ))}

                            {canLoadMore && (
                                <Button
                                    onClick={onLoadMore}
                                    disabled={loadingMore}
                                    variant="text"
                                    size="small"
                                    sx={{
                                        mt: "4px",
                                        textTransform: "none",
                                        fontSize: "12.5px",
                                        fontWeight: 700,
                                        alignSelf: "center",
                                        borderRadius: "999px",
                                        px: 2,
                                        color: "primary.main",
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                        "&:hover": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.14),
                                        },
                                    }}
                                >
                                    {loadingMore ? <CircularProgress size={14} sx={{ mr: 1 }} /> : null}
                                    {loadingMore ? "Loading..." : `Show more (${remainingCount} remaining)`}
                                </Button>
                            )}
                        </>
                    )}
                </Box>

                <Box
                    sx={{
                        padding: "12px 20px 16px",
                        borderTop: `1px solid ${alpha(theme.palette.separator.dark, 0.75)}`,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        onClick={onDismiss}
                        variant="text"
                        size="small"
                        sx={{
                            textTransform: "none",
                            fontSize: "12.5px",
                            color: "text.secondary",
                            fontWeight: 700,
                            "&:hover": { color: "primary.main" },
                        }}
                    >
                        Continue to dashboard
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
