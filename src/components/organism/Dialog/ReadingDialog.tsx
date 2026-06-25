import { Box, Button, CircularProgress, Dialog, DialogContent, Tooltip, Typography, useTheme } from '@mui/material';
import { t } from 'i18next';
import { Maximize2 } from 'iconsax-reactjs';
import Plyr, { type APITypes, type PlyrProps } from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useRef, useState } from 'react';
import { useThemeSettings } from '../../../hooks/useThemeSettings';
import { useGetCourseMediaByTypeQuery, useGetSinglePlaylistQuery, useTrackCourseProgressMutation } from '../../../services/courseApi';
import { resetReadingScreen, setReadingScreen } from '../../../slice/ReadingScreenSlice';
import { showToast } from '../../../slice/toastSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import type { courseTabType, CurriculumMediaType } from '../../../types/course';
import type { MediaProps } from '../../../types/media';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '../../../utils/extractYoutubeVideoId';
import WaterMark from '../../../Watermark';

interface PlyrInstance {
    plyr?: APITypes;
}

const SpotifyAudioPlayer = ({ audioUrl, imageUrl, title }: { audioUrl: string, imageUrl: string, title: string }) => {
    return (
        <div
            style={{
                width: "100%",
                background: "#121212",
                borderRadius: "12px",
                padding: "16px",
                color: "white",
                height: "100%"
            }}
        >
            <Box sx={{ width: "100%", marginBottom: "12px", height: "calc(100% - 100px)" }}>
                <img
                    src={imageUrl}
                    alt="cover"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                    }}
                />
            </Box>

            <div className="audio__bottom">
                {title && (
                    <h3 style={{ margin: "8px 0", fontSize: "18px" }}>{title}</h3>
                )}

                {audioUrl ? (
                    <audio
                        controls
                        controlsList="nodownload"
                        src={audioUrl}
                        style={{
                            width: "100%",
                            borderRadius: "8px",
                        }}
                    />
                ) : (
                    <p>No audio available</p>
                )}
            </div>
        </div>
    );
};

