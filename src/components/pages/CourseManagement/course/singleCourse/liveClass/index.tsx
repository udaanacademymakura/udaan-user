import { useParams } from "react-router-dom";
import { setPurchase } from "../../../../../../slice/purchaseSlice";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hook";
import type { QueryParams } from "../../../../../../types";
import type { LiveClassList } from "../../../../../../types/liveClass";

import { EmptyList } from "../../../../../molecules/EmptyList";
import TablePagination from "../../../../../molecules/Pagination";
import LiveClassCard from "../../../../../organism/Cards/LiveClassCard";
import PageHeader from "../../../../../organism/PageHeader";

interface Props {
  data?: LiveClassList;
  isLoading: boolean;
  qp: QueryParams;
  setQp: (qp: QueryParams) => void;
  totalPages: number;
  havePurchased?: boolean;
}

export default function SingleCourseLiveClass({
  data,
  isLoading,
  qp,
  setQp,
  totalPages,
  havePurchased = false,
}: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { id } = useParams();

  const liveClasses = data?.data?.data ?? [];

  const getJoinLevel = (liveClassId: number) => {
    const seed = `${user?.id ?? "guest"}:${liveClassId}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) hash = ((hash * 31) + seed.charCodeAt(i)) | 0;
    return Math.abs(hash) % 6;
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading live classes...</div>;
  }

  if (!havePurchased) {
    return (
      <EmptyList
        title="Unlock Live Classes"
        description="Purchase this course to access all live classes, recordings, and upcoming sessions."
        cta={{ label: "Purchase Course" }}
        onClick={() =>
          dispatch(
            setPurchase({
              open: true,
              courseId: Number(id),
            })
          )
        }
      />
    );
  }

  if (liveClasses.length === 0) {
    return (
      <EmptyList
        title="No Live Classes Available"
        description="There are currently no live classes scheduled for this course. Please check back later!"
      />
    );
  }

  return (
    <div className="pb-4">
      <PageHeader
        breadcrumb={[
          {
            title: "Live Classes",
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map((liveClass) => (
            <LiveClassCard key={liveClass.id} data={liveClass} joinLevel={getJoinLevel(liveClass.id)} />
          ))}
        </div>

        {totalPages > 1 && (
          <TablePagination
            qp={qp}
            setQp={setQp}
            totalPages={totalPages}
          />
        )}
      </div>
    </div>
  );
}
