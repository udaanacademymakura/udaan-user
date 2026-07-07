import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ArrowDown2, ArrowRight2, Calendar, DocumentDownload, Eye, User } from "iconsax-reactjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDownloadGorkhapatraMutation, useGetGorkhapatraByIdQuery, useRelatedGorkhapatraQuery } from "../../../../services/gorkhapatraApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import { renderHtml } from "../../../../utils/renderHtml";
import CopyLink from "../../../atom/CopyLink";
import GorkhapatraCard from "../../../organism/Cards/GorkhapatraCard";
import SingleGorkhapatraLoading from "./Loading";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

const SCROLL_OFFSET = 120;

function processContentWithToc(htmlContent: string): { updatedContent: string; tocItems: TocItem[] } {
    const tocItems: TocItem[] = [];
    let headingIndex = 0;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const headings = tempDiv.querySelectorAll('h2, h3');

    headings.forEach((heading) => {
        const headingId = `heading-${headingIndex}`;
        heading.setAttribute('id', headingId);

        tocItems.push({
            id: headingId,
            text: heading.textContent?.trim() || "",
            level: heading.tagName === "H2" ? 2 : 3,
        });

        headingIndex++;
    });

    return {
        updatedContent: tempDiv.innerHTML,
        tocItems,
    };
}

