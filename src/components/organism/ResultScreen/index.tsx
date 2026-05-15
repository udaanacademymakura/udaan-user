import { Box, Typography, useTheme } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import type { McqSubmissionData } from "../../../types/question";



interface Props extends Partial<McqSubmissionData> {
    testName?: string;
};

export default function TestResultSummary({
    testName,
    percentage = 0,
    score = 0,
    correct = 0,
    incorrect = 0,
    time_taken = "",
    attempted = 0,
    total_questions = 0,
    test_type,
    full_mark = 0,
    status,

}: Props) {
    const theme = useTheme();
    const isSubjective = test_type === "subjective";
    const getScoreMessage = (score: number) => {
        if (Number(score) < 40) {
            return "Don't be discouraged — every expert was once a beginner. Review your mistakes and try again!";
        }
        if (Number(score) < 60) {
            return "You're improving! With a little more practice, you'll achieve even better results.";
        }
        if (Number(score) < 80) {
            return "Good job! You're getting close to mastery. Keep pushing forward!";
        }
        return "Congratulations on your excellent score! Your dedication and hard work are truly paying off.";
    };

    const scoreMessage = getScoreMessage(isSubjective ? Number(percentage) : Number(score));

    const statusLabel = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "";
    const statusColor = status === "pass" ? theme.palette.success : theme.palette.error;

    const stats = isSubjective
        ? [
            {
                label: "Attempted",
                value: `${attempted}/${total_questions}`,
                color: theme.palette.primary,
            },
            {
                label: "Marks Obtained",
                value: `${score}/${full_mark}`,
                color: theme.palette.success,
            },
            {
                label: "Status",
                value: statusLabel,
                color: statusColor,
            },
            {
                label: "Time Taken",
                value: time_taken || "",
                color: theme.palette.warning,
            },
        ]
        : [
            {
                label: "Correct answers",
                value: `${correct}/${total_questions}`,
                color: theme.palette.success,
            },
            {
                label: "Incorrect answers",
                value:
                    `${incorrect}/${total_questions}`,
                color: theme.palette.error,
            },
            {
                label: "Total Time Taken",
                value: time_taken || "",
                color: theme.palette.warning,
            },
            {
                label: "Questions Attempted",
                value: `${attempted}/${total_questions}`,
                color: theme.palette.primary,
            },
        ];

    const chartOptions: any = {
        chart: {
            type: "radialBar",
            sparkline: { enabled: true }
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 225,
                hollow: { size: "60%" },
                track: {
                    background: theme.palette.grey[200],
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        fontSize: "26px",
                        fontWeight: 700,
                        offsetY: 6,
                        color: theme.palette.primary.main,
                        formatter: () => `${percentage}%`
                    }
                }
            }
        },
        colors: [theme.palette.primary.main],
    };

    return (
        <Box
            className="lg:py-14 px-8 rounded-lg"
            sx={{ border: `1px solid ${theme.palette.separator.dark}` }}
        >
            {/* Points / Full mark (subjective) or Chart (mcq) */}
            {isSubjective ? (
                <div className="flex items-baseline justify-center gap-1 mb-2 mt-2">
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '4rem',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            color: theme.palette.primary.main,
                        }}
                    >
                        {score}
                    </Typography>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '1.75rem',
                            fontWeight: 600,
                            color: theme.palette.text.middle,
                        }}
                    >
                        / {full_mark}
                    </Typography>
                </div>
            ) : (
                <div className="w-40 mb-2 mx-auto">
                    <ReactApexChart
                        type="radialBar"
                        series={[percentage]}
                        options={chartOptions}
                        height={180}
                    />
                </div>
            )}

            {/* Title & Message */}
            <div className="text-center">
                {testName && (
                    <Typography variant="h4" fontWeight={600} className="mt-2">
                        {testName}
                    </Typography>
                )}

                {scoreMessage && (
                    <Typography
                        className="mt-2 mb-4 px-4"
                        color="text.middle"
                        variant="subtitle1"
                    >
                        {scoreMessage}
                    </Typography>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8!">
                {stats
                    .map((stat) => (
                        <Box
                            key={stat.label}
                            className="rounded-xl p-4"
                            sx={{
                                border: `1px solid ${stat.color.main}`,
                                background: stat.color.light,
                            }}
                        >
                            <Typography color={stat.color.main} variant="subtitle2">
                                {stat.label}
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                color={stat.color.main}
                            >
                                {stat.value || "N/A"}
                            </Typography>
                        </Box>
                    ))}
            </div>
        </Box>
    );
}
