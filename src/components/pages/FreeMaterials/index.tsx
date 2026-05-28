import { Box, Chip, Divider, InputAdornment, OutlinedInput, Skeleton, Typography, useTheme } from "@mui/material";
import { AudioSquare, Document, Gift, Notepad2, SearchNormal, VideoOctagon, VideoPlay } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    useGetCourseLiveClassQuery,
    useGetCourseMediaByTypeQuery,
    useGetCourseTestQuery,
} from "../../../services/courseApi";
import type { QueryParams } from "../../../types";
import type { LiveClassProps } from "../../../types/liveClass";
import type { MediaProps } from "../../../types/media";
import type { TestProps } from "../../../types/question";
import { EmptyList } from "../../molecules/EmptyList";
import TablePagination from "../../molecules/Pagination";
import LiveClassCard from "../../organism/Cards/LiveClassCard";
import MediaCard from "../../organism/Cards/MediaCard";
import TestCard from "../../organism/Cards/TestCard";

const FREE_COURSE_ID = Number(import.meta.env.VITE_FREE_MATERIALS_COURSE_ID);
const ALL_QP: QueryParams = { pageIndex: 1, pageSize: 50, search: "" };

type Category = "all" | "videos" | "notes" | "audios" | "tests" | "live_classes";

function SectionHeading({
    label,
    count,
    onSeeAll,
}: {
    label: string;
    count?: number;
    onSeeAll: () => void;
}) {
    return (
        <Box className="flex items-center justify-between mb-3">
            <Box className="flex items-center gap-2">
                <Typography variant="h5" fontWeight={700} color="text.dark">{label}</Typography>
                {count !== undefined && (
                    <Typography
                        variant="caption"
                        sx={{
                            px: "8px", py: "2px", borderRadius: "999px",
                            background: (t) => t.palette.primary.light,
                            color: (t) => t.palette.primary.main,
                            fontWeight: 600,
                        }}
                    >
                        {count}
                    </Typography>
                )}
            </Box>
            <Typography
                variant="subtitle2"
                color="primary"
                sx={{ cursor: "pointer", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
                onClick={onSeeAll}
            >
                See all
            </Typography>
        </Box>
    );
}

function MediaSkeletons({ count = 6 }: { count?: number }) {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: "8px" }} />
            ))}
        </>
    );
}

function CardSkeletons({ count = 3 }: { count?: number }) {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: "8px" }} />
            ))}
        </>
    );
}

