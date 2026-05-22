import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import { ArrowLeft, Timer1 } from "iconsax-reactjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useDeleteSubjectiveAnswersMutation, useGetSubjectiveAnswerQuery, useGetTestByIdQuery, useSubmitSubjectiveFinalMutation, useUploadSubjectiveAnswersMutation } from "../../../../services/testApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { QuestionProps } from "../../../../types/question";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { renderHtml } from "../../../../utils/renderHtml";
import useTestTimer, { type TimerWarning } from "../../../../utils/useTestTimer";
import FileDragDrop from "../../../molecules/FileDragDrop";
import TestCancelDialog from "../../../organism/Dialog/TestCancelDialog";
import type { SubmissionType } from "../../../organism/Dialog/TestSubmissionDialog";
import TestSubmissionDialog from "../../../organism/Dialog/TestSubmissionDialog";
import TwoMinAudio from "/audios/subjective-2-min-warning.mp3";
import FiveMinAudio from "/audios/subjective-5-min-warning.mp3";

export default function SingleSubjectiveTest() {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { courseId, testId } = useParams();

    const [modal, setModal] = useState({ open: false, type: "back" });
    const [currentQuestion, setCurrentQuestion] = useState<QuestionProps | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitModal, setSubmitModal] = useState({ open: false, type: "timer" });

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

    const storageKey = `test_${courseId}_${testId}`;

    const { data } = useGetTestByIdQuery(
        { courseId: Number(courseId), testId: Number(testId) },
        { skip: !testId }
    );

    const { data: subjectiveAnswer, refetch: refetchAnswer } = useGetSubjectiveAnswerQuery(
        {
            courseId: Number(courseId),
            testId: Number(testId),
            questionId: Number(currentQuestion?.id),
        },
        { skip: !currentQuestion?.id }
    );

    const [uploadMedia, { isLoading: uploading }] = useUploadSubjectiveAnswersMutation();
    const [deleteMedia, { isLoading: deleting }] = useDeleteSubjectiveAnswersMutation();
    const [submitSubjective, { isLoading: submitting }] = useSubmitSubjectiveFinalMutation();

    const warnings = useMemo<TimerWarning[]>(() => [
        { atMs: 5 * 60 * 1000, play: () => { void fiveMinAudioRef.current?.play().catch(() => undefined); } },
        { atMs: 2 * 60 * 1000, play: () => { void twoMinAudioRef.current?.play().catch(() => undefined); } },
    ], []);

    const onExpireRef = useRef<() => void>(() => undefined);

    const { timeLeft, startedAt, deadline, wasAlreadyClosed } = useTestTimer({
        durationMs: data?.overview?.time,
        endDatetime: data?.overview?.end_datetime,
        storageKey,
        onExpire: () => onExpireRef.current(),
        warnings,
    });

    // Hydrate progress (currentQuestionIndex) from localStorage and pick the
    // first question, clamping the index if the test was edited and now has
    // fewer questions.
    useEffect(() => {
        if (!data?.data?.length) return;
        let savedIndex = 0;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.currentQuestionIndex === "number") {
                    savedIndex = parsed.currentQuestionIndex;
                }
            }
        } catch {
            // ignore
        }
        const safeIndex = data.data[savedIndex] ? savedIndex : 0;
        setCurrentQuestionIndex(safeIndex);
        setCurrentQuestion(data.data[safeIndex] ?? null);
    }, [data, storageKey]);

    // Persist progress. Only writes once there is something to save so we
    // don't clobber state on the first render of a fresh mount.
    useEffect(() => {
        if (!data?.data?.length) return;
        if (currentQuestionIndex === 0) return;
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({ currentQuestionIndex }),
            );
        } catch {
            // ignore
        }
    }, [currentQuestionIndex, data, storageKey]);

    // Redirect students who opened the page after the test window had already
    // closed.
    useEffect(() => {
        if (!wasAlreadyClosed) return;
        dispatch(showToast({ message: "This test has already ended.", severity: "error" }));
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}__timer`);
        } catch {
            // ignore
        }
        navigate(PATH.TEST.ROOT);
    }, [wasAlreadyClosed, dispatch, navigate, storageKey]);

    const handlePreviousQuestion = () => {
        if (data?.data && currentQuestionIndex > 0) {
            const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            setCurrentQuestion(data.data[newIndex]);
        }
    };

    const handleNextQuestion = () => {
        if (data?.data && currentQuestionIndex < data.data.length - 1) {
            const newIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(newIndex);
            setCurrentQuestion(data.data[newIndex]);
        }
    };

    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === (data?.data?.length || 0) - 1;

    const handleCloseModal = () => setModal({ open: false, type: "timer" });
    const handleCloseSubmitModal = () => setSubmitModal({ open: false, type: "timer" });

    const handleFileUpload = async (files: File[]) => {
        if (!files.length || !currentQuestion) return;

        try {
            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append(`answer_image[${index}]`, file);
            });

            const response = await uploadMedia({
                courseId: Number(courseId),
                testId: Number(testId),
                questionId: Number(currentQuestion.id),
                body: formData,
            }).unwrap();

            refetchAnswer();

            dispatch(
                showToast({
                    message: response?.message || "Files uploaded successfully",
                    severity: "success",
                })
            );
        } catch (e) {
            dispatch(
                showToast({
                    message: getApiErrorMessage(e, "Unable to upload files."),
                    severity: "error",
                })
            );
        }
    };

    const handleFileRemoval = async (id: number) => {
        if (!currentQuestion) return;
        try {
            const response = await deleteMedia({
                courseId: Number(courseId),
                testId: Number(testId),
                questionId: Number(currentQuestion.id),
                mediaId: id,
            }).unwrap();

            refetchAnswer();

            dispatch(
                showToast({
                    message: response?.message || "Files removed successfully",
                    severity: "success",
                })
            );
        } catch (e) {
            dispatch(
                showToast({
                    message: getApiErrorMessage(e, "Unable to remove files."),
                    severity: "error",
                })
            );
        }
    };

    const handleSubmitSubjective = useCallback(async (showSummary = false) => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        try {
            const submittedAt = Date.now();
            const cappedAt = deadline !== undefined ? Math.min(submittedAt, deadline) : submittedAt;
            const timeTaken = startedAt !== undefined ? Math.max(cappedAt - startedAt, 0) : 0;

            const response = await submitSubjective({
                courseId: Number(courseId),
                testId: Number(testId),
                questionId: Number(currentQuestion?.id),
                time_taken: timeTaken,
            }).unwrap();
            dispatch(
                showToast({
                    message: response.message || "Test Submitted Successfully.",
                    severity: "success",
                })
            );
            try {
                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}__timer`);
            } catch {
                // ignore
            }
            if (showSummary) {
                setSubmitModal({ open: true, type: "submit" });
            } else {
                navigate(PATH.TEST.ROOT, { replace: true });
            }
        } catch (e) {
            submittedRef.current = false;
            dispatch(
                showToast({
                    message: getApiErrorMessage(e, "Unable to submit test."),
                    severity: "error",
                })
            );
        }
    }, [courseId, testId, currentQuestion?.id, startedAt, deadline, submitSubjective, dispatch, navigate, storageKey]);

    useEffect(() => {
        onExpireRef.current = () => {
            void handleSubmitSubjective(false);
        };
    }, [handleSubmitSubjective]);

    // The summary dialog only opens once the test is already submitted, so
    // this just dismisses it and routes the user onward.
    const handleViewSummary = () => {
        setSubmitModal({ open: false, type: "submit" });
        navigate(PATH.TEST.ROOT, { replace: true });
    };

    const formatTime = (ms: number | undefined) => {
        if (ms === undefined) return "--:--";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const timerColors = useMemo(() => {
        const fiveMinutesInMs = 5 * 60 * 1000;

        if (timeLeft !== undefined && timeLeft <= fiveMinutesInMs) {
            return {
                bg: "rgba(255, 200, 200, 0.2)",
                border: "rgb(255, 80, 80)",
                color: "rgb(255, 50, 50)",
            };
        }

        return {
            bg: theme.palette.success.light,
            border: theme.palette.success.main,
            color: theme.palette.success.main,
        };
    }, [timeLeft, theme.palette.success.light, theme.palette.success.main]);

    const currentQuestionFiles = useMemo(() => {
        return subjectiveAnswer?.data || [];
    }, [subjectiveAnswer?.data]);

    return (
        <div className="single__subject__test__root h-full overflow-auto">
            <div className="test__header flex items-center justify-between">
                <div className="title">
                    <Button
                        variant="text"
                        startIcon={<ArrowLeft />}
                        sx={{
                            color: theme.palette.text.middle,
                        }}
                        onClick={() => setModal((prev) => ({ ...prev, open: true }))}
                    >
                        <Typography color="text.middle" variant="subtitle1">
                            Back to Test
                        </Typography>
                    </Button>
                    <Typography variant="h4" className="block mt-4! font-medium">
                        {data?.overview?.name}
                    </Typography>
                </div>
            </div>
            <Divider className="mt-2! mb-6!" />

            <Box className="flex justify-between items-center">
                <Typography
                    color="text.dark"
                    variant="subtitle1"
                    sx={{
                        position: "relative",
                        display: "inline-block",
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: "-2px",
                            height: "2px",
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                    fontWeight={600}
                >
                    Question {currentQuestionIndex + 1} of {data?.data?.length}
                </Typography>

                {timeLeft !== undefined && (
                    <Typography
                        className="py-1.5 px-3 rounded-2xl flex gap-1 items-center"
                        sx={{
                            background: timerColors.bg,
                            color: timerColors.color,
                            border: `1px solid ${timerColors.border}`,
                            fontWeight: 600,
                            transition: "all 0.4s ease",
                        }}
                    >
                        <Timer1 variant="Bold" />
                        {formatTime(timeLeft)} mins
                    </Typography>
                )}
            </Box>
            <div className="question__view mt-5.5">
                <div className="question flex flex-col gap-3">
                    <Typography
                        variant="subtitle2"
                        sx={{
                            background: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                        }}
                        className="py-1.5 px-4.5 rounded-4xl font-bold max-w-fit"
                    >
                        Question:
                    </Typography>
                    <Typography className={currentQuestion?.has_image_in_option ? "max-w-[50%]" : ""}>
                        {renderHtml(currentQuestion?.question || "")}
                    </Typography>
                </div>
                <Divider className="my-4!" />
                <Typography
                    variant="subtitle2"
                    sx={{
                        background: theme.palette.success.light,
                        color: theme.palette.success.main,
                    }}
                    className="py-1.5 px-4.5 rounded-4xl font-bold max-w-fit mb-3! block"
                >
                    Answers:
                </Typography>
                <FileDragDrop
                    onFileChange={handleFileUpload}
                    onFileRemoval={handleFileRemoval}
                    initialFiles={currentQuestionFiles}
                    multiple={true}
                />
            </div>
            <div className="footer__action flex justify-between items-center sticky bottom-0 my-8">
                <Button
                    color="primary"
                    variant="outlined"
                    onClick={handlePreviousQuestion}
                    disabled={isFirstQuestion || uploading || deleting}
                >
                    Previous
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={
                        isLastQuestion
                            ? () => handleSubmitSubjective(true)
                            : handleNextQuestion
                    }
                    disabled={uploading || deleting || submitting}
                >
                    {isLastQuestion ? (submitting ? "Submitting..." : "Submit") : "Next"}
                </Button>
            </div>
            <TestSubmissionDialog
                open={submitModal.open}
                handleClose={handleCloseSubmitModal}
                onSubmit={handleViewSummary}
                type={submitModal.type as SubmissionType}
                loading={submitting}
            />
            <TestCancelDialog
                open={modal.open}
                handleClose={handleCloseModal}
                onSubmit={() => {
                    try {
                        localStorage.removeItem(storageKey);
                        localStorage.removeItem(`${storageKey}__timer`);
                    } catch {
                        // ignore
                    }
                    navigate(PATH.TEST.ROOT);
                }}
            />
        </div>
    );
}
