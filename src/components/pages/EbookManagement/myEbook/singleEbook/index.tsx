import { Box, Button, Chip, CircularProgress, Divider, Paper, Skeleton, Typography } from "@mui/material";
import { CloudPlus, DocumentDownload, DocumentText, Lock, Trash, WifiSquare } from "iconsax-reactjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useOfflineEbook } from "../../../../../hooks/useOfflineEbook";
import { PATH } from "../../../../../routes/PATH";
import { useDownloadEbookMutation, useGetEbookByIdQuery } from "../../../../../services/ebookApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import { getApiErrorMessage } from "../../../../../utils/apiError";
import { formatFileSize } from "../../../../../utils/convertToMb";
import { formatDate } from "../../../../../utils/dateFormat";
import { triggerBlobDownload } from "../../../../../utils/offlineEbookStore";
import { renderHtml } from "../../../../../utils/renderHtml";
import DocumentReader from "../../../../organism/Dialog/PdfReader";
import PageHeader from "../../../../organism/PageHeader";

export default function SingleMyEbook() {
    const { id } = useParams();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [savingOffline, setSavingOffline] = useState(false);

    const { data, isLoading } = useGetEbookByIdQuery({ id: Number(id) }, { skip: !id });
    const [downloadEbook, { isLoading: downloading }] = useDownloadEbookMutation();
    const { offlineUrl, isSavedOffline, isChecking, save, remove } = useOfflineEbook(Number(id));

    const ebook = data?.data;
    const fileName = ebook?.file_name || `${ebook?.title || "ebook"}.pdf`;
    const readerUrl = offlineUrl || ebook?.file_url || "";
    const canDownload = Boolean(ebook?.is_downloadable);

    const handleDownload = async () => {
        try {
            const blob = await downloadEbook({ id: Number(id) }).unwrap();
            triggerBlobDownload(blob, fileName);
            dispatch(showToast({ message: "Download started", severity: "success" }));
        } catch (e) {
            dispatch(showToast({ message: getApiErrorMessage(e, "Unable to download this eBook."), severity: "error" }));
        }
    };

    const handleSaveOffline = async () => {
        setSavingOffline(true);
        try {
            const blob = await downloadEbook({ id: Number(id) }).unwrap();
            await save(blob, ebook?.title || "", fileName);
            dispatch(showToast({ message: "Saved for offline reading", severity: "success" }));
        } catch (e) {
            dispatch(showToast({ message: getApiErrorMessage(e, "Unable to save this eBook offline."), severity: "error" }));
        } finally {
            setSavingOffline(false);
        }
    };

    const handleRemoveOffline = async () => {
        try {
            await remove();
            dispatch(showToast({ message: "Removed from offline storage", severity: "success" }));
        } catch (e) {
            dispatch(showToast({ message: getApiErrorMessage(e, "Unable to remove the offline copy."), severity: "error" }));
        }
    };

    if (isLoading) {
        return (
            <div className="h-full overflow-auto pr-2">
                <Skeleton variant="rectangular" height={48} className="mb-4" sx={{ borderRadius: "8px" }} />
                <Skeleton variant="rectangular" height={520} sx={{ borderRadius: "8px" }} />
            </div>
        );
    }

    return (
        <>
            <PageHeader
                breadcrumb={[
                    { title: t("menus.ebook.my_ebooks"), url: PATH.EBOOK.MY_EBOOK.ROOT },
                    { title: ebook?.title || "" },
                ]}
            />
            <div className="h-full overflow-auto pr-2 pb-6">
                <Paper
                    className="p-4 rounded-md mb-6 flex flex-wrap items-center justify-between gap-4"
                    sx={{ background: (theme) => theme.palette.primary.light, boxShadow: "none" }}
                >
                    <div>
                        <Typography variant="h5" fontWeight={700} className="mb-1!">{ebook?.title}</Typography>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-1 items-center">
                                <Box sx={{ color: (theme) => theme.palette.info.main }}>
                                    <DocumentText variant="Bold" size={18} />
                                </Box>
                                <Typography variant="subtitle2">
                                    {ebook?.total_pages ? `${ebook.total_pages} pages` : "PDF"}
                                </Typography>
                            </div>
                            {ebook?.file_size ? (
                                <>
                                    <Divider orientation="vertical" className="h-3.5!" />
                                    <Typography variant="caption" color="text.middle">{formatFileSize(ebook.file_size)}</Typography>
                                </>
                            ) : null}
                            <Divider orientation="vertical" className="h-3.5!" />
                            <Typography variant="caption" color="text.middle">
                                {t("messages.published_date")}: {formatDate(ebook?.created_at || "")}
                            </Typography>
                            {canDownload ? (
                                isSavedOffline && (
                                    <Chip
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        icon={<WifiSquare size={14} />}
                                        label="Available offline"
                                    />
                                )
                            ) : (
                                <Chip size="small" color="warning" variant="outlined" icon={<Lock size={14} />} label="Read only" />
                            )}
                        </div>
                    </div>

                    {canDownload ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={downloading && !savingOffline ? <CircularProgress size={16} color="inherit" /> : <DocumentDownload />}
                                onClick={handleDownload}
                                disabled={downloading || savingOffline}
                            >
                                {downloading && !savingOffline ? "Downloading..." : "Download"}
                            </Button>

                            {isChecking ? (
                                <Button variant="contained" color="primary" disabled startIcon={<CircularProgress size={16} color="inherit" />}>
                                    Checking...
                                </Button>
                            ) : isSavedOffline ? (
                                <Button variant="outlined" color="error" startIcon={<Trash />} onClick={handleRemoveOffline}>
                                    Remove Offline Copy
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={savingOffline ? <CircularProgress size={16} color="inherit" /> : <CloudPlus />}
                                    onClick={handleSaveOffline}
                                    disabled={savingOffline}
                                >
                                    {savingOffline ? "Saving..." : "Save Offline"}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Typography variant="subtitle2" color="text.middle">
                            This eBook is available for online reading only.
                        </Typography>
                    )}
                </Paper>

                <Box
                    className="reader__wrapper rounded-md overflow-hidden p-2"
                    sx={{ border: (theme) => `1px solid ${theme.palette.separator.dark}` }}
                >
                    {readerUrl ? (
                        <DocumentReader fileUrl={readerUrl} />
                    ) : (
                        <Typography color="text.middle" className="text-center p-8">
                            This eBook file is not available right now.
                        </Typography>
                    )}
                </Box>

                {ebook?.description ? (
                    <>
                        <Typography variant="h4" className="mt-8!" fontWeight={600}>About this eBook</Typography>
                        <Divider className="mt-3! mb-4!" />
                        <div className="general__content__box">{renderHtml(ebook.description)}</div>
                    </>
                ) : null}
            </div>
        </>
    );
}
