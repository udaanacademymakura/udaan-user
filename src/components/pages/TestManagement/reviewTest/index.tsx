import { Box, Divider, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { Book1, Calendar1, Clock, CloseCircle, TickCircle, Timer1 } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTestResultQuery, useReviewTestResultQuery } from "../../../../services/testApi";
import { formatDateCustom, formatDateTime } from "../../../../utils/dateFormat";
import { renderHtml } from "../../../../utils/renderHtml";
import { EmptyList } from "../../../molecules/EmptyList";
import TestResultSummary from "../../../organism/ResultScreen";

export default function ReviewTestRoot() {
    const theme = useTheme();
    const { courseId, testId } = useParams();
    const numericCourseId = courseId ? Number(courseId) : undefined;
    const numericTestId = Number(testId);
    const skip = !Number.isFinite(numericTestId);
    const { data, isLoading } = useReviewTestResultQuery(
        { courseId: numericCourseId, testId: numericTestId },
        { skip }
    );
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (_: any, newValue: number) => setTabIndex(newValue);

    useEffect(() => {
        const RESULT_KEY = `mcq_test_result_${courseId}_${testId}`;
        const STORAGE_KEY = `mcq_test_progress_${courseId}_${testId}`;
        localStorage.removeItem(RESULT_KEY);
        localStorage.removeItem(STORAGE_KEY);
    }, [courseId, testId]);

    const items = [
        { icon: Book1, label: "Total Questions:", value: `${data?.data?.total_questions} Questions` },
        { icon: Timer1, label: "Timer:", value: data?.data?.timer },
        { icon: Calendar1, label: "Start Date:", value: formatDateCustom(data?.data?.start_date || "", { shortMonth: true }) },
        { icon: Clock, label: "Start Time:", value: formatDateTime(data?.data?.start_time) },
        { icon: Clock, label: "End Time:", value: formatDateTime(data?.data?.end_time) },
    ];

    const renderOption = (option: any, isCorrect: boolean, isUserWrong?: boolean) => {
        const bgColor = isCorrect
            ? theme.palette.success.light
            : isUserWrong
                ? theme.palette.error.light
                : "transparent";

        const borderColor = isCorrect
            ? theme.palette.success.main
            : isUserWrong
                ? theme.palette.error.main
                : theme.palette.separator.dark;

        const Icon = isCorrect ? TickCircle : isUserWrong ? CloseCircle : undefined;

        return (
            <Box
                key={option.option + option.id}
                className="rounded-lg p-3 col-span-1 flex items-center gap-1"
                sx={{ border: `1px solid ${borderColor}`, backgroundColor: bgColor }}
            >
                {Icon && <Icon variant="Bold" color={isCorrect ? theme.palette.success.main : theme.palette.error.main} />}
                <Typography variant="body2">{renderHtml(option.option)}</Typography>
            </Box>
        );
    };

    const renderQuestions = (questions: any[], type: "correct" | "incorrect" | "skipped") => {
        if (!isLoading && questions.length === 0) {
            return <EmptyList
                title={`No Question Found in ${type}`}
                description=""
            />;
        }
        return questions.map((q) => (
            <div className="question__box" key={q.question}>
                <Typography className="mb-4!" variant="h6">{renderHtml(q.question)}</Typography>
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
                    {q.options.map((option: any) => {
                        if (type === "correct") {
                            return option.is_correct ? renderOption(option, true) : null;
                        } else if (type === "incorrect") {
                            return renderOption(option, option.is_correct, option.id === q.your_answer_id);
                        } else if (type === "skipped") {
                            return renderOption(option, option.is_correct);
                        }
                        return null;
                    })}
                </div>
            </div>
        ));
    };

    const { data: result } = useGetTestResultQuery(
        { courseId: numericCourseId, testId: numericTestId },
        { skip }
    );

    return (
        <div className="test__review__root h-full overflow-auto">
            <Typography className="text2Xl mb-4!">{data?.data?.test_name}</Typography>

            <ul className="flex flex-wrap items-center gap-4">
                {items
                    .filter(item => item.value !== null && item.value !== undefined && item.value !== "")
                    .map((item, index, filteredItems) => {
                        const Icon = item.icon;

                        return (
                            <li
                                key={index}
                                className="flex items-center gap-1 pr-4"
                                style={{
                                    borderRight:
                                        index !== filteredItems.length - 1
                                            ? `1px solid ${theme.palette.separator.dark}`
                                            : "none",
                                }}
                            >
                                <Icon variant="Linear" />
                                <Typography variant="subtitle2" color="text.middle">
                                    {item.label}
                                </Typography>
                                <Typography variant="subtitle2" color="text.dark">
                                    {item.value}
                                </Typography>
                            </li>
                        );
                    })}
            </ul>


            <Divider className="mt-2! mb-6!" />

            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-6">
                <div className="col-span-7 2xl:col-span-8">
                    {/* Tabs */}
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="answer categories">
                        <Tab label={`Correct (${data?.data?.correct_answers?.length || 0})`} />
                        <Tab label={`Incorrect (${data?.data?.incorrect_answers?.length || 0})`} />
                        <Tab label={`Skipped (${data?.data?.skipped_answers?.length || 0})`} />
                    </Tabs>

                    <Box className="mt-4 space-y-4">
                        {tabIndex === 0 && renderQuestions(data?.data?.correct_answers || [], "correct")}
                        {tabIndex === 1 && renderQuestions(data?.data?.incorrect_answers || [], "incorrect")}
                        {tabIndex === 2 && renderQuestions(data?.data?.skipped_answers || [], "skipped")}
                    </Box></div>
                <div className="col-span-5 2xl:col-span-4">
                    <TestResultSummary
                        testName={data?.data?.test_name}
                        correct={result?.data?.correct || 0}
                        percentage={result?.data?.percentage || 0}
                        incorrect={result?.data?.incorrect || 0}
                        time_taken={result?.data?.time_taken || ""}
                        total_questions={result?.data?.total_questions || 0}
                    />
                </div>
            </div>
        </div>
    );
}
