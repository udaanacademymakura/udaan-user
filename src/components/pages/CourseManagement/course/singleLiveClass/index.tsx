import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    Typography,
} from "@mui/material";
import { Maximize2 } from "iconsax-reactjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../../../routes/PATH";
import { useGetMeetingSignatureMutation, useGetSingleLiveClassQuery } from "../../../../../services/courseApi";
import { useGetZoomAccountsQuery } from "../../../../../services/liveApi";
import { useAppSelector } from "../../../../../store/hook";
import { renderHtml } from "../../../../../utils/renderHtml";
import WaterMark from "../../../../../Watermark";
import JoinProgress from "../../../../organism/JoinProgress";

type MeetingStatus =
    | "initial_loading"
    | "preparing_zoom"
    | "not_started"
    | "error"
    | "ready_to_join"
    | "ended";

const MIN_PHASE_MS = 450;    // visual dwell between steps
const PHASE_TIMEOUT_MS = 5_000; // max per step before watchdog force-advances
const PHASE_FAST_MS = 1_000;    // per step when signature came back quickly

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Zoom reports every transport-level refusal as code 1, including the server-side
// block applied to Meeting SDK versions past their quarterly minimum.
const describeZoomFailure = (errorCode: number, detail: string) => {
    if (errorCode === 1) {
        return "We couldn't reach Zoom's servers. This is usually a network or firewall restriction — try another network or turn off any VPN. If every class fails this way, please report it to support.";
    }
    const base = detail || "The class could not be joined.";
    return errorCode ? `${base} (Zoom error ${errorCode})` : base;
};

