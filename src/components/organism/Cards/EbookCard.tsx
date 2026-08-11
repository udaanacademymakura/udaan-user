import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import { ArrowRight, DocumentText } from "iconsax-reactjs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import type { EbookProps } from "../../../types/ebook";
import { formatDate } from "../../../utils/dateFormat";
import { formatFileSize } from "../../../utils/convertToMb";
import { renderHtml } from "../../../utils/renderHtml";
import placeholder1 from "/blue-bg.png";
import placeholder2 from "/green-bg.png";
import placeholder3 from "/yellow-bg.png";

interface Props {
    data: EbookProps;
    placeholderIndex?: number;
    havePurchased?: boolean;
}

export default function EbookCard({ data, placeholderIndex = -1, havePurchased }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const placeholders = [placeholder1, placeholder2, placeholder3];
    const fallbackImage =
        placeholderIndex >= 0 ? placeholders[placeholderIndex % placeholders.length] : "/blue-bg.png";

    const isFree = Number(data.sale_price) <= 0;
    const detailUrl = havePurchased
        ? PATH.EBOOK.MY_EBOOK.VIEW_EBOOK.ROOT(data.id)
        : PATH.EBOOK.EXPLORE_EBOOK.VIEW_EBOOK.ROOT(data.id);

    return (
        <Paper
            className="relative overflow-hidden flex flex-col justify-between"
            sx={{
                borderRadius: "8px",
                background: (theme) => theme.palette.primary.contrastText,
                boxShadow: `0 2px 4px 0 rgba(0, 0, 0, 0.20)`,
            }}
        >
            <div className="card__top">
                <Box
                    className="image__wrapper aspect-347/147 rounded-sm rounded-b-none overflow-hidden relative"
                    sx={{ background: (theme) => theme.palette.primary.dark }}
                >
                    <img src={data?.thumbnail_url || fallbackImage} alt={data.title} className="w-full h-full object-cover" />
                    {!data?.thumbnail_url && (
                        <Typography
                            variant="h6"
                            fontWeight={500}
                            className="line-clamp-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center"
                        >
                            {data?.title}
                        </Typography>
                    )}
                    {data?.mega_categories?.length ? (
                        <Typography
                            variant="caption"
                            className="absolute top-3.5 left-3.5"
                            sx={{
                                padding: "3px 12px",
                                borderRadius: "8px",
                                background: "rgba(255,255,255,0.4)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                color: "#fff",
                            }}
                        >
                            {data.mega_categories[0]}
                        </Typography>
                    ) : null}

                    {!havePurchased && data?.discount ? (
                        <Typography
                            variant="subtitle2"
                            fontWeight={500}
                            className="absolute top-3.5 right-3.5"
                            sx={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: (theme) => theme.palette.success.light,
                                color: (theme) => theme.palette.success.main,
                                border: (theme) => `1px solid ${theme.palette.success.main}`,
                            }}
                        >
                            {data.discount}{data.discount_type === "percentage" ? "%" : t("messages.npr")} {t("messages.off")}
                        </Typography>
                    ) : null}
                </Box>

                <div className="content py-3 px-3.5">
                    <Typography variant="h6" fontWeight={600} className="line-clamp-2 mb-2!">{data?.title}</Typography>
                    <div className="line-clamp-2 mb-2.5 general__content__box [&_p]:m-0!">
                        {renderHtml(data?.description || "")}
                    </div>
                    <div className="flex flex-wrap items-center">
                        <div className="flex gap-1 items-center">
                            <Box sx={{ color: (theme) => theme.palette.info.main }}>
                                <DocumentText variant="Bold" size={18} />
                            </Box>
                            <Typography variant="subtitle2" fontWeight={400}>
                                {data?.total_pages ? `${data.total_pages} pages` : "PDF"}
                            </Typography>
                        </div>
                        {data?.file_size ? (
                            <>
                                <Divider orientation="vertical" className="mx-2! lg:mx-2! h-3.5!" />
                                <Typography variant="caption" color="text.middle">{formatFileSize(data.file_size)}</Typography>
                            </>
                        ) : null}
                        <Divider orientation="vertical" className="mx-2! lg:mx-2! h-3.5!" />
                        <Typography variant="caption" color="text.middle">
                            {t("messages.published_date")}: {formatDate(data?.created_at || "")}
                        </Typography>
                    </div>
                </div>
            </div>

            <Box
                className="card__bottom py-2.5 px-3.5 flex justify-between items-center flex-wrap gap-2"
                sx={{ background: (theme) => theme.palette.primary.light }}
            >
                {havePurchased ? (
                    <div className="owned__wrapper">
                        <Typography variant="overline" color="primary" fontWeight={500}>Available offline</Typography>
                        <Typography variant="subtitle2" color="text.dark" fontWeight={600}>
                            {data?.purchased_at ? formatDate(data.purchased_at) : "Ready to read"}
                        </Typography>
                    </div>
                ) : (
                    <div className="price__wrapper">
                        <Typography variant="caption" color="primary" fontWeight={500}>{t("messages.price")}</Typography>
                        {isFree ? (
                            <Typography variant="subtitle1" color="success.main" fontWeight={600}>{t("messages.free")}</Typography>
                        ) : (
                            <div className="flex items-end gap-1">
                                <Typography variant="subtitle1" color="text.dark" fontWeight={600}>
                                    {t("messages.npr")}{data?.sale_price}
                                </Typography>
                                {data?.discount ? (
                                    <Typography variant="caption" color="text.middle" className="line-through">
                                        {t("messages.npr")}{data?.marked_price}
                                    </Typography>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(detailUrl)}
                    endIcon={havePurchased ? <ArrowRight /> : ""}
                >
                    {havePurchased ? t("messages.continue") : t("messages.purchase_now")}
                </Button>
            </Box>
        </Paper>
    );
}
