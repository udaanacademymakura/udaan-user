import { useState } from "react";
import { useGetAllIndividualTestQuery } from "../../../../services/testApi";
import { EmptyList } from "../../../molecules/EmptyList";
import TablePagination from "../../../molecules/Pagination";
import ExploreTestCard from "../../../organism/Cards/ExploreTestCard";
import TableFilter from "../../../organism/TableFilter";

export default function ExploreAllTest() {
    const [search, setSearch] = useState("")
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 12
    })

    const { data } = useGetAllIndividualTestQuery({
        ...qp, search: search
    });

    return (
        <>
            <div className="top__header mt-4">
                <TableFilter search={search} setSearch={setSearch} />
            </div>
            <div className="explore_all__test__root h-full overflow-auto pt-4 pr-2">
                {data && data?.data?.data?.length > 0 ? <>
                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 lg:gap-4 ">
                        {data?.data?.data?.map((test) => (
                            <ExploreTestCard
                                test={test}
                                key={test.id}
                            />
                        ))}
                    </div>

                </>
                    : <EmptyList
                        title="No Test Found"
                        description="There are no tests available for the selected course."
                    />}
            </div>
            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />
        </>
    )
}
