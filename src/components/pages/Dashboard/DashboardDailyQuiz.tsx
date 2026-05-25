import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
    Box,
    Chip,
    Skeleton,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import {
    useGetDailyQuizQuery,
    useSubmitDailyQuizAnswerMutation,
} from "../../../services/dashboardApi";
import type { DailyQuizOption } from "../../../types/dashboard";
import { renderHtml } from "../../../utils/renderHtml";

// ─── Option button ────────────────────────────────────────────────────────────
function QuizOption({
    option,
    answered,
    selectedId,
    onSelect,
}: {
    option: DailyQuizOption;
    answered: boolean;
    selectedId: number | null;
    onSelect: (o: DailyQuizOption) => void;
}) {
    const theme = useTheme();

    let bg = "rgba(255,255,255,0.08)";
    let border = "1px solid rgba(255,255,255,0.18)";
    let color = "rgba(255,255,255,0.88)";
    let fontWeight = 500;
    let cursor = "pointer";

    if (answered) {
        cursor = "default";
        if (option.is_correct) {
            bg = theme.palette.success.light;
            border = `1.5px solid ${theme.palette.success.main}`;
            color = theme.palette.success.main;
            fontWeight = 700;
        } else if (option.id === selectedId) {
            bg = theme.palette.error.light;
            border = `1.5px solid ${theme.palette.error.main}`;
            color = theme.palette.error.main;
            fontWeight = 600;
        } else {
            bg = "rgba(255,255,255,0.04)";
            color = "rgba(255,255,255,0.35)";
            border = "1px solid rgba(255,255,255,0.08)";
        }
    }

    return (
        <Box
            component="button"
            onClick={() => !answered && onSelect(option)}
            sx={{
                width: "100%",
                textAlign: "left",
                fontFamily: theme.typography.fontFamily,
                fontSize: "13px",
                fontWeight,
                px: 1.75,
                py: 1,
                border,
                borderRadius: 1.5,
                color,
                bgcolor: bg,
                cursor,
                transition: "all 0.18s",
                outline: "none",
                "&:hover": !answered
                    ? {
                        bgcolor: "rgba(255,255,255,0.15)",
                        borderColor: "rgba(255,255,255,0.38)",
                    }
                    : {},
            }}
        >
            {renderHtml(option.option)}
        </Box>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
    icon,
    iconBg,
    valueColor,
    value,
    label,
}: {
    icon: React.ReactNode;
    iconBg: string;
    valueColor: string;
    value: string | number;
    label: string;
}) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: "13px 14px",
                display: "flex",
                alignItems: "center",
                gap: "11px",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    bgcolor: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: valueColor,
                    fontSize: "20px",
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography
                    fontWeight={800}
                    sx={{ fontSize: "18px", lineHeight: 1, color: valueColor }}
                >
                    {value}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: "2px", display: "block" }}
                >
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function DailyQuizSkeleton() {
    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                }}
            >
                <Skeleton variant="text" width={90} height={24} />
                <Skeleton variant="rounded" width={110} height={22} sx={{ borderRadius: "99px" }} />
            </Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    mb: 1.5,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rounded" height={66} sx={{ borderRadius: 2 }} />
                ))}
            </Box>
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
        </Box>
    );
}

