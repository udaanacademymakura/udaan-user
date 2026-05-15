
import { Box, Divider, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { Book1, Calendar, Calendar1, Clock, Timer, Timer1, UserEdit, UserTag } from "iconsax-reactjs";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTestResultQuery, useReviewSubjectiveTestResultQuery } from "../../../../../services/testApi";
import { formatDateCustom, formatDateTime } from "../../../../../utils/dateFormat";
import { renderHtml } from "../../../../../utils/renderHtml";
import { EmptyList } from "../../../../molecules/EmptyList";
import TestResultSummary from "../../../../organism/ResultScreen";
import TestSample from "../TestSample";
export default function ReviewSubjectTestRoot() {
    const theme = useTheme();
    const { courseId, testId } = useParams();
    const [tabIndex, setTabIndex] = useState(0);
    const { data } = useReviewSubjectiveTestResultQuery({ courseId: Number(courseId), testId: Number(testId) });
    const handleTabChange = (_: any, newValue: number) => setTabIndex(newValue);

    const items = [
        { icon: Book1, label: "Total Questions:", value: `${data?.data?.total_questions} Questions` },
        { icon: Timer1, label: "Timer:", value: data?.data?.timer },
        { icon: Calendar1, label: "Start Date:", value: formatDateCustom(data?.data?.start_date || "", { shortMonth: true }) },
        { icon: Clock, label: "Start Time:", value: formatDateTime(data?.data?.start_time) },
        { icon: Clock, label: "End Time:", value: formatDateTime(data?.data?.end_time) },
    ];


    const DetailItem = ({
        icon: Icon,
        label,
        value,
        colSpan = 1,
        bgColor
    }: {
        icon: React.ReactElement;
        label: string;
        value: string | null | undefined;
        colSpan?: number;
        bgColor?: string;

    }) => {
        if (!value) return null;

        return (
            <Box
                className={`col-span-${colSpan} flex gap-4 py-4 px-6 rounded-md`}
                sx={{
                    border: (theme) => `1px solid ${theme.palette.separator.dark}`
                }}
            >
                <Box
                    className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
                    sx={{
                        background: (theme) => bgColor || theme.palette.primary.light
                    }}
                >
                    {Icon}
                </Box>
                <Box>
                    <Typography variant='subtitle2' color='text.middle' className='mb-1.5!'>
                        {label}
                    </Typography>
                    <Typography variant='subtitle1'>{renderHtml(value)}</Typography>
                </Box>
            </Box>
        );
    };
    const renderQuestions = (questions: any[], type: "answered" | "skipped") => {
        if (questions.length === 0) {
            return <EmptyList
                title={`No Question Found in ${type}`}
                description=""
            />;
        }
        return questions.map((q) => (
            <div className="question__box" key={q.question}>
                <Typography className="mb-4! px-4 py-6 rounded-md" variant="h6" sx={{
                    border: (theme) => `1px solid ${theme.palette.separator.dark}`
                }}>{renderHtml(q.question)}</Typography>
                {type === "answered" ? <Box
                    className="answer__wrapper py-2 px-3 rounded-lg"
                    sx={{
                        border: (theme) => `1px solid ${theme.palette.separator.dark}`
                    }}
                >
                    {q?.media_files?.length ? (
                        <>
                            <Typography variant='caption' color='text.middle' className='mt-4! block'>
                                Answer Image
                            </Typography>
                            <Box className="answer__image mt-2 mb-6">
                                <div className="grid grid-cols-3 gap-4">
                                    {q.media_files.map((file: any) => (
                                        <div className="col-span-1" key={file.id}>
                                            <img
                                                src={file.url}
                                                alt="Answer submission"
                                                className='rounded-sm w-full h-full object-cover'
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Box>
                        </>
                    ) : ""}

                    <Typography variant='caption' color='text.middle' >
                        Answer Details
                    </Typography>

                    <Box className="flex flex-col md:grid md:grid-cols-2 gap-y-4 gap-x-8 mt-4">
                        <DetailItem
                            icon={<Calendar color={theme.palette.primary.main} />}
                            label="Submitted at:"
                            value={formatDateTime(q?.submitted_at)}
                            bgColor={theme.palette.primary.light}
                        />

                        <DetailItem
                            icon={<Calendar color={theme.palette.success.main} />}
                            label="Marks Obtained:"
                            value={q?.mark_obtained?.toString()}
                            bgColor={theme.palette.success.light}

                        />

                        <DetailItem
                            icon={<UserEdit color={theme.palette.warning.main} />}
                            label="Checked by:"
                            value={q?.checked_by}
                            bgColor={theme.palette.warning.light}

                        />

                        <DetailItem
                            icon={<Timer color={theme.palette.info.main} />}
                            label="Checked at:"
                            value={formatDateTime(q?.checked_at)}
                            bgColor={theme.palette.info.light}

                        />

                        <DetailItem
                            icon={<UserTag color={theme.palette.primary.main} />}
                            label="Teacher's Feedback"
                            value={q?.feedback}
                            colSpan={2}
                            bgColor={theme.palette.primary.light}

                        />
                    </Box>
                </Box> : ""}
            </div>
        ));
    };

    const { data: result } = useGetTestResultQuery({ courseId: Number(courseId), testId: Number(testId) });


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
                        <Tab label={`Answered (${data?.data?.answered?.length || 0})`} />
                        <Tab label={`Skipped (${data?.data?.skipped?.length || 0})`} />
                        <Tab label={`Feedback`} />
                    </Tabs>

                    <Box className="mt-4 space-y-4 overflow-auto h-full">
                        {tabIndex === 0 && renderQuestions(data?.data?.answered || [], "answered")}
                        {tabIndex === 1 && renderQuestions(data?.data?.skipped || [], "skipped")}
                        {tabIndex === 2 && <TestSample id={testId ? Number(testId) : null} />}
                    </Box>
                </div>
                <div className="col-span-5 2xl:col-span-4">
                    <TestResultSummary
                        testName={data?.data?.test_name}
                        test_type={result?.data?.test_type || "subjective"}
                        score={result?.data?.score || 0}
                        full_mark={result?.data?.full_mark || 0}
                        status={result?.data?.status}
                        percentage={result?.data?.percentage || 0}
                        time_taken={result?.data?.time_taken || ""}
                        total_questions={result?.data?.total_questions || 0}
                        attempted={result?.data?.attempted || 0}
                        skipped={result?.data?.skipped || 0}
                    />
                </div>
            </div>

        </div>
    );
}