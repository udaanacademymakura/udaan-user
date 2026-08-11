import { Box, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllCategoryQuery } from "../../../../services/categoryApi";
import { useGetAllEbookQuery } from "../../../../services/ebookApi";
import TablePagination from "../../../molecules/Pagination";
import TabController from "../../../molecules/TabController";
import EbookCard from "../../../organism/Cards/EbookCard";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

export default function ExploreEbook() {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 12 });
    const [activeCategory, setActiveCategory] = useState(0);
    const [options, setOptions] = useState<{ label: string; value: number }[]>([]);

    const { data: categories } = useGetAllCategoryQuery({ pageIndex: 1, pageSize: 10 });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setQp((prev) => ({ ...prev, pageIndex: 1 }));
        }, 1000);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const list = categories?.data || [];
        setOptions([
            { label: "All", value: 0 },
            ...list.map((category) => ({ label: category.name, value: Number(category?.id) })),
        ]);
    }, [categories]);

    const { data, isLoading } = useGetAllEbookQuery({
        ...qp,
        search: debouncedSearch,
        ...(activeCategory !== 0 && {
            categoryFilter: { mega_category: [activeCategory] },
        }),
    });

    const ebooks = data?.data?.data || [];
    let placeholderIndex = 0;

    return (
        <>
            <PageHeader
                breadcrumb={[{ title: t("menus.ebook.explore") }]}
                description="Browse and purchase eBooks curated for your preparation."
            />
            <div className="top__header pb-1 flex flex-col gap-4 md:grid md:grid-cols-12">
                <div className="col-span-7">
                    <TabController
                        options={options}
                        currentActive={activeCategory}
                        setActiveTab={(val) => {
                            setActiveCategory(val);
                            setQp((prev) => ({ ...prev, pageIndex: 1 }));
                        }}
                    />
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-4">
                    <TableFilter search={search} setSearch={setSearch} />
                </div>
            </div>

            <div className="explore__ebook__root h-full overflow-auto pr-2">
                {isLoading ? (
                    <Box className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 py-2">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: "8px" }} />
                        ))}
                    </Box>
                ) : !ebooks.length ? (
                    <EmptyRoute
                        title={t("messages.empty_states.ebook.title")}
                        message={t("messages.empty_states.ebook.description")}
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
                                    havePurchased={item.has_purchased}
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
