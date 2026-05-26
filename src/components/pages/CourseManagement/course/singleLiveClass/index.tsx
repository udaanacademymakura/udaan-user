import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    Typography,
} from "@mui/material";
import { Maximize2 } from "iconsax-reactjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import JoinProgress from "../../../../organism/JoinProgress";
import { PATH } from "../../../../../routes/PATH";
import { useGetMeetingSignatureMutation, useGetSingleLiveClassQuery } from "../../../../../services/courseApi";
import { useGetZoomAccountsQuery } from "../../../../../services/liveApi";
import { useAppSelector } from "../../../../../store/hook";
import { renderHtml } from "../../../../../utils/renderHtml";
import WaterMark from "../../../../../Watermark";

type MeetingStatus =
    | "initial_loading"
    | "preparing_zoom"
    | "not_started"
    | "error"
    | "ready_to_join"
    | "ended";

const MIN_PHASE_MS = 450;
const CONGESTION_WINDOW_MS = 2 * 60 * 1000;
const PHASE_4_TO_5_WATCHDOG_MS = 3500;
const PHASE_TO_6_WATCHDOG_MS = 7000;
const STUDENTS_PER_LEVEL = 40;
const MAX_JOIN_LEVELS = 30;
const SIGNATURE_LEVEL_DELAY_MS = 650;
const MEETING_LAUNCH_LEVEL_DELAY_MS = 450;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function computeLevelCount(students: number): number {
    return Math.min(MAX_JOIN_LEVELS, Math.max(1, Math.ceil(students / STUDENTS_PER_LEVEL)));
}

function joinJitterMs(userId: number | string | undefined, maxMs: number): number {
    if (!userId || maxMs <= 0) return 0;
    let h = 0;
    const s = String(userId);
    for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) | 0;
    return Math.abs(h) % maxMs;
}

function userJoinLevel(userId: number | string | undefined, liveId: number | string | undefined, levelCount: number): number {
    const seed = `${userId ?? "guest"}:${liveId ?? "live"}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) | 0;
    return Math.abs(h) % levelCount;
}

function normalizeJoinLevel(value: string | null, fallback: number, levelCount: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.min(levelCount - 1, Math.floor(parsed)));
}

export default function SingleLiveClassRoot() {
    const { courseId, liveId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector((state) => state.auth.user);

    const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("initial_loading");
    const [error, setError] = useState<string | null>(null);
    const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
    const [_isSignatureLoading, setIsSignatureLoading] = useState(false);
    const [joinPhase, setJoinPhase] = useState<number>(1);
    const watchdogStartedRef = useRef(false);
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

    const joinLevel = useMemo(() => {
        const students = liveClassData?.data?.active_students ?? 0;
        const levelCount = computeLevelCount(students);
        const fallback = userJoinLevel(user?.id, liveId, levelCount);
        return normalizeJoinLevel(new URLSearchParams(location.search).get("level"), fallback, levelCount);
    }, [location.search, liveId, user?.id, liveClassData]);

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
                // Phase 2 — basic gates passed, now preparing
                await advance(2);

                setMeetingStatus("preparing_zoom");
                setIsSignatureLoading(true);
                setError(null);

                // Phase 3 — about to request the signature
                await advance(3);

                const meetingNumber = meetingData.start_url.match(/\/j\/(\d+)/)?.[1];
                const password = new URL(meetingData.start_url).searchParams.get("pwd");

                const zoomAccount = zoomAccountsData?.data?.find(
                    (acc) => acc.id === meetingData.account_id
                );
                const sdkKey = zoomAccount?.sdk_key;

                if (!meetingNumber) throw new Error("Invalid Meeting URL in server data.");
                if (!sdkKey) throw new Error("Zoom SDK Key not found for this account.");

                // Load-smoothing jitter: only inside ±2 min of class start, scaled by class size.
                // Keeps peak signature throughput at ~40 req/sec regardless of how many students hit Join.
                const startMs = meetingStartTime?.getTime() ?? 0;
                const inCongestionWindow =
                    startMs > 0 && Math.abs(Date.now() - startMs) < CONGESTION_WINDOW_MS;
                if (inCongestionWindow) {
                    const students = meetingData.active_students ?? 0;
                    const maxMs = Math.min(15_000, Math.ceil(students / 40) * 1000);
                    const jitter = joinJitterMs(user?.id, maxMs);
                    if (jitter > 0) await sleep(jitter);
                }

                const signatureLevelDelay = joinLevel * SIGNATURE_LEVEL_DELAY_MS;
                if (signatureLevelDelay > 0) await sleep(signatureLevelDelay);

                const sigRes = await generateSignature({
                    meeting_id: Number(meetingNumber),
                    account_id: Number(meetingData?.account_id),
                    role: 0,
                }).unwrap();

                const signature = sigRes.data.signature;
                if (!signature) throw new Error("Failed to generate meeting signature.");

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

                const meetingLaunchDelay = joinLevel * MEETING_LAUNCH_LEVEL_DELAY_MS;
                if (meetingLaunchDelay > 0) await sleep(meetingLaunchDelay);

                // Phase 4 — iframe mounting, Zoom SDK about to load
                await advance(4);
                setMeetingStatus("ready_to_join");

            } catch (err: any) {
                console.error("Zoom preparation error:", err);
                setMeetingStatus("error");
                setError(err.message || "An unknown error occurred during meeting preparation.");
            } finally {
                setIsSignatureLoading(false);
            }
        };


        if (liveClassData) checkStatusAndPrepare();

    }, [liveClassData, isLoadingLiveClass, zoomAccountsData, isLoadingZoomAccounts, generateSignature, user, courseId, joinLevel]);

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
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    // Watchdog: if the iframe never posts back (older browser, SDK silently failed,
    // CDN slow), advance phases anyway so the overlay can clear and reveal whatever
    // the iframe is doing. Started once when phase first reaches 4. Timers live in a
    // ref so re-running this effect on subsequent phase changes (via postMessage)
    // does NOT clear them — cleanup only fires on unmount via the effect below.
    useEffect(() => {
        if (joinPhase < 4 || watchdogStartedRef.current) return;
        watchdogStartedRef.current = true;

        watchdogTimersRef.current.t5 = setTimeout(() => {
            setJoinPhase((curr) => (curr < 5 ? 5 : curr));
        }, PHASE_4_TO_5_WATCHDOG_MS);

        watchdogTimersRef.current.t6 = setTimeout(() => {
            setJoinPhase((curr) => (curr < 6 ? 6 : curr));
        }, PHASE_TO_6_WATCHDOG_MS);
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
                    <Button variant="contained" onClick={handleRetry} size="large">
                        Try Again
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
