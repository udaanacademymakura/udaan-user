import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import { UserEdit } from "iconsax-reactjs";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../../utils/dateFormat";

interface Props {
    vat: number;
    isLoading?: boolean;
    data?: any
}

export default function CoursePaymentCard({ vat, isLoading, data }: Props) {
    const theme = useTheme();
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                boxShadow: ` 0 2px 8px 0 rgba(0, 0, 0, 0.24)`
            }}
            className="rounded-md sm:py-6 sm:px-4"
        >
            <Box
                sx={{
                    background: theme.palette.primary.light,
                }}
                className="rounded-md lg:py-6 p-4 mb-4 flex justify-between items-center"
            >
                <div className="sm:flex items-center gap-4">
                    {data?.thumbnail_url ? <Box className="image__wrapper aspect-132/116 rounded-sm rounded-b-none overflow-hidden relative sm:w-[132px]" sx={{
                        background: (theme) => theme.palette.primary.dark
                    }}>
                        <img src={data.thumbnail_url} alt={data.name} className="w-full h-full object-cover" />
                        {data?.mega_categories?.length > 0 ? <Typography variant="caption" className="absolute top-3.5 left-3.5" sx={{
                            padding: "3px 12px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.4)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "#fff"
                        }}>{data?.mega_categories[0] || "Loksewa"}</Typography> : ""}
                    </Box> : ""}
                    <div className="content">
                        <Typography variant="h5" fontWeight={600} className="line-clamp-2 mb-1">{data?.name}</Typography>
                        {data?.author ? (
                            <Typography variant="subtitle2" color="primary" fontWeight={500} className="flex items-center gap-1 mb-1">
                                <UserEdit size={14} variant="Bold" />
                                {data.author}
                            </Typography>
                        ) : null}
                        <div className="flex items-center">
                            {data?.set_count ? <>
                                <Typography variant="caption" >{data?.set_count} Tests</Typography>
                                <Divider orientation="vertical" className="mx-2! lg:mx-2! h-3.5!" />
                            </> : ""}
                            <Typography variant="caption" color="text.dark">{t("messages.published_date")}: {formatDate(data?.published_date || data?.created_at || "")}</Typography>
                        </div>
                    </div>
                </div>
                <div className="pricing__wrapper">
                    <div className="flex items-end gap-1 mb-1">
                        <Typography variant="subtitle1" color="error" className="line-through">{t("messages.npr")}{data?.marked_price}</Typography>
                        {data?.discount ? <Typography variant="subtitle2" fontWeight={500} sx={{
                            color: (theme) => theme.palette.success.main,
                        }}>{data?.discount}{data?.discount_type === "percentage" ? "%" : t("messages.npr")} {t("messages.off")}</Typography> : ""}
                    </div>
                    <Typography variant="h4" color="primary" fontWeight={600}>{t("messages.npr")}{data?.sale_price}</Typography>
                </div>
            </Box>
            <Typography variant="body2" fontWeight={600} className=" mb-2!">
                Order Summary
            </Typography>

            <Divider
                className="mt-2! mb-3.5!"
                sx={{
                    borderColor: theme.palette.text.light,
                    borderStyle: "dashed"
                }}
            />

            <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2">
                    <Typography variant="subtitle1" color="text.middle">Model Price:</Typography>
                    <Typography variant="subtitle1" color="text.dark" fontWeight={600} className="text-end font-medium">
                        {t("messages.npr")} {data?.sale_price.toLocaleString()}
                    </Typography>
                </div>

                <div className="grid grid-cols-2">
                    <Typography variant="subtitle1" color="text.middle">VAT:</Typography>
                    <Typography variant="subtitle1" color="text.dark" fontWeight={600} className="text-end font-medium">
                        {t("messages.npr")} {vat.toLocaleString()}
                    </Typography>
                </div>

                <Divider
                    className=" mb-.5!"
                    sx={{
                        borderColor: theme.palette.text.light,
                        borderStyle: "dashed"
                    }}
                />

                <div className="grid grid-cols-2">
                    <Typography variant="subtitle1" color="text.middle">Total</Typography>
                    <Typography variant="subtitle1" color="text.dark" fontWeight={600} className="text-end font-medium">
                        {t("messages.npr")} {data?.sale_price + vat.toLocaleString()}
                    </Typography>
                </div>
            </div>

            <Button
                className="primary__btn mt-2.5!"
                type="submit"
                variant="contained"
                fullWidth
            >
                {isLoading ? "Proceeding Payment" : "Pay Now"}
            </Button>
            {/* <Button
                className="primary__btn mt-2.5!"
                variant="contained"
                fullWidth
            >
                Generate QR
            </Button> */}
        </Box>
    );
}
