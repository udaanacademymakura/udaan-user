import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetAllCategoryQuery } from "../../../../../services/categoryApi";
import { useGetAllBundleQuery } from "../../../../../services/testApi";
import TablePagination from "../../../../molecules/Pagination";
import TabController from "../../../../molecules/TabController";
import BundleCard from "../../../../organism/Cards/BundleCard";
import EmptyRoute from "../../../../organism/EmptyRoute";
import TableFilter from "../../../../organism/TableFilter";

export default function ExploreBundle() {
    const [search, setSearch] = useState("")
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 12
    })
    let placeholderIndex = 0;

    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    const [customRange, _setCustomRange] = useState({
        startDate: "",
        endDate: ""
    });
    const { data: categories } = useGetAllCategoryQuery({ pageIndex: 1, pageSize: 10 });

    const [days, _setDays] = useState<number | null>(null);
    const [options, setOptions] = useState<{ label: string; value: number }[]>([]);
    const [activeCategory, setActiveCategory] = useState(0);


    const { data, isLoading } = useGetAllBundleQuery({
        ...qp, search: debouncedSearch,
        ...customRange,
        days,
        ...(activeCategory !== 0 && {
            categoryFilter: {
                mega_category: [activeCategory],
            },
        })
    });

    const bundles = data?.data?.data || [];

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const list = categories?.data || [];

        const formatted = list.map((category) => ({
            label: category.name,
            value: Number(category?.id),
        }));

        setOptions([{ label: "All", value: 0 }, ...formatted]);
    }, [categories]);

    return (
        <>
            <div className="top__header mt-4 pb-1 flex flex-col gap-4 md:grid md:grid-cols-12">
                <div className="col-span-7">
                    <TabController
                        options={options}
                        currentActive={activeCategory}
                        setActiveTab={(val) => setActiveCategory(val)}
                    />
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-4">
                    <TableFilter search={search} setSearch={setSearch} />
                </div>
            </div>
            <div className="individual__root h-full overflow-auto pr-2">
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
                        <Box className="overflow-auto flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4  py-2">
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
                                    />
                                );
                            })}
                        </Box>
                    )}
            </div>
            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />
        </>
    )
}