export default function SingleGorkhapatraRoot() {

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [activeId, setActiveId] = useState<string>("");
    const isClickScrolling = useRef(false);
    const [isTocOpen, setIsTocOpen] = useState(false);

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

    const { data, isLoading } = useGetGorkhapatraByIdQuery(
        { id: Number(id) },
        { skip: !id }
    );

    const { data: relatedGorkhapatra } = useRelatedGorkhapatraQuery({ id: Number(id) }, { skip: !id });

    const [downloadGorkhapatra, { isLoading: isDownloading }] = useDownloadGorkhapatraMutation();

    const gorkhapatraData = data?.data;
    const date: string = formatDateForDisplay(gorkhapatraData?.created_at);

    // Process content and extract TOC items
    const { updatedContent, tocItems } = useMemo(() => {
        if (!gorkhapatraData?.content) {
            return { updatedContent: "", tocItems: [] };
        }
        return processContentWithToc(gorkhapatraData.content);
    }, [gorkhapatraData?.content]);

    useEffect(() => {
        if (tocItems.length > 0 && !activeId) {
            setActiveId(tocItems[0].id);
        }
    }, [tocItems, activeId]);

    const getElementOffsetTop = useCallback((element: HTMLElement): number => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer || !element) return 0;

        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        return elementRect.top - containerRect.top + scrollContainer.scrollTop;
    }, []);

    const handleScroll = useCallback(() => {
        if (isClickScrolling.current) return;

        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer || tocItems.length === 0) return;

        const scrollTop = scrollContainer.scrollTop;
        let newActiveId = tocItems[0]?.id || "";

        for (let i = 0; i < tocItems.length; i++) {
            const item = tocItems[i];
            const element = document.getElementById(item.id);
            if (!element) continue;

            const headingTop = getElementOffsetTop(element);

            if (scrollTop >= headingTop - SCROLL_OFFSET) {
                newActiveId = item.id;
            } else {
                break;
            }
        }

        setActiveId(newActiveId);
    }, [tocItems, getElementOffsetTop]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer || tocItems.length === 0) return;

        const initialTimer = setTimeout(() => {
            handleScroll();
        }, 100);

        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            clearTimeout(initialTimer);
            scrollContainer.removeEventListener("scroll", handleScroll);
        };
    }, [tocItems, handleScroll]);

    const scrollToHeading = useCallback((headingId: string) => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const element = document.getElementById(headingId);
        if (!element) {
            console.warn(`Element not found for heading: ${headingId}`);
            return;
        }

        isClickScrolling.current = true;
        setActiveId(headingId);

        const targetPosition = getElementOffsetTop(element) - SCROLL_OFFSET + 20;

        scrollContainer.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth",
        });

        setTimeout(() => {
            isClickScrolling.current = false;
        }, 800);
    }, [getElementOffsetTop]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleDownload = async () => {
        if (!id) return;
        try {
            const blob = await downloadGorkhapatra({ id: Number(id) }).unwrap();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `${gorkhapatraData?.title || "gorkhapatra"}.pdf`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to download Gorkhapatra",
                    severity: "error",
                }),
            );
        }
    };

    const handleTocItemClick = (itemId: string) => {
        scrollToHeading(itemId);
        if (!isDesktop) {
            setIsTocOpen(false);
        }
    };

    const handleTocToggle = () => {
        if (!isDesktop) {
            setIsTocOpen((prev) => !prev);
        }
    };

    const showTocContent = isDesktop || isTocOpen;

    if (isLoading) {
        return <SingleGorkhapatraLoading />;
    }
    return (
        <div
            ref={scrollContainerRef}
            className="single__gorkhapatra__root h-full overflow-auto"
        >
            <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={handleBackClick}
                sx={{
                    color: (theme) => theme.palette.separator.darkest
                }}
            >
                <Typography color="text.middle">Back to Gorkhapatras</Typography>
            </Button>

            <Typography className="text-center mt-8!" variant="h3" fontWeight={600}>
                {gorkhapatraData?.title}
            </Typography>

            <Divider className="mt-2! mb-6!" />

            <Box
                className="image__wrapper aspect-1460/534 rounded-lg flex flex-col justify-center items-center mb-8 overflow-hidden"
                sx={{
                    background: (theme) => theme.palette.primary.dark,
                    color: (theme) => theme.palette.primary.contrastText,
                }}
            >
                {gorkhapatraData?.thumbnail_url ? (
                    <img
                        src={gorkhapatraData.thumbnail_url}
                        alt={gorkhapatraData?.title || "Gorkhapaatra thumbnail"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="max-w-[80%] mx-auto text-center">
                        <Typography variant="h1" fontWeight={600}>
                            {gorkhapatraData?.title}
                        </Typography>
                        {gorkhapatraData?.description ? <Typography className="text.middle" color="warning.main">
                            {renderHtml(gorkhapatraData?.description || "")}
                        </Typography> : ""}
                    </div>
                )}
            </Box>

            <Stack className="justify-between flex-wrap!">
                <Stack className="items-center! flex-wrap! gap-2 mb-6">
                    {gorkhapatraData?.added_by && (
                        <Stack className="items-center! gap-1">
                            <User />
                            <Typography variant="subtitle2" color="text.middle">
                                Presenter: {gorkhapatraData.added_by}
                            </Typography>
                        </Stack>
                    )}
                    {gorkhapatraData?.created_at && (
                        <Stack className="items-center! gap-1">
                            <Calendar />
                            <Typography variant="subtitle2" color="text.middle">
                                {date}
                            </Typography>
                        </Stack>
                    )}
                    {gorkhapatraData?.views !== undefined && gorkhapatraData.views > 0 && (
                        <Stack className="items-center! gap-1">
                            <Eye />
                            <Typography variant="subtitle2" color="text.middle">
                                {gorkhapatraData.views} Views
                            </Typography>
                        </Stack>
                    )}
                </Stack>
                <Stack className="items-center! gap-2">
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DocumentDownload size={18} />}
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? "Downloading…" : "Download"}
                    </Button>
                    <CopyLink />
                </Stack>
            </Stack>

            {updatedContent && (
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 mt-4">
                    <div className="lg:col-span-4 sticky top-0 lg:top-4 self-start z-10">
                        <Stack
                            className="items-center! justify-between gap-4 w-full py-3 px-4 lg:py-0 lg:px-0"
                            onClick={handleTocToggle}
                            sx={{
                                background: (theme) => theme.palette.primary.contrastText,
                                cursor: isDesktop ? "default" : "pointer",
                                border: (theme) => isDesktop ? "none" : `1px solid ${theme.palette.separator.dark}`,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                className="line-clamp-1"
                            >
                                Table of Content
                            </Typography>
                            {!isDesktop && (
                                <ArrowDown2
                                    size={18}
                                    style={{
                                        transition: "transform 0.3s ease",
                                        transform: isTocOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                />
                            )}
                        </Stack>

                        <Collapse in={showTocContent} timeout={300}>
                            <Box
                                sx={{
                                    mt: isDesktop ? 2 : 1,
                                    maxHeight: isDesktop ? "none" : "300px",
                                    overflowY: isDesktop ? "visible" : "auto",
                                    background: (theme) => theme.palette.background.paper,
                                    borderRadius: 1,
                                    border: (theme) => isDesktop ? "none" : `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                {tocItems.length > 0 ? (
                                    <Stack className="gap-1 flex-col! p-2 lg:p-0">
                                        {tocItems.map((item) => {
                                            const isActive = activeId === item.id;

                                            return (
                                                <Box
                                                    key={item.id}
                                                    className="flex items-center justify-between"
                                                    onClick={() => handleTocItemClick(item.id)}
                                                    sx={{
                                                        paddingLeft: item.level === 3 ? 3 : 1.5,
                                                        paddingY: 1.5,
                                                        paddingRight: 1.5,
                                                        borderRadius: 1,
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        ...(isActive && {
                                                            background: (theme) => theme.palette.primary.light,
                                                            color: (theme) => theme.palette.primary.main,
                                                        }),
                                                        "&:hover": {
                                                            background: (theme) => theme.palette.primary.light,
                                                            color: (theme) => theme.palette.primary.main,
                                                        },
                                                        "&:active": {
                                                            background: (theme) => theme.palette.primary.light,
                                                            color: (theme) => theme.palette.primary.main,
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color={isActive ? "primary.main" : "text.dark"}
                                                        fontWeight={500}
                                                        className="line-clamp-1"
                                                    >
                                                        {item.text}
                                                    </Typography>
                                                    <ArrowRight2 size={16} />
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                ) : (
                                    <Typography variant="caption" color="text.disabled" className="p-4">
                                        No headings found
                                    </Typography>
                                )}
                            </Box>
                        </Collapse>
                    </div>

                    <div className="content general__content__box styled__list lg:col-span-8">
                        {renderHtml(updatedContent)}
                    </div>
                </div>
            )}

            {relatedGorkhapatra && relatedGorkhapatra?.data?.length > 0 ? <>
                <Typography variant="h4" className="mt-16! mb-2!">More Gorkhapatra</Typography>
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 ">
                    {relatedGorkhapatra?.data?.map((notice) => (
                        <GorkhapatraCard
                            data={notice} key={notice.title + notice.id}
                        />
                    ))}
                </div></> : ""}
        </div>
    );
}