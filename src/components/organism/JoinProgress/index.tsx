import { Box, Button, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { TickCircle } from "iconsax-reactjs";

const STEPS = [
    "Connecting to classroom",
    "Verifying your enrollment",
    "Preparing your seat",
    "Loading the meeting room",
    "Connecting audio",
    "You're in the class",
];

interface LiveClassInfo {
    name?: string;
    teachers?: Array<{ name?: string }>;
}

interface Props {
    phase: number;
    liveClass?: LiveClassInfo;
    onCancel?: () => void;
}

export default function JoinProgress({ phase, liveClass, onCancel }: Props) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const teacherNames = liveClass?.teachers
        ?.map((t) => t.name)
        .filter(Boolean)
        .join(", ");

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                background: isDark
                    ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.94)}, ${alpha(theme.palette.primary.main, 0.18)})`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.5)}, ${alpha("#ffffff", 0.96)})`,
                backdropFilter: "blur(18px) saturate(150%)",
                WebkitBackdropFilter: "blur(18px) saturate(150%)",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 460,
                    borderRadius: "20px",
                    padding: { xs: "20px", sm: "28px 32px" },
                    background: isDark ? alpha(theme.palette.background.paper, 0.94) : "#ffffff",
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                {liveClass?.name && (
                    <Box sx={{ mb: 2.5 }}>
                        <Typography
                            sx={{
                                fontSize: "11px",
                                color: "text.secondary",
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                            }}
                        >
                            Joining
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: "16px", sm: "18px" },
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.3,
                                mt: "2px",
                            }}
                        >
                            {liveClass.name}
                        </Typography>
                        {teacherNames && (
                            <Typography sx={{ fontSize: "12px", color: "text.secondary", mt: "2px" }}>
                                {teacherNames}
                            </Typography>
                        )}
                    </Box>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {STEPS.map((label, i) => {
                        const stepNum = i + 1;
                        const isDone = phase > stepNum;
                        const isActive = phase === stepNum;
                        const isPending = phase < stepNum;

                        return (
                            <Box key={stepNum} sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Box
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isDone ? (
                                        <TickCircle
                                            size={22}
                                            variant="Bold"
                                            color={theme.palette.success.main}
                                        />
                                    ) : isActive ? (
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: "50%",
                                                background: theme.palette.primary.main,
                                                animation: "joinprog-pulse 1.2s ease-in-out infinite",
                                                "@keyframes joinprog-pulse": {
                                                    "0%, 100%": { opacity: 1 },
                                                    "50%": { opacity: 0.4 },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: "50%",
                                                border: `2px solid ${alpha(theme.palette.text.secondary, 0.35)}`,
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography
                                    sx={{
                                        fontSize: { xs: "13px", sm: "14px" },
                                        fontWeight: isActive ? 700 : isDone ? 500 : 400,
                                        color: isPending ? "text.disabled" : "text.primary",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {label}
                                    {isActive ? "…" : ""}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {onCancel && (
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                        <Button
                            onClick={onCancel}
                            variant="text"
                            size="small"
                            sx={{
                                textTransform: "none",
                                fontSize: "12.5px",
                                color: "text.secondary",
                                fontWeight: 600,
                                "&:hover": { color: "error.main" },
                            }}
                        >
                            Cancel • Go back
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
