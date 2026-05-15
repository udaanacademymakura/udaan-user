import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import { ArrowLeft, Timer1 } from "iconsax-reactjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useDeleteSubjectiveAnswersMutation, useGetSubjectiveAnswerQuery, useGetTestByIdQuery, useSubmitSubjectiveFinalMutation, useUploadSubjectiveAnswersMutation } from "../../../../services/testApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { QuestionProps } from "../../../../types/question";
import { renderHtml } from "../../../../utils/renderHtml";
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
    const [modal, setModal] = useState({
        open: false,
        type: "back"
    });
    const [currentQuestion, setCurrentQuestion] = useState<QuestionProps | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitModal, setSubmitModal] = useState({
        open: false,
        type: "timer"
    });

    const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const initialTimeRef = useRef<number | undefined>(undefined);

    const fiveMinPlayedRef = useRef(false);
    const twoMinPlayedRef = useRef(false);

    const fiveMinAudioRef = useRef<HTMLAudioElement | null>(null);
    const twoMinAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fiveMinAudioRef.current = new Audio(FiveMinAudio);
        twoMinAudioRef.current = new Audio(TwoMinAudio);
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

    useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.timeLeft !== undefined) {
                    setTimeLeft(parsed.timeLeft);
                }
                if (parsed.currentQuestionIndex !== undefined) {
                    setCurrentQuestionIndex(parsed.currentQuestionIndex);
                }
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        }
    }, [storageKey]);

    useEffect(() => {
        const dataToSave = {
            timeLeft,
            currentQuestionIndex,
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }, [timeLeft, currentQuestionIndex, storageKey]);

    useEffect(() => {
        if (data?.overview?.time !== undefined && data?.overview?.end_datetime && initialTimeRef.current === undefined) {
            const endTime = new Date(data.overview.end_datetime).getTime();
            const currentTime = Date.now();
            const timeRemainingFromEnd = Math.max(endTime - currentTime, 0);

            if (timeRemainingFromEnd <= 0) {
                dispatch(
                    showToast({
                        message: "This test has already ended.",
                        severity: "error",
                    })
                );
                localStorage.removeItem(storageKey);
                navigate(PATH.TEST.ROOT);
                return;
            }

            const actualTimeLeft = Math.min(data.overview.time, timeRemainingFromEnd);

            initialTimeRef.current = actualTimeLeft;
            const savedData = localStorage.getItem(storageKey);
            if (!savedData || !JSON.parse(savedData).timeLeft) {
                setTimeLeft(actualTimeLeft);
            }
        }
    }, [data?.overview?.time, data?.overview?.end_datetime, storageKey, dispatch, navigate]);

    useEffect(() => {
        if (data?.data?.length) {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.currentQuestionIndex !== undefined && data.data[parsed.currentQuestionIndex]) {
                    setCurrentQuestion(data.data[parsed.currentQuestionIndex]);
                } else {
                    setCurrentQuestion(data.data[0]);
                }
            } else {
                setCurrentQuestion(data.data[0]);
            }
        }
    }, [data, storageKey]);

    useEffect(() => {
        if (timeLeft === undefined || timeLeft <= 0 || isTimerPaused) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === undefined) return undefined;
                return Math.max(prev - 1000, 0);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, isTimerPaused]);

    useEffect(() => {
        if (timeLeft === undefined || isTimerPaused) return;

        const fiveMinutesInMs = 5 * 60 * 1000;
        const twoMinutesInMs = 2 * 60 * 1000;

        if (timeLeft <= fiveMinutesInMs && timeLeft > fiveMinutesInMs - 1000 && !fiveMinPlayedRef.current) {
            fiveMinPlayedRef.current = true;
            if (fiveMinAudioRef.current) {
                fiveMinAudioRef.current.play().catch((error) => {
                    console.error("Failed to play 5-minute warning audio:", error);
                });
            }
        }

        if (timeLeft <= twoMinutesInMs && timeLeft > twoMinutesInMs - 1000 && !twoMinPlayedRef.current) {
            twoMinPlayedRef.current = true;
            if (twoMinAudioRef.current) {
                twoMinAudioRef.current.play().catch((error) => {
                    console.error("Failed to play 2-minute warning audio:", error);
                });
            }
        }
    }, [timeLeft, isTimerPaused]);

    useEffect(() => {
        if (timeLeft === 0 && !isTimerPaused) {
            setIsTimerPaused(true);
            handleSubmitSubjective();
        }
    }, [timeLeft, isTimerPaused]);

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

    const handleCloseModal = () => {
        setModal({ open: false, type: "timer" });
    };

    const handleCloseSubmitModal = () => {
        setSubmitModal({ open: false, type: "timer" });
    };

    const handleFileUpload = async (files: File[]) => {
        if (!files.length || !currentQuestion) return;

        console.log("file is uploaded", { files })
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
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to upload files.",
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
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to remove files.",
                    severity: "error",
                })
            );
        }
    };

    const handleSubmitSubjective = async (showSummary = false) => {
        try {
            setIsTimerPaused(true);
            const timeTaken = (initialTimeRef.current ?? 0) - (timeLeft ?? 0);
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
            localStorage.removeItem(storageKey);
            if (showSummary) {
                setSubmitModal({ open: true, type: "submit" });
            } else {
                navigate(PATH.TEST.ROOT);
            }
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to submit test.",
                    severity: "error",
                })
            );
        }
    };

    // The summary dialog only opens once the test is already submitted, so
    // this just dismisses it and routes the user onward.
    const handleViewSummary = () => {
        setSubmitModal({ open: false, type: "submit" });
        navigate(PATH.TEST.ROOT);
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

                {initialTimeRef.current !== undefined && (
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
                    localStorage.removeItem(storageKey);
                    navigate(PATH.TEST.ROOT);
                }}
            />
        </div>
    );
}