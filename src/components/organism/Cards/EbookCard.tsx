import { Box, Button, Paper, Typography } from "@mui/material";
import { ArrowRight, Book, Buildings, Calendar, DocumentText, UserEdit } from "iconsax-reactjs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import type { EbookProps } from "../../../types/ebook";
import { formatDate } from "../../../utils/dateFormat";
import { formatFileSize } from "../../../utils/convertToMb";
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
    const hasDiscount =
        Number(data?.discount) > 0 && Number(data?.marked_price) > Number(data?.sale_price);
    const publishedDate = data?.published_date || data?.created_at || "";
    const detailUrl = havePurchased
        ? PATH.EBOOK.MY_EBOOK.VIEW_EBOOK.ROOT(data.id)
        : PATH.EBOOK.EXPLORE_EBOOK.VIEW_EBOOK.ROOT(data.id);

    const goToDetail = () => navigate(detailUrl);

    return (
        <Paper
            onClick={goToDetail}
            className="ebook__card group relative h-full overflow-hidden flex flex-col cursor-pointer"
            sx={{
                borderRadius: "12px",
                background: (theme) => theme.palette.primary.contrastText,
                boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.20)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 20px 0 rgba(0, 0, 0, 0.18)",
                },
            }}
        >
            <Box
                className="cover__wrapper aspect-16/10 overflow-hidden relative"
                sx={{ background: (theme) => theme.palette.primary.dark }}
            >
                <img
                    src={data?.thumbnail_url || fallbackImage}
                    alt={data.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {!data?.thumbnail_url && (
                    <Box className="absolute inset-0 flex items-center justify-center text-white/45">
                        <Book variant="Bold" size={56} />
                    </Box>
                )}
                <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)",
                    }}
                />

                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    {data?.mega_categories?.length ? (
                        <Typography
                            variant="caption"
                            className="line-clamp-1"
                            sx={{
                                padding: "3px 12px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.25)",
                                border: "1px solid rgba(255,255,255,0.35)",
                                backdropFilter: "blur(6px)",
                                color: "#fff",
                            }}
                        >
                            {data.mega_categories[0]}
                        </Typography>
                    ) : (
                        <span />
                    )}

                    {havePurchased ? (
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            className="shrink-0"
                            sx={{
                                padding: "4px 10px",
                                borderRadius: "999px",
                                background: (theme) => theme.palette.primary.contrastText,
                                color: (theme) => theme.palette.primary.main,
                            }}
                        >
                            Owned
                        </Typography>
                    ) : hasDiscount ? (
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            className="shrink-0"
                            sx={{
                                padding: "4px 10px",
                                borderRadius: "999px",
                                background: (theme) => theme.palette.success.main,
                                color: (theme) => theme.palette.success.contrastText,
                            }}
                        >
                            {data.discount}
                            {data.discount_type === "percentage" ? "%" : t("messages.npr")} {t("messages.off")}
                        </Typography>
                    ) : null}
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <Typography
                        variant="caption"
                        className="flex items-center gap-1"
                        sx={{
                            padding: "3px 10px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.25)",
                            border: "1px solid rgba(255,255,255,0.35)",
                            backdropFilter: "blur(6px)",
                            color: "#fff",
                        }}
                    >
                        <DocumentText variant="Bold" size={14} />
                        {data?.total_pages ? `${data.total_pages} pages` : "PDF"}
                    </Typography>
                    {data?.file_size ? (
                        <Typography
                            variant="caption"
                            sx={{
                                padding: "3px 10px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.25)",
                                border: "1px solid rgba(255,255,255,0.35)",
                                backdropFilter: "blur(6px)",
                                color: "#fff",
                            }}
                        >
                            {formatFileSize(data.file_size)}
                        </Typography>
                    ) : null}
                </div>
            </Box>

            <div className="content flex-1 py-3 px-4">
                <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.dark"
                    className="line-clamp-2 min-h-12"
                    title={data?.title}
                >
                    {data?.title}
                </Typography>
                {data?.author ? (
                    <Typography
                        variant="subtitle2"
                        color="primary"
                        fontWeight={500}
                        className="flex items-center gap-1 mt-1! line-clamp-1"
                    >
                        <UserEdit size={14} variant="Bold" />
                        {data.author}
                    </Typography>
                ) : null}
                {data?.publisher ? (
                    <Typography
                        variant="caption"
                        color="text.middle"
                        className="flex items-center gap-1 mt-1! line-clamp-1"
                    >
                        <Buildings size={14} />
                        {data.publisher}
                    </Typography>
                ) : null}
                <Typography
                    variant="caption"
                    color="text.middle"
                    className="flex items-center gap-1 mt-1!"
                >
                    <Calendar size={14} />
                    {t("messages.published_date")}: {formatDate(publishedDate)}
                </Typography>
            </div>

            <Box
                className="card__bottom py-2.5 px-4 flex justify-between items-center flex-wrap gap-2"
                sx={{ background: (theme) => theme.palette.primary.light }}
            >
                {havePurchased ? (
                    <div className="owned__wrapper">
                        <Typography variant="overline" color="primary" fontWeight={500}>
                            Available offline
                        </Typography>
                        <Typography variant="subtitle2" color="text.dark" fontWeight={600}>
                            {data?.purchased_at ? formatDate(data.purchased_at) : "Ready to read"}
                        </Typography>
                    </div>
                ) : (
                    <div className="price__wrapper">
                        <Typography variant="overline" color="primary" fontWeight={500} className="block">
                            {t("messages.price")}
                        </Typography>
                        {isFree ? (
                            <Typography variant="subtitle1" color="success.main" fontWeight={600}>
                                {t("messages.free")}
                            </Typography>
                        ) : (
                            <div className="flex items-end gap-1">
                                <Typography variant="subtitle1" color="text.dark" fontWeight={600}>
                                    {t("messages.npr")}{data?.sale_price}
                                </Typography>
                                {hasDiscount ? (
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
                    onClick={(e) => {
                        e.stopPropagation();
                        goToDetail();
                    }}
                    endIcon={havePurchased ? <ArrowRight size={18} /> : undefined}
                >
                    {havePurchased ? t("messages.continue") : t("messages.purchase_now")}
                </Button>
            </Box>
        </Paper>
    );
}
