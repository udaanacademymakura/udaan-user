import { Box, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PATH } from "../../../../routes/PATH";
import { useGetMyEbooksQuery } from "../../../../services/ebookApi";
import TablePagination from "../../../molecules/Pagination";
import EbookCard from "../../../organism/Cards/EbookCard";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

export default function MyEbooks() {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 12 });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setQp((prev) => ({ ...prev, pageIndex: 1 }));
        }, 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useGetMyEbooksQuery({ ...qp, search: debouncedSearch });

    const ebooks = data?.data?.data || [];
    let placeholderIndex = 0;

    return (
        <>
            <PageHeader
                breadcrumb={[{ title: t("menus.ebook.my_ebooks") }]}
                description="Read, download or save your eBooks for offline access."
            />
            <div className="top__header pb-1 flex justify-end">
                <div className="w-full md:max-w-[320px]">
                    <TableFilter search={search} setSearch={setSearch} />
                </div>
            </div>

            <div className="my__ebook__root h-full overflow-auto pr-2">
                {isLoading ? (
                    <Box className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 py-2">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: "8px" }} />
                        ))}
                    </Box>
                ) : !ebooks.length ? (
                    <EmptyRoute
                        title={t("messages.empty_states.my_ebook.title")}
                        message={t("messages.empty_states.my_ebook.description")}
                        cta={{ label: t("menus.ebook.explore"), url: PATH.EBOOK.EXPLORE_EBOOK.ROOT }}
                    />
                ) : (
                    <Box className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 py-2">
                        {ebooks.map((item) => {
                            let currentPlaceholderIndex = -1;
                            if (!item.thumbnail_url) {
                                currentPlaceholderIndex = placeholderIndex;
                                placeholderIndex++;
                            }
                            return (
                                <EbookCard
                                    key={item.id}
                                    data={item}
                                    placeholderIndex={currentPlaceholderIndex}
                                    havePurchased
                                />
                            );
                        })}
                    </Box>
                )}
            </div>

            <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
        </>
    );
}