export default function DashboardDailyQuiz() {
    const theme = useTheme();

    const { data, isLoading, isError } = useGetDailyQuizQuery();
    const [submitAnswer] = useSubmitDailyQuizAnswerMutation();

    const [localSelectedId, setLocalSelectedId] = useState<number | null>(null);

    const quiz = data?.data?.quiz ?? null;
    const stats = data?.data?.stats ?? null;

    const answered = stats?.answered_today ?? false;
    const selectedId = stats?.selected_option_id ?? localSelectedId;

    const handleSelect = async (option: DailyQuizOption) => {
        if (answered || !quiz) return;
        setLocalSelectedId(option.id);
        await submitAnswer({ quiz_id: quiz.id, option_id: option.id });
    };

    if (isLoading) return <DailyQuizSkeleton />;

    if (isError || !quiz || !stats) return null;

    const todayLabel = answered ? "Done" : "—";
    const streakLabel = `${stats.streak}`;
    const bestStreakLabel = stats.best_streak > 0 ? `${stats.best_streak}×` : "0×";

    const navyMid = "#2D3F6F";

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                }}
            >
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ fontSize: "14.5px" }}
                >
                    Daily Quiz
                </Typography>
                <Chip
                    label="Today's Challenge"
                    size="small"
                    sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        height: 22,
                        bgcolor: theme.palette.info.light,
                        color: theme.palette.info.main,
                        border: `1px solid ${theme.palette.info.main}`,
                        borderRadius: "99px",
                    }}
                />
            </Box>

            <Box
                className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4 mb-4"
                sx={{
                    gap: "10px",
                    mb: 1.5,
                }}
            >
                <StatCard
                    icon={<LocalFireDepartmentIcon fontSize="small" />}
                    iconBg={theme.palette.info.light}
                    valueColor={theme.palette.info.main}
                    value={streakLabel}
                    label="Day Streak"
                />
                <StatCard
                    icon={<TaskAltIcon fontSize="small" />}
                    iconBg={theme.palette.success.light}
                    valueColor={theme.palette.success.main}
                    value={todayLabel}
                    label="Today's Quiz"
                />
                <StatCard
                    icon={<EmojiEventsOutlinedIcon fontSize="small" />}
                    iconBg={theme.palette.primary.light}
                    valueColor={theme.palette.primary.main}
                    value={bestStreakLabel}
                    label="Best Streak"
                />
            </Box>

            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 60%, ${navyMid} 100%)`,
                    borderRadius: 2,
                    p: 2.5,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "-40px",
                        right: "-40px",
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)",
                        pointerEvents: "none",
                    },
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-28px",
                        left: "38%",
                        width: "110px",
                        height: "110px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.03)",
                        pointerEvents: "none",
                    },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "rgba(255,255,255,0.55)",
                        fontWeight: 700,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        display: "block",
                        mb: 1,
                    }}
                >
                    Daily Quiz · {quiz.category}
                </Typography>

                {/* Question */}
                <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ color: "#fff", lineHeight: 1.55, mb: 2 }}
                >
                    {renderHtml(quiz.question)}
                </Typography>
                {/* quiz.question */}
                {/* Options */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        mb: 2,
                    }}
                >
                    {quiz.options.map((option) => (
                        <QuizOption
                            key={option.id}
                            option={option}
                            answered={answered}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />
                    ))}
                </Box>

                {/* Bottom row: result message or streak */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {answered ? (
                        <Typography
                            variant="caption"
                            sx={{ color: "rgba(255,255,255,0.65)" }}
                        >
                            {selectedId !== null &&
                                quiz.options.find((o) => o.id === selectedId)
                                    ?.is_correct
                                ? "🎉 Correct! Come back tomorrow."
                                : "Nice try! Come back tomorrow for the next one."}
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                            }}
                        >
                            <LocalFireDepartmentIcon
                                sx={{
                                    fontSize: 15,
                                    color: theme.palette.warning.light,
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255,255,255,0.7)",
                                    fontWeight: 600,
                                }}
                            >
                                {stats.streak}-day streak
                            </Typography>
                        </Box>
                    )}

                    {/* Skip button — commented out for now */}
                    {/* {!answered && (
                        <Button
                            size="small"
                            onClick={() => {}}
                            sx={{
                                color: "rgba(255,255,255,0.45)",
                                fontSize: "12px",
                                fontWeight: 500,
                                minWidth: 0,
                                p: 0,
                                "&:hover": { color: "rgba(255,255,255,0.8)", bgcolor: "transparent" },
                            }}
                            disableRipple
                        >
                            Skip →
                        </Button>
                    )} */}
                </Box>
            </Box>
        </Box>
    );
}
