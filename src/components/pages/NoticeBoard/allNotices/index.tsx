import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllNotificationsQuery } from "../../../../services/notificationApi";
import TablePagination from "../../../molecules/Pagination";
import NoticeCard from "../../../organism/Cards/NoticeCard";
import EmptyRoute from "../../../organism/EmptyRoute";
import PageHeader from "../../../organism/PageHeader";
import TableFilter from "../../../organism/TableFilter";

export default function AllNotices() {
    const { t } = useTranslation();
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

    const { data, isLoading } = useGetAllNotificationsQuery({ ...qp, type: "notice_board", search: debouncedSearch });
    const notifications = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    return (
        <div className="all__notice__root h-full overflow-hidden flex flex-col p-2">
            <div className="page__top mb-6">
                <PageHeader
                    breadcrumb={[
                        { title: t("messages.notice") }
                    ]}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                />
            </div>

            {
                !isLoading && !notifications.length ? <EmptyRoute
                    title={t("messages.empty_states.notification.title")}
                    message={t("messages.empty_states.notification.description")}
                /> : (
                    <>
                        <Box className="table__wrapper h-full" sx={{
                            overflow: "auto"
                        }}>
                            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 ">
                                {notifications.map((notice) => (
                                    <NoticeCard
                                        data={notice} key={notice.title + notice.id}
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
