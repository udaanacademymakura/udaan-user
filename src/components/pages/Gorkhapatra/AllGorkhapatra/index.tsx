import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllGorkhapatraQuery } from "../../../../services/gorkhapatraApi";
import type { GorkhapatraTypes } from "../../../../types/gorkhapatra";
import TablePagination from "../../../molecules/Pagination";
import TabController from "../../../molecules/TabController";
import GorkhapatraCard from "../../../organism/Cards/GorkhapatraCard";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

export default function AllGorkhapatras() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<GorkhapatraTypes>("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 12,
    })

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useGetAllGorkhapatraQuery({
        ...qp,
        search: debouncedSearch,
        type: activeTab === "all" ? "" as GorkhapatraTypes : activeTab,
        status: "published",
    });

    const gorkhapatras = data?.data?.data || []
    const pagination = data?.data?.pagination;

    return (
        <div className="h-full overflow-hidden flex flex-col gap-4">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        { title: t("messages.gorkhapatra") }
                    ]}
                />
                <div className="mb-4">
                    <TabController
                        currentActive={activeTab}
                        setActiveTab={setActiveTab}
                        options={[
                            { label: "All", value: "all" },
                            { label: "Descriptive", value: "descriptive" },
                            { label: "Mcqs", value: "mcqs" },
                        ]}
                    />
                </div>
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                />
            </div>
            {
                !isLoading && !gorkhapatras.length ? <EmptyRoute
                    title={t("messages.empty_states.gorkhapatra.title")}
                    message={t("messages.empty_states.gorkhapatra.description")}
                /> : (
                    <>
                        <Box className="table__wrapper h-full" sx={{
                            overflow: "auto"
                        }}>
                            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                {gorkhapatras.map((gorkhapatra) => (
                                    <GorkhapatraCard
                                        data={gorkhapatra} key={gorkhapatra.title + gorkhapatra.id}
                                    />
                                ))}
                            </div>
                        </Box>
                        <TablePagination
                            qp={qp}
                            setQp={setQp}
                            totalPages={pagination?.total_pages || 0}
                        />
                    </>
                )
            }
        </div>
    )
}
