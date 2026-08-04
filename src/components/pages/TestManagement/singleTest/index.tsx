import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import { ArrowLeft, TickCircle } from "iconsax-reactjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PATH } from "../../../../routes/PATH";
import {
    useGetTestByIdQuery,
    useSubmitMcqMutation,
} from "../../../../services/testApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";

import type {
    Answers,
    McqSubmissionData,
    QuestionProps,
} from "../../../../types/question";

import { getApiErrorMessage } from "../../../../utils/apiError";
import { renderHtml } from "../../../../utils/renderHtml";
import useTestTimer, { type TimerWarning } from "../../../../utils/useTestTimer";

import TestCancelDialog from "../../../organism/Dialog/TestCancelDialog";
import TestResultDialog from "../../../organism/Dialog/TestResultDialog";
import TestSubmissionDialog, {
    type SubmissionType,
} from "../../../organism/Dialog/TestSubmissionDialog";

import WaterMark from "../../../../Watermark";
import { EmptyList } from "../../../molecules/EmptyList";
import TablePagination from "../../../molecules/Pagination";
import TabController from "../../../molecules/TabController";
import TestSample from "../reviewTest/TestSample";
import QuestionListView from "./QuestionListView";
import QuestionView from "./QuestionView";
import TwoMinAudio from "/audios/mcq-2-min-warning.mp3";
import FiveMinAudio from "/audios/mcq-5-min-warning.mp3";

const HeaderSkeleton = () => (
    <div className="animate-pulse space-y-3">
        <div className="h-10 w-40 bg-gray-200 rounded" />
        <div className="h-8 w-3/5 bg-gray-200 rounded" />
    </div>
);

const SidebarSkeleton = () => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
        ))}
    </div>
);

const QuestionSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-6 w-4/5 bg-gray-200 rounded" />
        <div className="h-6 w-full bg-gray-200 rounded" />
        <div className="h-6 w-3/4 bg-gray-200 rounded" />
        <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
        </div>
    </div>
);