export default function FreeMaterials() {
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();

    const VALID: Category[] = ["all", "videos", "notes", "audios", "tests", "live_classes"];
    const rawCat = searchParams.get("category") as Category | null;
    const activeCategory: Category = rawCat && VALID.includes(rawCat) ? rawCat : "all";

    const [qp, setQp] = useState<QueryParams>({ pageIndex: 1, pageSize: 12, search: "" });
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setQp((prev) => ({ ...prev, search: searchInput, pageIndex: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleCategoryChange = (cat: Category) => {
        if (cat === "all") {
            setSearchParams({}, { replace: true });
        } else {
            setSearchParams({ category: cat }, { replace: true });
        }
        setQp({ pageIndex: 1, pageSize: 12, search: "" });
        setSearchInput("");
    };

    const videoQp = activeCategory === "videos" ? qp : ALL_QP;
    const notesQp = activeCategory === "notes" ? qp : ALL_QP;
    const audiosQp = activeCategory === "audios" ? qp : ALL_QP;
    const testsQp = activeCategory === "tests" ? qp : ALL_QP;
    const liveQp = activeCategory === "live_classes" ? qp : ALL_QP;

    const { data: videosRes, isLoading: loadingVideos } = useGetCourseMediaByTypeQuery({ id: FREE_COURSE_ID, type: "videos", qp: videoQp });
    const { data: notesRes, isLoading: loadingNotes } = useGetCourseMediaByTypeQuery({ id: FREE_COURSE_ID, type: "notes", qp: notesQp });
    const { data: audiosRes, isLoading: loadingAudios } = useGetCourseMediaByTypeQuery({ id: FREE_COURSE_ID, type: "audios", qp: audiosQp });
    const { data: testsRes, isLoading: loadingTests } = useGetCourseTestQuery({ id: FREE_COURSE_ID, ...testsQp });
    const { data: liveRes, isLoading: loadingLive } = useGetCourseLiveClassQuery({ id: FREE_COURSE_ID, ...liveQp });

    const videoItems = videosRes?.data?.data || [];
    const notesItems = notesRes?.data?.data || [];
    const audiosItems = audiosRes?.data?.data || [];
    const testsItems = testsRes?.data?.data || [];
    const liveItems = liveRes?.data?.data || [];

    const chips: { value: Category; label: string; icon: React.ReactElement; count?: number }[] = [
        { value: "videos", label: "Videos", icon: <VideoPlay size={14} />, count: videosRes?.data?.pagination?.total },
        { value: "notes", label: "Notes", icon: <Document size={14} />, count: notesRes?.data?.pagination?.total },
        { value: "audios", label: "Audios", icon: <AudioSquare size={14} />, count: audiosRes?.data?.pagination?.total },
        { value: "tests", label: "Tests", icon: <Notepad2 size={14} />, count: testsRes?.data?.pagination?.total },
        { value: "live_classes", label: "Live Classes", icon: <VideoOctagon size={14} />, count: liveRes?.data?.pagination?.total },
    ];

    const isAllEmpty =
        !loadingVideos && !loadingNotes && !loadingAudios && !loadingTests && !loadingLive &&
        !videoItems.length && !notesItems.length && !audiosItems.length && !testsItems.length && !liveItems.length;

    return (
        <div className="h-full overflow-auto pr-4 pb-8">
            {/* Hero header */}
            <Box className="flex items-center gap-3 mb-2">
                <Box
                    sx={{
                        width: 48, height: 48, borderRadius: "12px", flexShrink: 0,
                        background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <Gift size={24} color="#fff" variant="Bold" />
                </Box>
                <Box>
                    <Typography variant="h2" fontWeight={700} color="text.dark">
                        Free Learning Resources
                    </Typography>
                    <Typography variant="subtitle2" color="text.middle" fontWeight={400}>
                        Browse free videos, notes, audios, tests and live classes — no purchase needed
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* Filter chips + search */}
            <Box className="flex flex-wrap gap-2 items-center mb-6">
                <Chip
                    label="All"
                    onClick={() => handleCategoryChange("all")}
                    variant={activeCategory === "all" ? "filled" : "outlined"}
                    color={activeCategory === "all" ? "primary" : "default"}
                    sx={{ fontWeight: activeCategory === "all" ? 600 : 400 }}
                />
                {chips.map((cat) => (
                    <Chip
                        key={cat.value}
                        label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                {cat.icon}
                                <span>{cat.count !== undefined ? `${cat.label} (${cat.count})` : cat.label}</span>
                            </Box>
                        }
                        onClick={() => handleCategoryChange(cat.value)}
                        variant={activeCategory === cat.value ? "filled" : "outlined"}
                        color={activeCategory === cat.value ? "primary" : "default"}
                        sx={{ fontWeight: activeCategory === cat.value ? 600 : 400 }}
                    />
                ))}

                {activeCategory !== "all" && (
                    <OutlinedInput
                        placeholder={`Search ${activeCategory.replace("_", " ")}…`}
                        size="small"
                        startAdornment={
                            <InputAdornment position="start">
                                <SearchNormal size={16} color={theme.palette.text.secondary} />
                            </InputAdornment>
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        sx={{ ml: "auto", maxWidth: 240 }}
                    />
                )}
            </Box>

            {/* ── ALL view ───────────────────────────────────────────── */}
            {activeCategory === "all" && (
                <div className="flex flex-col gap-8">
                    {(loadingVideos || videoItems.length > 0) && (
                        <section>
                            <SectionHeading
                                label="Videos"
                                count={videosRes?.data?.pagination?.total}
                                onSeeAll={() => handleCategoryChange("videos")}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                {loadingVideos
                                    ? <MediaSkeletons count={6} />
                                    : videoItems.map((m: MediaProps) => (
                                        <MediaCard key={m.id} media={m} type="temp_video" havePurchased={true} courseId={FREE_COURSE_ID} />
                                    ))
                                }
                            </div>
                        </section>
                    )}

                    {(loadingNotes || notesItems.length > 0) && (
                        <section>
                            <SectionHeading
                                label="Notes"
                                count={notesRes?.data?.pagination?.total}
                                onSeeAll={() => handleCategoryChange("notes")}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                {loadingNotes
                                    ? <MediaSkeletons count={6} />
                                    : notesItems.map((m: MediaProps) => (
                                        <MediaCard key={m.id} media={m} type="temp_notes" havePurchased={true} courseId={FREE_COURSE_ID} />
                                    ))
                                }
                            </div>
                        </section>
                    )}

                    {(loadingAudios || audiosItems.length > 0) && (
                        <section>
                            <SectionHeading
                                label="Audios"
                                count={audiosRes?.data?.pagination?.total}
                                onSeeAll={() => handleCategoryChange("audios")}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                {loadingAudios
                                    ? <MediaSkeletons count={6} />
                                    : audiosItems.map((m: MediaProps) => (
                                        <MediaCard key={m.id} media={m} type="temp_audios" havePurchased={true} courseId={FREE_COURSE_ID} />
                                    ))
                                }
                            </div>
                        </section>
                    )}

                    {(loadingTests || testsItems.length > 0) && (
                        <section>
                            <SectionHeading
                                label="Tests"
                                count={testsRes?.data?.pagination?.total}
                                onSeeAll={() => handleCategoryChange("tests")}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                {loadingTests
                                    ? <CardSkeletons count={3} />
                                    : testsItems.map((t: TestProps) => (
                                        <TestCard key={t.id} test={t} havePurchased={true} />
                                    ))
                                }
                            </div>
                        </section>
                    )}

                    {(loadingLive || liveItems.length > 0) && (
                        <section>
                            <SectionHeading
                                label="Live Classes"
                                count={liveRes?.data?.pagination?.total}
                                onSeeAll={() => handleCategoryChange("live_classes")}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                {loadingLive
                                    ? <MediaSkeletons count={4} />
                                    : liveItems.map((l: LiveClassProps) => (
                                        <LiveClassCard key={l.id} data={l} courseId={FREE_COURSE_ID} />
                                    ))
                                }
                            </div>
                        </section>
                    )}

                    {isAllEmpty && (
                        <EmptyList
                            title="No free materials yet"
                            description="Check back soon — free learning content will appear here."
                        />
                    )}
                </div>
            )}

            {/* ── VIDEOS tab ─────────────────────────────────────────── */}
            {activeCategory === "videos" && (
                <CategoryContent
                    isLoading={loadingVideos}
                    isEmpty={!loadingVideos && !videoItems.length}
                    emptyTitle="No videos found"
                    emptyDescription={qp.search ? "Try a different search term." : "No free videos available yet."}
                    grid="media"
                    totalPages={videosRes?.data?.pagination?.total_pages || 0}
                    qp={qp}
                    setQp={setQp}
                >
                    {videoItems.map((m: MediaProps) => (
                        <MediaCard key={m.id} media={m} type="temp_video" havePurchased={true} courseId={FREE_COURSE_ID} />
                    ))}
                </CategoryContent>
            )}

            {/* ── NOTES tab ──────────────────────────────────────────── */}
            {activeCategory === "notes" && (
                <CategoryContent
                    isLoading={loadingNotes}
                    isEmpty={!loadingNotes && !notesItems.length}
                    emptyTitle="No notes found"
                    emptyDescription={qp.search ? "Try a different search term." : "No free notes available yet."}
                    grid="media"
                    totalPages={notesRes?.data?.pagination?.total_pages || 0}
                    qp={qp}
                    setQp={setQp}
                >
                    {notesItems.map((m: MediaProps) => (
                        <MediaCard key={m.id} media={m} type="temp_notes" havePurchased={true} courseId={FREE_COURSE_ID} />
                    ))}
                </CategoryContent>
            )}

            {/* ── AUDIOS tab ─────────────────────────────────────────── */}
            {activeCategory === "audios" && (
                <CategoryContent
                    isLoading={loadingAudios}
                    isEmpty={!loadingAudios && !audiosItems.length}
                    emptyTitle="No audios found"
                    emptyDescription={qp.search ? "Try a different search term." : "No free audios available yet."}
                    grid="media"
                    totalPages={audiosRes?.data?.pagination?.total_pages || 0}
                    qp={qp}
                    setQp={setQp}
                >
                    {audiosItems.map((m: MediaProps) => (
                        <MediaCard key={m.id} media={m} type="temp_audios" havePurchased={true} courseId={FREE_COURSE_ID} />
                    ))}
                </CategoryContent>
            )}

            {/* ── TESTS tab ──────────────────────────────────────────── */}
            {activeCategory === "tests" && (
                <CategoryContent
                    isLoading={loadingTests}
                    isEmpty={!loadingTests && !testsItems.length}
                    emptyTitle="No tests found"
                    emptyDescription={qp.search ? "Try a different search term." : "No free tests available yet."}
                    grid="card"
                    totalPages={testsRes?.data?.pagination?.total_pages || 0}
                    qp={qp}
                    setQp={setQp}
                >
                    {testsItems.map((t: TestProps) => (
                        <TestCard key={t.id} test={t} havePurchased={true} />
                    ))}
                </CategoryContent>
            )}

            {/* ── LIVE CLASSES tab ───────────────────────────────────── */}
            {activeCategory === "live_classes" && (
                <CategoryContent
                    isLoading={loadingLive}
                    isEmpty={!loadingLive && !liveItems.length}
                    emptyTitle="No live classes found"
                    emptyDescription={qp.search ? "Try a different search term." : "No free live classes available yet."}
                    grid="live"
                    totalPages={liveRes?.data?.pagination?.total_pages || 0}
                    qp={qp}
                    setQp={setQp}
                >
                    {liveItems.map((l: LiveClassProps) => (
                        <LiveClassCard key={l.id} data={l} courseId={FREE_COURSE_ID} />
                    ))}
                </CategoryContent>
            )}
        </div>
    );
}

function CategoryContent({
    isLoading,
    isEmpty,
    emptyTitle,
    emptyDescription,
    grid,
    totalPages,
    qp,
    setQp,
    children,
}: {
    isLoading: boolean;
    isEmpty: boolean;
    emptyTitle: string;
    emptyDescription: string;
    grid: "media" | "card" | "live";
    totalPages: number;
    qp: QueryParams;
    setQp: (qp: QueryParams) => void;
    children: React.ReactNode;
}) {
    const gridClass =
        grid === "live"
            ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
            : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3";

    if (isEmpty) {
        return <EmptyList title={emptyTitle} description={emptyDescription} />;
    }

    return (
        <div>
            <div className={gridClass}>
                {isLoading
                    ? grid === "card"
                        ? <CardSkeletons count={3} />
                        : <MediaSkeletons count={6} />
                    : children
                }
            </div>
            {!isLoading && totalPages > 1 && (
                <div className="mt-6">
                    <TablePagination qp={qp} setQp={setQp} totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}
