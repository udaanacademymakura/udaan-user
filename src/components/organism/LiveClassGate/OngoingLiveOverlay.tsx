import { Box, Button, CircularProgress, Typography, useTheme } from "@mui/material";
import { CloseCircle, VideoSquare } from "iconsax-reactjs";
import { useState } from "react";
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

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
                px: 2,
                backgroundColor: isDark ? "rgba(10, 12, 20, 0.55)" : "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(14px) saturate(160%)",
                WebkitBackdropFilter: "blur(14px) saturate(160%)",
            }}
        >
            <Box
                onAnimationEnd={() => setShaking(false)}
                sx={{
                    width: "100%",
                    maxWidth: 480,
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    background: isDark
                        ? "rgba(28, 32, 44, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.18)",
                    backdropFilter: "blur(20px) saturate(160%)",
                    WebkitBackdropFilter: "blur(20px) saturate(160%)",
                    overflow: "hidden",
                    transformOrigin: "center center",
                    willChange: "transform",
                    animation: shaking ? "live-gate-attention 0.45s ease-in-out 2" : "none",
                    "@keyframes live-gate-attention": {
                        "0%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.04)" },
                        "100%": { transform: "scale(1)" },
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "10px",
                                background: theme.palette.error.light,
                                color: theme.palette.error.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <VideoSquare size={20} variant="Bold" />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                                Live Class In Progress
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: "text.secondary" }}>
                                {loading
                                    ? "Checking your classes…"
                                    : totalCount === 1
                                        ? "1 class is ongoing now"
                                        : `${totalCount} classes are ongoing now`}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        component="button"
                        onClick={onDismiss}
                        aria-label="Close"
                        sx={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "text.secondary",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            p: 0,
                            color: (theme) => theme.palette.error.main
                        }}
                    >
                        <CloseCircle size={26} variant="Bold" />
                    </Box>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        minHeight: 120,
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
                                        fontWeight: 600,
                                    }}
                                >
                                    {loadingMore ? (
                                        <CircularProgress size={14} sx={{ mr: 1 }} />
                                    ) : null}
                                    {loadingMore ? "Loading…" : `Show more (${totalCount - items.length} remaining)`}
                                </Button>
                            )}
                        </>
                    )}
                </Box>

                <Box
                    sx={{
                        padding: "12px 20px 16px",
                        borderTop: `1px solid ${theme.palette.divider}`,
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
                            fontWeight: 600,
                            "&:hover": { color: "primary.main" },
                        }}
                    >
                        Continue to dashboard →
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