export default function SingleTestRoot() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { courseId, testId } = useParams<{
        courseId: string;
        testId: string;
    }>();

    // Rendered by both `/courses/:courseId/test/:testId` and the standalone
    // `/test/:testId` — courseId is absent on the latter, so it must stay
    // undefined rather than becoming NaN.
    const numericCourseId = courseId ? Number(courseId) : undefined;
    const numericTestId = Number(testId);

    const STORAGE_KEY = `mcq_test_progress_${courseId}_${testId}`;
    const RESULT_KEY = `mcq_test_result_${courseId}_${testId}`;

    const [attendedQuestion, setAttendedQuestion] = useState<Answers[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionProps | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [cancelModal, setCancelModal] = useState(false);
    const [submitModal, setSubmitModal] = useState<{
        open: boolean;
        type: SubmissionType;
    }>({ open: false, type: "submit" });

    const [result, setResult] = useState<McqSubmissionData | null>(null);
    const [resultOpen, setResultOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("questions");

    const submittedRef = useRef(false);

    const fiveMinAudioRef = useRef<HTMLAudioElement | null>(null);
    const twoMinAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fiveMinAudioRef.current = new Audio(FiveMinAudio);
        twoMinAudioRef.current = new Audio(TwoMinAudio);
        return () => {
            fiveMinAudioRef.current?.pause();
            twoMinAudioRef.current?.pause();
            fiveMinAudioRef.current = null;
            twoMinAudioRef.current = null;
        };
    }, []);

    const { data, isLoading, isFetching } = useGetTestByIdQuery(
        { courseId: numericCourseId, testId: numericTestId },
        { skip: !numericTestId }
    );

    const [submitMcq, { isLoading: submitting }] = useSubmitMcqMutation();

    const isMCQ = data?.overview?.test_type === "mcq";
    const questions = data?.data ?? [];

    const warnings = useMemo<TimerWarning[]>(() => [
        { atMs: 5 * 60 * 1000, play: () => { void fiveMinAudioRef.current?.play().catch(() => undefined); } },
        { atMs: 2 * 60 * 1000, play: () => { void twoMinAudioRef.current?.play().catch(() => undefined); } },
    ], []);

    // Latest-callback ref so the hook's onExpire always sees the freshest
    // closure (which captures the freshest `attendedQuestion`).
    const onExpireRef = useRef<() => void>(() => undefined);

    const { timeLeft, startedAt, deadline, status, wasAlreadyClosed } = useTestTimer({
        durationMs: isMCQ ? data?.overview?.time : undefined,
        endDatetime: data?.overview?.end_datetime,
        storageKey: STORAGE_KEY,
        onExpire: () => onExpireRef.current(),
        warnings,
    });

    const isExpired = status === "expired";

    // Hydrate progress (answers + index) from localStorage. Timer state is
    // owned by useTestTimer under a separate suffixed key.
    useEffect(() => {
        if (!isMCQ || !data) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const idx = parsed.currentQuestionIndex ?? 0;
                const safeIdx = data.data[idx] ? idx : 0;
                setAttendedQuestion(Array.isArray(parsed.attendedQuestion) ? parsed.attendedQuestion : []);
                setCurrentIndex(safeIdx);
                setCurrentQuestion(data.data[safeIdx] ?? null);
                return;
            } catch {
                // fall through to fresh start
            }
        }
        setCurrentQuestion(data.data[0] ?? null);
    }, [data, isMCQ, STORAGE_KEY]);

    // Persist progress (only when there's something to save — avoids the
    // first-render clobber).
    useEffect(() => {
        if (!isMCQ) return;
        if (attendedQuestion.length === 0 && currentIndex === 0) return;
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ attendedQuestion, currentQuestionIndex: currentIndex }),
            );
        } catch {
            // ignore
        }
    }, [attendedQuestion, currentIndex, isMCQ, STORAGE_KEY]);


    const handleAnswer = (value: Answers) => {
        setAttendedQuestion((prev) => {
            const index = prev.findIndex((v) => v.question_id === value.question_id);
            if (index !== -1) {
                const copy = [...prev];
                copy[index] = value;
                return copy;
            }
            return [...prev, value];
        });
    };

    const handleSubmit = useCallback(async (type: SubmissionType = "submit") => {
        if (!data || submittedRef.current) return;
        submittedRef.current = true;
        try {
            const submittedAt = Date.now();
            const cappedAt = deadline !== undefined ? Math.min(submittedAt, deadline) : submittedAt;
            const timeTaken = startedAt !== undefined ? Math.max(cappedAt - startedAt, 0) : 0;

            const res = await submitMcq({
                courseId: numericCourseId,
                testId: numericTestId,
                body: { answers: attendedQuestion, time_taken: timeTaken },
            }).unwrap();

            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(`${STORAGE_KEY}__timer`);
                localStorage.setItem(RESULT_KEY, JSON.stringify(res.data));
            } catch {
                // ignore
            }

            setResult(res.data);
            // Submission is complete — show the post-submit confirmation
            // dialog ("Already submitted… view summary"). The result dialog
            // opens only after the student clicks View Summary.
            setSubmitModal({ open: true, type });

            dispatch(showToast({
                message: res.message || "Test submitted successfully",
                severity: "success",
            }));
        } catch (e) {
            // Allow retry: clear the in-flight guard so manual / timer-driven
            // resubmits aren't permanently locked out by a transient failure.
            submittedRef.current = false;
            dispatch(showToast({
                message: getApiErrorMessage(e, "Unable to submit test"),
                severity: "error",
            }));
        }
    }, [data, attendedQuestion, startedAt, deadline, numericCourseId, numericTestId, STORAGE_KEY, RESULT_KEY, submitMcq, dispatch]);

    // Wire the timer's expiry to the latest handleSubmit closure.
    useEffect(() => {
        onExpireRef.current = () => {
            void handleSubmit("timer");
        };
    }, [handleSubmit]);

    const handleViewSummary = () => {
        setSubmitModal({ open: false, type: "submit" });
        setResultOpen(true);
    };

    const isReady = !!data && !isLoading && !isFetching;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;

    // Client-side pagination for the read-only branches (ended-MCQ and
    // subjective viewer). Both render at most one of these branches at a
    // time, so sharing the state is fine.
    const [reviewQp, setReviewQp] = useState({ pageIndex: 1, pageSize: 6 });
    const totalReviewPages = Math.max(Math.ceil(questions.length / reviewQp.pageSize), 0);
    const pagedQuestionStart = (reviewQp.pageIndex - 1) * reviewQp.pageSize;
    const pagedQuestions = questions.slice(pagedQuestionStart, pagedQuestionStart + reviewQp.pageSize);

    if (!isReady) {
        return (
            <div className="single__test__wrapper">
                <HeaderSkeleton />
                <Divider className="my-4!" />
                <div className="flex flex-col gap-6 w-full">
                    <SidebarSkeleton />
                    <QuestionSkeleton />
                </div>
            </div>
        );
    }

    if (isMCQ && wasAlreadyClosed) {
        return (
            <div className="single__test__wrapper test__review__root h-full overflow-auto">
                <WaterMark />
                <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
                    Back to Test
                </Button>
                <Divider className="my-4!" />
                <Typography variant="h5" className="mb-2!">{data?.overview?.name}</Typography>
                <Typography variant="body2" color="text.middle" className="mb-4!">
                    This test has already ended.
                </Typography>
                <Divider className="my-4!" />
                {!questions.length ? (
                    <EmptyList title="No Questions Found" description="No Questions added to this test." />
                ) : (
                    <>
                        <Box className="flex flex-col gap-6">
                            {pagedQuestions.map((q, index) => (
                                <div className="question__box" key={q.id ?? pagedQuestionStart + index}>
                                    <Typography className="mb-3!" variant="h6">
                                        {pagedQuestionStart + index + 1}. {renderHtml(q.question)}
                                    </Typography>
                                    <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
                                        {q.options.map((opt) => {
                                            const correct = opt.is_correct;
                                            return (
                                                <Box
                                                    key={opt.id ?? opt.option}
                                                    className="rounded-lg p-3 flex items-center gap-2"
                                                    sx={{
                                                        border: `1px solid ${correct ? theme.palette.success.main : theme.palette.separator.dark}`,
                                                        backgroundColor: correct ? theme.palette.success.light : "transparent",
                                                    }}
                                                >
                                                    {correct && (
                                                        <TickCircle
                                                            variant="Bold"
                                                            color={theme.palette.success.main}
                                                        />
                                                    )}
                                                    <Typography variant="body2">{renderHtml(opt.option)}</Typography>
                                                </Box>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </Box>
                        <TablePagination
                            qp={reviewQp}
                            setQp={setReviewQp}
                            totalPages={totalReviewPages}
                            totalRecords={questions.length}
                        />
                    </>
                )}
            </div>
        );
    }

    if (!isMCQ) {
        return (
            <div className="subject__test_view h-full flex flex-col overflow-hidden">
                <WaterMark />
                <div className="text-left">
                    <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
                        Back to Test
                    </Button>
                </div>

                <Divider className="my-4!" />
                <div className="mb-4">
                    <TabController
                        currentActive={activeTab}
                        setActiveTab={setActiveTab}
                        options={[
                            { label: "Questions", value: "questions" },
                            { label: "Feedback", value: "feedback" },
                        ]}
                    />
                </div>
                {
                    activeTab === "questions" ? !questions.length ? <EmptyList title="No Questions Found" description="No Questions added to this test yet!" /> : (
                        <Box className="h-full overflow-auto flex flex-col">
                            <Box className="flex-1">
                                {pagedQuestions.map((q, index) => (
                                    <Box key={q.id ?? pagedQuestionStart + index} className="flex gap-4 mb-4">
                                        <Typography>{pagedQuestionStart + index + 1}.</Typography>
                                        <Typography variant="h6">
                                            {renderHtml(q.question)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            <TablePagination
                                qp={reviewQp}
                                setQp={setReviewQp}
                                totalPages={totalReviewPages}
                                totalRecords={questions.length}
                            />
                        </Box>
                    ) : ""
                }
                {activeTab === "feedback" ? <TestSample id={Number(testId)} /> : ""}
            </div>
        );
    }

    return (
        <div className="single__test__wrapper overflow-auto">
            <Button startIcon={<ArrowLeft />} onClick={() => setCancelModal(true)}>
                Back to Test
            </Button>

            <Divider className="my-4!" />

            <QuestionListView
                timeLeft={timeLeft}
                initialTime={data?.overview?.time}
                questions={questions}
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentIndex}
                totalQuestions={questions.length}
                setCurrentQuestion={setCurrentQuestion}
                setCurrentQuestionIndex={setCurrentIndex}
                attendedQuestion={attendedQuestion}
            />

            <QuestionView
                currentQuestion={currentQuestion}
                attendedQuestion={attendedQuestion}
                setAttendedQuestion={handleAnswer}
                disabled={isExpired}
            />

            <div className="flex justify-between my-6">
                <Button
                    disabled={isFirst}
                    onClick={() => {
                        const next = currentIndex - 1;
                        setCurrentIndex(next);
                        setCurrentQuestion(questions[next]);
                    }}
                >
                    Previous
                </Button>

                <Button
                    variant="contained"
                    onClick={() => {
                        if (isLast) {
                            void handleSubmit("submit");
                        } else {
                            const next = currentIndex + 1;
                            setCurrentIndex(next);
                            setCurrentQuestion(questions[next]);
                        }
                    }}
                    disabled={submitting || resultOpen || submitModal.open}
                >
                    {isLast ? (submitting ? "Submitting..." : "Submit") : "Next"}
                </Button>
            </div>

            <TestSubmissionDialog
                open={submitModal.open}
                handleClose={() => setSubmitModal({ open: false, type: "submit" })}
                onSubmit={handleViewSummary}
                type={submitModal.type}
                loading={false}
            />

            <TestCancelDialog
                open={cancelModal}
                handleClose={() => setCancelModal(false)}
                onSubmit={() => navigate(PATH.TEST.ROOT)}
            />

            <TestResultDialog
                open={resultOpen}
                result={result}
                onReview={() => {
                    try { localStorage.removeItem(RESULT_KEY); } catch { /* ignore */ }
                    navigate(
                        numericCourseId
                            ? PATH.COURSE_MANAGEMENT.COURSES.VIEW_TEST.REVIEW_TEST.ROOT({
                                courseId: numericCourseId,
                                testId: numericTestId,
                            })
                            : PATH.TEST.VIEW_TEST.REVIEW_TEST.ROOT({ testId: numericTestId }),
                        { replace: true }
                    );
                }}
                onBack={() => {
                    try { localStorage.removeItem(RESULT_KEY); } catch { /* ignore */ }
                    navigate(
                        numericCourseId
                            ? PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(numericCourseId)
                            : PATH.TEST.ROOT,
                        { replace: true }
                    );
                }}
            />
        </div>
    );
}