export default function SingleLiveClassRoot() {
    const { courseId, liveId } = useParams();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("initial_loading");
    const [error, setError] = useState<string | null>(null);
    const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
    const [_isSignatureLoading, setIsSignatureLoading] = useState(false);
    const [joinPhase, setJoinPhase] = useState<number>(1);
    const [retryCount, setRetryCount] = useState(0);
    const [retryCountdown, setRetryCountdown] = useState(0);
    const watchdogStartedRef = useRef(false);
    const processStartTimeRef = useRef<number>(0);
    const watchdogTimersRef = useRef<{
        t5?: ReturnType<typeof setTimeout>;
        t6?: ReturnType<typeof setTimeout>;
    }>({});

    const { data: liveClassData, isLoading: isLoadingLiveClass } = useGetSingleLiveClassQuery({
        courseId: Number(courseId),
        liveId: Number(liveId),
    }, {
        skip: !courseId || !liveId,
    });

    const { data: zoomAccountsData, isLoading: isLoadingZoomAccounts } = useGetZoomAccountsQuery();

    const [generateSignature] = useGetMeetingSignatureMutation();

    const formatMeetingTime = (time: string | undefined) => {
        if (!time) return "";
        const startTime = new Date(time);
        return startTime.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: 'Asia/Kathmandu',
        }) + " (NPT)";
    };

    useEffect(() => {
        if (isLoadingLiveClass || isLoadingZoomAccounts) {
            setMeetingStatus("initial_loading");
            setJoinPhase((curr) => (curr < 1 ? 1 : curr));
            return;
        }

        const meetingData = liveClassData?.data;

        if (!meetingData) {
            setMeetingStatus("error");
            setError("Live class data not found.");
            return;
        }

        if (meetingData.status as MeetingStatus === "ended") {
            setMeetingStatus("ended");
            return;
        }

        const advance = async (next: number) => {
            setJoinPhase((curr) => (curr < next ? next : curr));
            await sleep(MIN_PHASE_MS);
        };

        const checkStatusAndPrepare = async () => {
            const meetingStartTime = meetingData.start_time ? new Date(meetingData.start_time) : null;
            const currentTime = new Date();

            if (meetingStartTime && currentTime < meetingStartTime) {
                setMeetingStatus("not_started");
                return;
            }

            try {
                processStartTimeRef.current = Date.now();
                // Phase 2 — basic gates passed, now preparing
                await advance(2);

                setMeetingStatus("preparing_zoom");
                setIsSignatureLoading(true);
                setError(null);

                // Phase 3 — about to request the signature
                await advance(3);

                const meetingSource = [meetingData.start_url, meetingData.join_url]
                    .find((url) => url && /\/[js]\/\d+/.test(url));
                const meetingNumber = meetingSource?.match(/\/[js]\/(\d+)/)?.[1];
                const password = meetingSource
                    ? new URL(meetingSource).searchParams.get("pwd")
                    : null;

                if (!meetingNumber) throw new Error("Invalid Meeting URL in server data.");

                const sigRes = await generateSignature({
                    meeting_id: Number(meetingNumber),
                    account_id: Number(meetingData?.account_id),
                    role: 0,
                }).unwrap();

                const signature = sigRes.data.signature;
                if (!signature) throw new Error("Failed to generate meeting signature.");

                // Prefer the key returned alongside the signature; the /zoom-accounts
                // fallback exists only until that field ships.
                const sdkKey = sigRes.data.sdk_key
                    || zoomAccountsData?.data?.find((acc) => acc.id === meetingData.account_id)?.sdk_key;
                if (!sdkKey) throw new Error("Zoom SDK Key not found for this account.");

                // Construct URL for the static HTML file
                const finalDestination = window.location.origin + PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(Number(courseId));
                // The 'leave' URL points to a breaker HTML which redirects to the course page
                const breakerUrl = `${window.location.origin}/end-meeting.html?target=${encodeURIComponent(finalDestination)}`;

                const params = new URLSearchParams({
                    mn: meetingNumber,
                    pwd: password || "",
                    sig: signature,
                    key: sdkKey,
                    name: user?.name || "Student",
                    email: user?.email || "",
                    leave: breakerUrl
                });

                setMeetingUrl(`/meeting.html?${params.toString()}`);

                await advance(4);
                setMeetingStatus("ready_to_join");

            } catch (err: any) {
                console.error("Zoom preparation error:", err);
                setMeetingStatus("error");
                setError(err.message || "An unknown error occurred during meeting preparation.");
                setRetryCountdown(3);
            } finally {
                setIsSignatureLoading(false);
            }
        };

        if (liveClassData) checkStatusAndPrepare();

    }, [liveClassData, isLoadingLiveClass, zoomAccountsData, isLoadingZoomAccounts, generateSignature, user, courseId, retryCount]);

    // Iframe → parent message bridge. Listens for stage events posted by /meeting.html.
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const data = event.data;
            if (!data || typeof data !== "object" || data.type !== "udaan_zoom") return;

            if (data.stage === "audio_connecting") {
                setJoinPhase((curr) => (curr < 5 ? 5 : curr));
            } else if (data.stage === "joined") {
                setJoinPhase((curr) => (curr < 6 ? 6 : curr));
            } else if (data.stage === "error") {
                if (watchdogTimersRef.current.t5) clearTimeout(watchdogTimersRef.current.t5);
                if (watchdogTimersRef.current.t6) clearTimeout(watchdogTimersRef.current.t6);
                setMeetingStatus("error");
                setError(describeZoomFailure(Number(data.errorCode) || 0, String(data.detail || "")));
                setRetryCountdown(3);
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    // Countdown effect: ticks retryCountdown down to 0 after an error.
    useEffect(() => {
        if (retryCountdown <= 0) return;
        const t = setTimeout(() => setRetryCountdown((c) => c - 1), 1_000);
        return () => clearTimeout(t);
    }, [retryCountdown]);

    // Watchdog: fallback if the iframe never posts back (old browser, silent SDK failure, CDN slow).
    // If the signature came back within one phase budget (5 s) use fast mode (1 s per step),
    // otherwise give each step the full 5 s.
    useEffect(() => {
        if (joinPhase < 4 || watchdogStartedRef.current) return;
        watchdogStartedRef.current = true;

        const elapsed = processStartTimeRef.current > 0 ? Date.now() - processStartTimeRef.current : 0;
        const phaseMs = elapsed < PHASE_TIMEOUT_MS ? PHASE_FAST_MS : PHASE_TIMEOUT_MS;

        watchdogTimersRef.current.t5 = setTimeout(() => {
            setJoinPhase((curr) => (curr < 5 ? 5 : curr));
        }, phaseMs);

        watchdogTimersRef.current.t6 = setTimeout(() => {
            setJoinPhase((curr) => (curr < 6 ? 6 : curr));
        }, phaseMs * 2);
    }, [joinPhase]);

    useEffect(() => {
        return () => {
            if (watchdogTimersRef.current.t5) clearTimeout(watchdogTimersRef.current.t5);
            if (watchdogTimersRef.current.t6) clearTimeout(watchdogTimersRef.current.t6);
        };
    }, []);


    const handleClose = () => {
        navigate(PATH.COURSE_MANAGEMENT.COURSES.ROOT)
        // navigate(-1);
        // navigate(PATH.LIVE_CLASSES.ROOT);
    };

    const handleRetry = () => {
        setMeetingStatus("initial_loading");
        setError(null);
        setJoinPhase(1);
        setRetryCountdown(0);
        watchdogStartedRef.current = false;
        processStartTimeRef.current = 0;
        setRetryCount((c) => c + 1);
    };

    // ------------------ JSX for Status Screens ------------------

    const currentData = liveClassData?.data;

    const zoomContainerRef = useRef<HTMLDivElement>(null);

    const handleFullscreen = () => {
        if (zoomContainerRef.current) {
            if (zoomContainerRef.current.requestFullscreen) {
                zoomContainerRef.current.requestFullscreen();
            } else if ((zoomContainerRef.current as any).webkitRequestFullscreen) {
                (zoomContainerRef.current as any).webkitRequestFullscreen();
            } else if ((zoomContainerRef.current as any).msRequestFullscreen) {
                (zoomContainerRef.current as any).msRequestFullscreen();
            }
        }
    };


    // Loading + signature stages — full-screen JoinProgress only (iframe not mounted yet)
    if (meetingStatus === "initial_loading" || meetingStatus === "preparing_zoom") {
        return (
            <JoinProgress
                phase={joinPhase}
                liveClass={liveClassData?.data}
                onCancel={handleClose}
            />
        );
    }

    // Meeting Not Started
    if (meetingStatus === "not_started") {
        return (
            <Box sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "background.default",
                zIndex: 1000,
                p: 3,
            }}>
                <Box sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: "info.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                }}>
                    <Typography variant="h2">🕐</Typography>
                </Box>
                <Typography variant="h5" gutterBottom>
                    Meeting Not Started Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 500, mt: 2 }}>
                    The host hasn't started this meeting yet. Please wait for the meeting to begin.
                </Typography>
                {currentData?.start_time && (
                    <Alert severity="info" sx={{ mt: 3, maxWidth: 500 }}>
                        <AlertTitle>Scheduled Start Time (Nepal Time)</AlertTitle>
                        {formatMeetingTime(currentData.start_time)}
                    </Alert>
                )}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                    <Button variant="outlined" onClick={handleClose} size="large">
                        Go Back
                    </Button>
                    <Button variant="contained" onClick={handleRetry} size="large">
                        Check Again
                    </Button>
                </Box>
            </Box>
        );
    }

    // Meeting Ended (Requires server-side check/status)
    if (meetingStatus === "ended") {
        return (
            <Box sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "background.default",
                zIndex: 1000,
                p: 3,
            }}>
                <Box sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: "success.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                }}>
                    <Typography variant="h2">✅</Typography>
                </Box>
                <Typography variant="h5" gutterBottom>
                    Meeting Has Ended
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 500, mt: 2 }}>
                    This meeting has already concluded. Thank you for participating!
                </Typography>
                <Button variant="contained" onClick={handleClose} size="large" sx={{ mt: 4 }}>
                    Go Back to Course
                </Button>
            </Box>
        );
    }

    // Error State
    if (meetingStatus === "error" && error) {
        return (
            <Box sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "background.default",
                zIndex: 1000,
                p: 3,
            }}>
                <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "error.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                }}>
                    <Typography variant="h3" color="error.main">⚠️</Typography>
                </Box>
                <Typography variant="h6" color="error.main" gutterBottom>
                    Unable to Join Meeting
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400, mt: 1 }}>
                    {error}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button variant="outlined" onClick={handleClose} size="large">
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleRetry}
                        size="large"
                        disabled={retryCountdown > 0}
                    >
                        {retryCountdown > 0 ? `Try Again (${retryCountdown}s)` : "Try Again"}
                    </Button>
                </Box>
            </Box>
        );
    }


    // Ready to Join: Render the IFrame (Final state for successful launch)
    return (
        <>
            <div className=" items-end justify-between py-4 hidden lg:flex lg:px-8">
                <div className="title__wrapper">
                    <Typography variant="h4" fontWeight={600}>{liveClassData?.data?.name}</Typography>
                    {liveClassData?.data?.description ? (<>
                        <Typography variant="h4" className="mb-4!" fontWeight={600}>Agenda</Typography>
                        <Typography variant="subtitle2" color="text.middle">{renderHtml(liveClassData?.data?.agenda || "")}</Typography>
                    </>) : ""}
                    {liveClassData?.data?.description ? (<>
                        <Typography variant="h4" className="mb-4!" fontWeight={600}>More On {liveClassData?.data?.name}</Typography>
                        <Typography variant="subtitle2" color="text.middle">{renderHtml(liveClassData?.data?.description || "")}</Typography>
                    </>) : ""}
                </div>
                <Button variant="contained" onClick={handleFullscreen} startIcon={<Maximize2 />}>
                    Fullscreen Zoom
                </Button>
            </div>
            <Divider className="mt-2! hidden lg:block" />

            <Box
                ref={zoomContainerRef}
                sx={{
                    width: "100%",
                    height: {
                        xs: "100vh",
                        lg: "calc(100vh - 92px)"
                    },
                    bgcolor: "black",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {meetingUrl && (
                    <iframe
                        src={meetingUrl}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                        }}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        title="Zoom Class"
                    />
                )}
                {joinPhase >= 6 && <WaterMark />}
            </Box>

            {joinPhase < 6 && (
                <JoinProgress
                    phase={joinPhase}
                    liveClass={liveClassData?.data}
                    onCancel={handleClose}
                />
            )}
        </>

    );
}
