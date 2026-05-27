import { Box, CircularProgress, type Theme, Typography, useTheme } from "@mui/material";
import { t } from "i18next";
import type { JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import { useGetAllLiveClassesQuery } from "../../../services/liveApi";
import { useGetAllNotificationsQuery } from "../../../services/notificationApi";
import { useGetUserAllTestQuery } from "../../../services/testApi";
import type { LiveClassProps } from "../../../types/liveClass";
import type { NotificationProps } from "../../../types/notification";
import type { TestProps } from "../../../types/question";
import { getTime } from "../../../utils/formatTime";
import LiveClassCard from "../../organism/Cards/LiveClassCard";
import DashboardCalendar from "./DashboardCalendar";

const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const currentMonthRange = () => {
    const now = new Date();
    return {
        startDate: fmtDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: fmtDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
};

// ── Compact calendar event list ───────────────────────────────────────────────
function CalendarEventPanel({
    selectedDate, selectedDateLabel, liveList, testList, loading, onClear,
}: {
    selectedDate: string | null;
    selectedDateLabel: string | null;
    liveList: LiveClassProps[];
    testList: TestProps[];
    loading: boolean;
    onClear: () => void;
}) {
    const theme = useTheme();
    const navigate = useNavigate();

    if (!selectedDate) return null;

    const handleJoin = (lc: LiveClassProps) => {
        const courseId = lc.courses?.[0];
        navigate(PATH.COURSE_MANAGEMENT.COURSES.JOIN_LIVE.ROOT(
            courseId ? Number(courseId) : undefined,
            Number(lc.id)
        ));
    };

    const handleViewTest = (tc: TestProps) => {
        if (tc.id) navigate(PATH.TEST.VIEW_TEST.ROOT({ testId: Number(tc.id) }));
    };

    const allEmpty = liveList.length === 0 && testList.length === 0;

    type EventItem =
        | { kind: "live"; data: LiveClassProps }
        | { kind: "test"; data: TestProps };

    const combined: EventItem[] = [
        ...liveList.map(d => ({ kind: "live" as const, data: d })),
        ...testList.map(d => ({ kind: "test" as const, data: d })),
    ];

    return (
        <Box sx={{
            mt: "12px",
            pt: "12px",
            borderTop: `1px solid ${theme.palette.divider}`,
        }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "text.primary" }}>
                    {selectedDateLabel}
                </Typography>
                <Box
                    component="button"
                    onClick={onClear}
                    sx={{
                        border: "none", background: "none", cursor: "pointer",
                        fontSize: "11px", color: "text.disabled", p: 0, lineHeight: 1,
                        fontFamily: "inherit",
                        "&:hover": { color: "error.main" },
                    }}
                >
                    ×
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: "14px" }}>
                    <CircularProgress size={20} />
                </Box>
            ) : allEmpty ? (
                <Typography sx={{ fontSize: "12px", color: "text.secondary", textAlign: "center", py: "10px" }}>
                    No events scheduled for this date.
                </Typography>
            ) : (
                <Box>
                    {combined.map((ev, i) => {
                        const isLive = ev.kind === "live";
                        const dotColor = isLive ? theme.palette.error.main : theme.palette.info.main;
                        const name = isLive ? (ev.data as LiveClassProps).name : (ev.data as TestProps).name;
                        const time = isLive
                            ? getTime((ev.data as LiveClassProps).start_time)
                            : getTime((ev.data as TestProps).start_datetime);
                        const isLast = i === combined.length - 1;

                        return (
                            <Box
                                key={`${ev.kind}-${ev.data.id}`}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "9px",
                                    py: "7px",
                                    borderBottom: isLast ? "none" : `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Box sx={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    bgcolor: dotColor, flexShrink: 0,
                                }} />

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        fontSize: "12px", fontWeight: 600, color: "text.primary",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                        {name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
                                        {time}
                                    </Typography>
                                </Box>

                                <Box
                                    component="button"
                                    onClick={() => isLive ? handleJoin(ev.data as LiveClassProps) : handleViewTest(ev.data as TestProps)}
                                    sx={{
                                        flexShrink: 0,
                                        background: isLive ? theme.palette.success.light : theme.palette.secondary.light,
                                        color: isLive ? theme.palette.success.main : theme.palette.secondary.main,
                                        border: "none",
                                        borderRadius: "6px",
                                        px: "10px",
                                        py: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        "&:hover": { opacity: 0.8 },
                                    }}
                                >
                                    {isLive ? "Join" : "View"}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}

// ── Notice type config (theme-aware) ─────────────────────────────────────────
function getNoticeTypeConfig(theme: Theme): Record<string, {
    bgColor: string; iconColor: string; badgeBg: string; badgeColor: string; label: string;
    icon: JSX.Element;
}> {
    return {
        live_class: {
            bgColor: theme.palette.error.light,
            iconColor: theme.palette.error.main,
            badgeBg: theme.palette.error.light,
            badgeColor: theme.palette.error.main,
            label: "Class Notice",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={theme.palette.error.main} strokeWidth="1.5" strokeLinecap="round" /></svg>,
        },
        test: {
            bgColor: theme.palette.success.light,
            iconColor: theme.palette.success.main,
            badgeBg: theme.palette.success.light,
            badgeColor: theme.palette.success.main,
            label: "New Content",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10Z" stroke={theme.palette.success.main} strokeWidth="1.5" strokeLinecap="round" /></svg>,
        },
        general: {
            bgColor: theme.palette.info.light,
            iconColor: theme.palette.info.main,
            badgeBg: theme.palette.info.light,
            badgeColor: theme.palette.info.hover || "",
            label: "Important",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0Z" stroke={theme.palette.info.main} strokeWidth="1.5" strokeLinecap="round" /></svg>,
        },
        offline: {
            bgColor: theme.palette.secondary.light,
            iconColor: theme.palette.secondary.main,
            badgeBg: theme.palette.secondary.light,
            badgeColor: theme.palette.secondary.main,
            label: "Offline",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 2v3M16 2v3M3.5 9h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z" stroke={theme.palette.secondary.main} strokeWidth="1.5" strokeLinecap="round" /></svg>,
        },
    };
}

// ── Notice item ───────────────────────────────────────────────────────────────
function NoticeItem({
    notice, showDismiss, onDismiss,
}: {
    notice: NotificationProps;
    showDismiss: boolean;
    onDismiss: () => void;
}) {
    const theme = useTheme();
    const NOTICE_TYPE_CONFIG = getNoticeTypeConfig(theme);
    const cfg = NOTICE_TYPE_CONFIG[notice.notification_type] ?? NOTICE_TYPE_CONFIG.general;
    const navigate = useNavigate();

    return (
        <Box sx={{
            display: "flex", alignItems: "flex-start", gap: "11px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
            cursor: "pointer",
            position: "relative",
            transition: "transform 0.15s",
            "&:hover": { transform: "translateX(3px)" },
        }}>
            <Box sx={{
                width: 34, height: 34, borderRadius: "6px",
                background: cfg.bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                {cfg.icon}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, pr: showDismiss ? "18px" : 0 }}>
                <Box sx={{
                    display: "inline-block",
                    background: cfg.badgeBg, color: cfg.badgeColor,
                    fontSize: "10px", fontWeight: 700,
                    padding: "2px 8px", borderRadius: "99px",
                    mb: "4px",
                }}>
                    {cfg.label}
                </Box>
                <Typography
                    onClick={() => navigate(PATH.NOTICE.VIEW_NOTICE.ROOT(Number(notice?.id)))}
                    sx={{
                        fontSize: "12.5px", fontWeight: 600, color: "text.primary",
                        lineHeight: 1.4, mb: "2px",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                    {notice.title}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
                    {notice.sent_at
                        ? new Date(notice.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                </Typography>
            </Box>

            {showDismiss && (
                <Box
                    component="button"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDismiss(); }}
                    sx={{
                        position: "absolute", top: 8, right: 8,
                        width: 18, height: 18,
                        background: "none", border: "none",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "text.disabled", borderRadius: "4px",
                        "&:hover": { color: "error.main", background: theme.palette.action.hover },
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </Box>
            )}
        </Box>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LiveClassAndTestFilter() {
    const theme = useTheme();
    const today = new Date();
    const todayStr = fmtDate(today);
    const navigate = useNavigate();

    const [calendarRange, setCalendarRange] = useState(currentMonthRange);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { data: todayLive, isLoading: liveLoading } = useGetAllLiveClassesQuery({
        pageIndex: 1, pageSize: 12,
        startDate: todayStr, endDate: todayStr,
    });

    const { data: noticesData, isLoading: noticesLoading } = useGetAllNotificationsQuery({
        pageIndex: 1, pageSize: 10,
        type: "notice_board",
    });

    const [dismissedNoticeIds, setDismissedNoticeIds] = useState<Set<number>>(new Set());

    const { data: monthLive } = useGetAllLiveClassesQuery({
        pageIndex: 1, pageSize: 100,
        ...calendarRange,
    });
    const { data: monthTests } = useGetUserAllTestQuery({
        pageIndex: 1, pageSize: 100,
        ...calendarRange,
    });

    const { data: dateLive, isFetching: dateLiveFetching } = useGetAllLiveClassesQuery(
        { pageIndex: 1, pageSize: 12, startDate: selectedDate!, endDate: selectedDate! },
        { skip: !selectedDate }
    );
    const { data: dateTests, isFetching: dateTestsFetching } = useGetUserAllTestQuery(
        { pageIndex: 1, pageSize: 12, startDate: selectedDate!, endDate: selectedDate! },
        { skip: !selectedDate }
    );

    const liveClassDates = (monthLive?.data?.data ?? [])
        .map(lc => (lc.start_time ?? lc.schedule_date ?? "").substring(0, 10))
        .filter(Boolean);
    const testDates = (monthTests?.data?.data ?? [])
        .map(tc => (tc.start_datetime ?? "").substring(0, 10))
        .filter(Boolean);

    const todayClasses = todayLive?.data?.data ?? [];
    const allNotices = noticesData?.data?.data ?? [];
    const noticesTotalCount = noticesData?.data?.pagination?.total ?? allNotices.length;
    const showNoticeDismiss = noticesTotalCount > 3;
    const notices = allNotices.filter(n => !dismissedNoticeIds.has(n.id)).slice(0, 3);
    const dateLiveList = dateLive?.data?.data ?? [];
    const dateTestList = dateTests?.data?.data ?? [];

    const selectedDateLabel = selectedDate
        ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
        })
        : null;

    const cardSx = {
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "14px",
        padding: "15px",
    };

    return (
        <div className="flex gap-4 flex-col md:flex-row xl:flex-col">

            <Box sx={cardSx} className="w-full">
                <Typography variant="subtitle1" fontWeight={700} mb={1.5} sx={{ fontSize: "14.5px" }}>
                    Calendar
                </Typography>

                <DashboardCalendar
                    liveClassDates={liveClassDates}
                    testDates={testDates}
                    onMonthChange={(startAD, endAD) =>
                        setCalendarRange({ startDate: startAD, endDate: endAD })
                    }
                    onDateSelect={(adDate) => setSelectedDate(fmtDate(adDate))}
                />

                <CalendarEventPanel
                    selectedDate={selectedDate}
                    selectedDateLabel={selectedDateLabel}
                    liveList={dateLiveList}
                    testList={dateTestList}
                    loading={dateLiveFetching || dateTestsFetching}
                    onClear={() => setSelectedDate(null)}
                />
            </Box>

            <div className="w-full flex flex-col gap-4">
                {(liveLoading || todayClasses.length > 0) && (
                    <Box sx={cardSx}>
                        <div className="flex items-center justify-between mb-2.5">
                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "14.5px" }}>
                                {t("menus.liveClasses")}
                            </Typography>
                            <Box component="span" sx={{
                                fontSize: "10px", fontWeight: 700,
                                padding: "2px 8px", borderRadius: "99px",
                                background: theme.palette.success.light,
                                color: theme.palette.success.main,
                            }}>
                                Today
                            </Box>
                        </div>
                        {liveLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-72 overflow-auto">
                                {todayClasses.map((item) => (
                                    <LiveClassCard key={item.id} data={item} courseId={Number(item.course_id)} />
                                ))}
                            </div>
                        )}
                    </Box>
                )}

                {(noticesLoading || notices.length > 0) && (
                    <Box sx={cardSx}>
                        <div className="flex justify-between items-center ">
                            <Typography variant="subtitle1" fontWeight={700} mb={1.5} sx={{ fontSize: "14.5px" }}>
                                Notice Board
                            </Typography>
                            <Box
                                component="span"
                                onClick={() => navigate(PATH.NOTICE.ROOT)}
                                sx={{
                                    fontSize: '12px',
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    '&:hover': { opacity: 0.7 },
                                }}
                            >
                                {t("actions.view_all")} →
                            </Box>
                        </div>
                        {noticesLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {notices.map((notice) => (
                                    <NoticeItem
                                        key={notice.id}
                                        notice={notice}
                                        showDismiss={showNoticeDismiss}
                                        onDismiss={() =>
                                            setDismissedNoticeIds(prev => new Set([...prev, notice.id]))
                                        }
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </div>
        </div>
    );
}