export default function ReadingDialog() {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { fallbackImageUrl } = useThemeSettings();

    const { open, type, media, title, isYouTube, mediaId, courseId, playlistId, isDownloadable } = useAppSelector(
        state => state.readScreen
    );

    console.log(isDownloadable)

    const playerRef = useRef<PlyrInstance | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 15,
    });
    const [allMedia, setAllMedia] = useState<MediaProps[]>([]);


    const mediaUrl = media?.url || null;

    const videoRef = useRef<HTMLDivElement>(null);

    function switchType(type: CurriculumMediaType): courseTabType {
        switch (type) {
            case "temp_audios":
                return "audios";
            case "temp_video":
                return "videos";
            case "temp_notes":
                return "notes";
            default:
                return "videos";
        }
    }

    const { data, isFetching } = useGetCourseMediaByTypeQuery(
        { id: courseId!, type: switchType(type as CurriculumMediaType), qp: qp },
        { skip: !courseId || !open }
    );
    const { data: playlistVideos } = useGetSinglePlaylistQuery(
        { id: courseId!, type: switchType(type as CurriculumMediaType), ...qp, playlistId: Number(playlistId) },
        { skip: !courseId || !open || !playlistId }
    );
    const [updateProgress, { isLoading: markingAsCompleted }] = useTrackCourseProgressMutation();

    const mediaList = playlistId
        ? playlistVideos?.data?.data ?? []
        : data?.data?.data ?? [];

    const totalPages = data?.data?.pagination?.total_pages || 0;
    const currentPage = qp.pageIndex;
    const hasMore = currentPage < totalPages;

    useEffect(() => {
        if (mediaList.length > 0) {
            if (qp.pageIndex === 1) {
                setAllMedia(mediaList);
            } else {
                setAllMedia(prev => {
                    const existingIds = new Set(prev.map(v => v.id));
                    const newMedia = mediaList.filter(v => !existingIds.has(v.id));
                    return [...prev, ...newMedia];
                });
            }
        }
    }, [mediaList, qp.pageIndex]);

    useEffect(() => {
        if (open) {
            setQp({ pageIndex: 1, pageSize: 15 });
        }
    }, [open, courseId, type]);

    useEffect(() => {
        if (!open || !media?.id) return;

        const currentIndex = allMedia.findIndex(v => v.id === media?.id);
        if (currentIndex === -1) return;

        const remainingMedia = allMedia.length - currentIndex - 1;
        if (remainingMedia < 6 && hasMore && !isFetching) {
            setQp(prev => ({
                ...prev,
                pageIndex: prev.pageIndex + 1
            }));
        }
    }, [media?.id, allMedia.length, hasMore, isFetching, open]);

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if ((videoRef.current as any).webkitRequestFullscreen) {
                (videoRef.current as any).webkitRequestFullscreen();
            } else if ((videoRef.current as any).msRequestFullscreen) {
                (videoRef.current as any).msRequestFullscreen();
            }
        }
    };

    const handleClose = () => {
        if (playerRef.current?.plyr) {
            try {
                (playerRef.current.plyr as any).destroy?.();
            } catch (error) {
                console.error('Error destroying player:', error);
            }
        }
        dispatch(resetReadingScreen());
    };

    const applyYouTubeSecurityMeasures = () => {
        if (!containerRef.current) return;

        const iframe = containerRef.current.querySelector('iframe') as HTMLIFrameElement | null;
        if (!iframe) return;

        iframe.style.pointerEvents = 'none';
        iframe.style.userSelect = 'none';

        let overlay = containerRef.current.querySelector('.youtube-security-overlay') as HTMLElement | null;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'youtube-security-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: transparent;
                z-index: 20;
                pointer-events: auto;
                user-select: none;
            `;

            const videoWrapper = containerRef.current.querySelector('.plyr__video-wrapper') as HTMLElement | null;
            if (videoWrapper) {
                videoWrapper.appendChild(overlay);
            }
        }

        const plyrControls = containerRef.current.querySelector('.plyr__controls') as HTMLElement | null;
        if (plyrControls) {
            plyrControls.style.pointerEvents = 'auto';
            plyrControls.style.zIndex = '30';
        }
    };

    useEffect(() => {
        if (open && isYouTube) {
            const securityTimeout = setTimeout(() => {
                applyYouTubeSecurityMeasures();
                setIsLoading(false);
            }, 2000);

            const style = document.createElement('style');
            style.id = 'youtube-security-styles';
            style.textContent = `
                .youtube-security-overlay ~ iframe,
                .plyr__video-wrapper iframe {
                    pointer-events: none !important;
                }
                
                .plyr__video-wrapper::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: transparent;
                    z-index: 25;
                    pointer-events: auto;
                }
                
                .plyr__controls,
                .plyr__control {
                    z-index: 35 !important;
                    pointer-events: auto !important;
                }
            `;

            if (!document.querySelector('#youtube-security-styles')) {
                document.head.appendChild(style);
            }

            return () => {
                clearTimeout(securityTimeout);
                const styleElement = document.querySelector('#youtube-security-styles');
                if (styleElement) {
                    styleElement.remove();
                }
            };
        } else if (open) {
            setIsLoading(false);
        }
    }, [open, isYouTube]);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            if (playerRef.current?.plyr) {
                try {
                    (playerRef.current.plyr as any).destroy?.();
                } catch (error) {
                    console.error('Error destroying player:', error);
                }
            }
        };
    }, []);

    const handleRelatedVideoClick = (relatedVideo: MediaProps) => {
        const isYoutube = relatedVideo.url.includes('youtube.com') || relatedVideo.url.includes('youtu.be');
        const vidId = isYoutube ? extractYouTubeVideoId(relatedVideo.url) : null;

        dispatch(
            setReadingScreen({
                isYouTube: isYoutube,
                mediaId: vidId || undefined,
                media: relatedVideo,
                title: relatedVideo.file_name
            })
        );
    };

    const renderContent = () => {
        switch (type) {
            case 'temp_video':
                if (isYouTube && mediaId) {
                    if (isLoading || !mediaId) {
                        return (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '400px',
                                height: "100%",
                                backgroundColor: '#000',
                            }}>
                                <CircularProgress size={60} />
                            </div>
                        );
                    }

                    const plyrSource: PlyrProps['source'] = {
                        type: "video",
                        sources: [
                            {
                                src: mediaId,
                                provider: "youtube",
                            },
                        ],
                    };

                    const plyrOptions: PlyrProps['options'] = {
                        autoplay: false,
                        controls: [
                            'play-large',
                            'play',
                            'rewind',
                            'progress',
                            'fast-forward',
                            'current-time',
                            'duration',
                            'mute',
                            'volume',
                            'settings',
                        ],
                        keyboard: { focused: true, global: false },
                        clickToPlay: true,
                        disableContextMenu: true,
                        fullscreen: { enabled: true },
                        seekTime: 10,
                        youtube: {
                            noCookie: false,
                            rel: 0,
                            iv_load_policy: 3,
                            cc_load_policy: 0,
                            playsinline: 1,

                        },
                    };


                    return (
                        <div className='h-full' ref={containerRef}>
                            <Plyr
                                ref={playerRef as any}
                                source={plyrSource}
                                options={plyrOptions}
                            />
                        </div>
                    );
                } else if (mediaUrl) {
                    return <video controls src={mediaUrl} style={{ width: '100%' }} />;
                }
                return <p>No video available</p>;

            case 'temp_audios':
                return (
                    <SpotifyAudioPlayer
                        audioUrl={mediaUrl || ""}
                        imageUrl={fallbackImageUrl}
                        title="Sample Audio"
                    />
                );

            case 'temp_notes':
                return mediaUrl ? (
                    <iframe
                        className='h-full'
                        src={`${mediaUrl}${isDownloadable ? "" : "#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH"}`}
                        style={{ width: '100%', border: 'none' }}
                    />
                ) : (
                    <p>No PDF available</p>
                );

            default:
                return <p>Unsupported media type</p>;
        }
    };

    const getUpcomingMedia = () => {
        if (!media?.id || allMedia.length === 0) return [];

        const currentIndex = allMedia.findIndex(v => v.id === media?.id);
        if (currentIndex === -1) return allMedia.slice(0, 6);

        const upcomingItems = allMedia.slice(currentIndex + 1, currentIndex + 7);

        if (upcomingItems.length < 6 && !hasMore) {
            return allMedia.slice(-6);
        }

        return upcomingItems;
    };

    if (!open) {
        return null;
    }

    const upcomingMedia = getUpcomingMedia();
    const currentMediaId = media?.id;

    const handleMarkAsCompleted = async () => {
        try {
            await updateProgress({
                id: courseId!,
                body: {
                    media_id: media?.id!,
                    type: switchType(type as CurriculumMediaType),
                }
            });

        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || 'Failed to mark as completed',
                    severity: 'error'
                })
            )
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            sx={{
                "& .MuiPaper-root": {
                    background: theme.palette.primary.contrastText,
                    borderRadius: '16px'
                },
            }}
        >
            <DialogContent sx={{ padding: '24px' }}>
                <div className='mb-4 flex flex-wrap justify-between items-end'>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                        {title || 'Media Viewer'}
                    </h2>
                    <div className="flex justify-end items-center gap-4">
                        <Button variant="contained" onClick={handleFullscreen} startIcon={<Maximize2 />}>
                            Fullscreen Zoom
                        </Button>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 gap-4">
                    <div className="col-span-9 max-h-[500px] overflow-auto">
                        <div className="h-full overflow-auto" ref={videoRef}>
                            <WaterMark />
                            {renderContent()}
                        </div>
                    </div>
                    <div className="hidden lg:block col-span-3">
                        <Typography variant='subtitle1' className='block! mb-3!' sx={{ fontWeight: 600 }}>
                            Up Next
                        </Typography>
                        <Box className="flex flex-col gap-3" sx={{
                            maxHeight: `440px`,
                            overflowY: "auto",
                        }}>
                            {upcomingMedia.length > 0 ? (
                                upcomingMedia.map((relatedVideo) => {
                                    const vidId = extractYouTubeVideoId(relatedVideo.url);
                                    const thumbnailUrl = vidId ? getYouTubeThumbnail(vidId) : '';
                                    const isCurrentlyPlaying = relatedVideo.id === currentMediaId;

                                    return (
                                        <div
                                            key={relatedVideo.id}
                                            onClick={() => !isCurrentlyPlaying && handleRelatedVideoClick(relatedVideo)}
                                            className='cursor-pointer'
                                            style={{
                                                opacity: isCurrentlyPlaying ? 0.6 : 1,
                                                pointerEvents: isCurrentlyPlaying ? 'none' : 'auto',
                                                border: isCurrentlyPlaying ? `2px solid ${theme.palette.primary.main}` : 'none',
                                                borderRadius: '8px',
                                                padding: isCurrentlyPlaying ? '4px' : '0',
                                                position: 'relative'
                                            }}
                                        >
                                            {isCurrentlyPlaying && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        backgroundColor: theme.palette.primary.main,
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        zIndex: 10
                                                    }}
                                                >
                                                    Now Playing
                                                </Box>
                                            )}
                                            <div style={{
                                                position: 'relative',
                                                paddingBottom: '56.25%',
                                                background: '#000',
                                                borderRadius: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    src={thumbnailUrl || fallbackImageUrl}
                                                    alt={relatedVideo.file_name}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                            <Tooltip title={relatedVideo.file_name}>
                                                <Typography
                                                    variant='subtitle1'
                                                    className='font-bold mt-1! line-clamp-1'
                                                    sx={{
                                                        color: isCurrentlyPlaying ? theme.palette.primary.main : 'inherit'
                                                    }}
                                                >
                                                    {relatedVideo.file_name}
                                                </Typography>
                                            </Tooltip>
                                        </div>
                                    );
                                })
                            ) : (
                                <Typography variant="subtitle2" color="text.middle">
                                    {isFetching ? 'Loading more...' : 'No upcoming media available'}
                                </Typography>
                            )}
                        </Box>
                    </div>
                </div>

                <div className='flex flex-col gap-4 md:flex md:flex-row-reverse mt-4'>
                    <Button variant='contained' className='primary__btn' onClick={handleMarkAsCompleted} disabled={markingAsCompleted}  >
                        {markingAsCompleted ? t("messages.marking_as_completed") : t("messages.mark_as_completed")}
                    </Button>
                    <Button variant='contained' onClick={handleClose} className='cancel__btn'>
                        {t("actions.cancel")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}