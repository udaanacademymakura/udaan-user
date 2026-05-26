import { Box, Divider, IconButton, Typography } from "@mui/material";
import { DocumentCopy, Medal, MedalStar, TickCircle } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetUserBundlesQuery, useGetUserBunldeAnalyticsQuery } from "../../../../services/testApi";
import TablePagination from "../../../molecules/Pagination";
import BundleCard from "../../../organism/Cards/BundleCard";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";


export default function MyBundles() {
    const [search, setSearch] = useState("")
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 12
    })
    const { t } = useTranslation();
    let placeholderIndex = 0;

    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    const [customRange, _setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const [days, _setDays] = useState<number | null>(null);



    const { data, isLoading } = useGetUserBundlesQuery({
        ...qp, search: debouncedSearch,
        ...customRange,
        days,
    });

    const { data: analytics } = useGetUserBunldeAnalyticsQuery();

    const bundles = data?.data?.data || [];

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    // const variant = "primary"
    return (
        <Box className="flex flex-col justify-between overflow-hidden h-full">
            <div className="top__header mt-4 pb-1">
                <PageHeader
                    breadcrumb={[
                        { title: t("messages.my_bundles") }
                    ]}
                />
            </div>
            <div className="body__wrapper h-full overflow-auto  ">
                {analytics && analytics?.data.length > 0 ? <div className="bunlde__analytics flex flex-col gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4 mb-6 lg:mb-8">
                    {analytics?.data?.map((analytic) => (
                        <div className="col-span-1 h-full" key={analytic.title}>
                            <Box sx={{
                                height: "100%",
                                borderRadius: "8px",
                                padding: "16px 24px",
                                border: (theme) => `1px solid ${theme.palette[analytic.type].main}`,
                                borderLeft: (theme) => `4px solid ${theme.palette[analytic.type].main}`,
                            }}>
                                <Typography variant="h5" fontWeight={500}>{analytic.title}</Typography>
                                <Divider className="my-3!" />
                                <div className="flex justify-between">
                                    <div className="content">
                                        <Typography variant="h3" fontWeight={500}>{analytic.value}</Typography>
                                        <Typography variant="subtitle2" color={analytic.type}>{analytic.description}</Typography>
                                    </div>
                                    <IconButton color={analytic.type}>
                                        {analytic.type == "info" ? <DocumentCopy /> : analytic.type === "warning" ? <Medal /> : analytic.type === "success" ? <TickCircle /> : <MedalStar />}
                                    </IconButton>
                                </div>
                            </Box>
                        </div>
                    ))}
                </div> : ""}

                <div className="filter flex flex-col gap-4 md:grid grid-cols-2">
                    <TableFilter search={search} setSearch={setSearch} />
                </div>
                <div className="page__content__area ">
                    <div className="individual__root">
                        {!isLoading && !bundles.length ?
                            <EmptyRoute
                                title='Test Not Found'
                                message='Oops your test is empty. Please add question to help student gain knowlegde.'
                                icon={(
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 4.84969V16.7397C22 17.7097 21.21 18.5997 20.24 18.7197L19.93 18.7597C18.29 18.9797 15.98 19.6597 14.12 20.4397C13.47 20.7097 12.75 20.2197 12.75 19.5097V5.59969C12.75 5.22969 12.96 4.88969 13.29 4.70969C15.12 3.71969 17.89 2.83969 19.77 2.67969H19.83C21.03 2.67969 22 3.64969 22 4.84969Z" fill="#1D82F5" />
                                        <path d="M10.7102 4.70969C8.88023 3.71969 6.11023 2.83969 4.23023 2.67969H4.16023C2.96023 2.67969 1.99023 3.64969 1.99023 4.84969V16.7397C1.99023 17.7097 2.78023 18.5997 3.75023 18.7197L4.06023 18.7597C5.70023 18.9797 8.01023 19.6597 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.21969 11.0402 4.88969 10.7102 4.70969ZM5.00023 7.73969H7.25023C7.66023 7.73969 8.00023 8.07969 8.00023 8.48969C8.00023 8.90969 7.66023 9.23969 7.25023 9.23969H5.00023C4.59023 9.23969 4.25023 8.90969 4.25023 8.48969C4.25023 8.07969 4.59023 7.73969 5.00023 7.73969ZM8.00023 12.2397H5.00023C4.59023 12.2397 4.25023 11.9097 4.25023 11.4897C4.25023 11.0797 4.59023 10.7397 5.00023 10.7397H8.00023C8.41023 10.7397 8.75023 11.0797 8.75023 11.4897C8.75023 11.9097 8.41023 12.2397 8.00023 12.2397Z" fill="#1D82F5" />
                                    </svg>
                                )}
                            /> : (
                                <Box className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 py-2">
                                    {bundles.map((item) => {
                                        let currentPlaceholderIndex = -1;

                                        if (!item.thumbnail_url) {
                                            currentPlaceholderIndex = placeholderIndex;
                                            placeholderIndex++;
                                        }

                                        return (
                                            <BundleCard
                                                key={item.id}
                                                data={item}
                                                placeholderIndex={currentPlaceholderIndex}
                                                havePurchased={true}
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                    </div>
                    <div className="pagination_wrapper mt-4">
                        <TablePagination
                            qp={qp}
                            setQp={setQp}
                            totalPages={data?.data?.pagination?.total_pages || 0}
                        />
                    </div>
                </div>
            </div>
        </Box>
    )
}
