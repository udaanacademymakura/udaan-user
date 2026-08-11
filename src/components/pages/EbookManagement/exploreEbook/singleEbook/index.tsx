import { Box, Button, Chip, Divider, Paper, Skeleton, Typography } from "@mui/material";
import { DocumentText, Lock, ShoppingCart } from "iconsax-reactjs";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../../../routes/PATH";
import { useGetEbookByIdQuery, useGetRelatedEbooksQuery } from "../../../../../services/ebookApi";
import { formatFileSize } from "../../../../../utils/convertToMb";
import { formatDate } from "../../../../../utils/dateFormat";
import { renderHtml } from "../../../../../utils/renderHtml";
import EbookCard from "../../../../organism/Cards/EbookCard";
import PageHeader from "../../../../organism/PageHeader";

export default function SingleExploreEbook() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data, isLoading } = useGetEbookByIdQuery({ id: Number(id) }, { skip: !id });
    const { data: related } = useGetRelatedEbooksQuery({ id: Number(id) }, { skip: !id });

    const ebook = data?.data;
    const isFree = Number(ebook?.sale_price) <= 0;
    const relatedEbooks = related?.data || [];

    if (isLoading) {
        return (
            <div className="h-full overflow-auto pr-2">
                <Skeleton variant="rectangular" height={48} className="mb-4" sx={{ borderRadius: "8px" }} />
                <Skeleton variant="rectangular" height={360} sx={{ borderRadius: "8px" }} />
            </div>
        );
    }

    return (
        <>
            <PageHeader
                breadcrumb={[
                    { title: t("menus.ebook.explore"), url: PATH.EBOOK.EXPLORE_EBOOK.ROOT },
                    { title: ebook?.title || "" },
                ]}
            />
            <div className="h-full overflow-auto pr-2 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4">
                        <Box
                            className="image__wrapper aspect-3/4 lg:aspect-square rounded-md overflow-hidden relative flex items-center justify-center"
                            sx={{ background: (theme) => theme.palette.primary.dark }}
                        >
                            {ebook?.thumbnail_url ? (
                                <img src={ebook.thumbnail_url} alt={ebook.title} className="w-full h-full object-cover" />
                            ) : (
                                <Typography variant="h4" color="primary.contrastText" fontWeight={600} className="text-center px-4">
                                    {ebook?.title}
                                </Typography>
                            )}
                            <Box
                                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                                sx={{ background: "rgba(0,0,0,0.45)" }}
                            >
                                <Lock size={32} color="#fff" variant="Bold" />
                                <Typography variant="subtitle2" color="primary.contrastText">
                                    Purchase to read this eBook
                                </Typography>
                            </Box>
                        </Box>
                    </div>

                    <div className="lg:col-span-8">
                        <Typography variant="h3" fontWeight={700} className="mb-2!">{ebook?.title}</Typography>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {ebook?.mega_categories?.map((category) => (
                                <Chip key={category} label={category} size="small" color="primary" variant="outlined" />
                            ))}
                            {ebook?.categories?.map((category) => (
                                <Chip key={category} label={category} size="small" variant="outlined" />
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
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
                        </div>

                        <Paper
                            className="p-4 rounded-md flex flex-wrap items-center justify-between gap-4"
                            sx={{ background: (theme) => theme.palette.primary.light, boxShadow: "none" }}
                        >
                            <div className="price__wrapper">
                                <Typography variant="caption" color="primary" fontWeight={500}>{t("messages.price")}</Typography>
                                {isFree ? (
                                    <Typography variant="h4" color="success.main" fontWeight={700}>{t("messages.free")}</Typography>
                                ) : (
                                    <div className="flex items-end gap-2">
                                        <Typography variant="h4" color="primary" fontWeight={700}>
                                            {t("messages.npr")}{ebook?.sale_price}
                                        </Typography>
                                        {ebook?.discount ? (
                                            <>
                                                <Typography variant="subtitle1" color="error" className="line-through">
                                                    {t("messages.npr")}{ebook?.marked_price}
                                                </Typography>
                                                <Typography variant="subtitle2" color="success.main" fontWeight={500}>
                                                    {ebook.discount}{ebook.discount_type === "percentage" ? "%" : t("messages.npr")} {t("messages.off")}
                                                </Typography>
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {ebook?.has_purchased ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(PATH.EBOOK.MY_EBOOK.VIEW_EBOOK.ROOT(Number(id)))}
                                >
                                    Read Now
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<ShoppingCart />}
                                    onClick={() =>
                                        navigate(PATH.COURSE_MANAGEMENT.COURSES.PURCHASE.ROOT(Number(id), "ebook"))
                                    }
                                >
                                    {t("messages.purchase_now")}
                                </Button>
                            )}
                        </Paper>
                    </div>
                </div>

                <Typography variant="h4" className="mt-8!" fontWeight={600}>Description</Typography>
                <Divider className="mt-3! mb-4!" />
                <div className="general__content__box">{renderHtml(ebook?.description || "")}</div>

                {relatedEbooks.length > 0 && (
                    <>
                        <Typography variant="h4" className="mt-8!" fontWeight={600}>Related eBooks</Typography>
                        <Divider className="mt-3! mb-4!" />
                        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {relatedEbooks.map((item) => (
                                <EbookCard key={item.id} data={item} havePurchased={item.has_purchased} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
