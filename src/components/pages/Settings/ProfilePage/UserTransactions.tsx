import { Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAllUserTransacionsQuery } from "../../../../services/courseApi";
import type { TransactionProps } from "../../../../types/transactions";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import { getModuleLabel } from "../../../../utils/moduleLabel";
import { getTransactionStatus } from "../../../../utils/statusMap";
import StatusPill from "../../../atom/StatusPill";
import UdaanTable from "../../../molecules/Table";

export default function UserTransactions() {
    const { t } = useTranslation();
    const [qp, _setQp] = useState({
        pageIndex: 1,
        pageSize: 50,
    });
    const { data, isLoading } = useGetAllUserTransacionsQuery({ ...qp });

    const courses = data?.data?.data || [];

    const columns = useMemo<ColumnDef<TransactionProps>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => (
                <Typography fontWeight={500} variant="subtitle1">
                    {row.index + 1 || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Purchased Item",
            accessorKey: "course_name",
            cell: ({ row }) => (
                <Tooltip title={row.original.course_name} arrow>
                    <Typography fontWeight={500} variant="subtitle1" className="line-clamp-1">
                        {row.original.course_name || "N/A"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Type",
            accessorKey: "module_type",
            cell: ({ row }) => (
                <Typography variant="subtitle1">{getModuleLabel(row.original.module_type)}</Typography>
            ),
        },
        {
            header: "Payment Method",
            accessorKey: "payment_method",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.payment_method || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Purchased Date",
            accessorKey: "purchased_date",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {formatDateForDisplay(row.original.purchased_date) || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Amount Paid",
            accessorKey: "amount_paid",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.amount_paid || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Invoice ID",
            accessorKey: "invoice_id",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.invoice_id || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <StatusPill status={row.original.status} variant={getTransactionStatus(row.original.status)} />
            ),
        },

    ], [qp])

    if (!courses.length) {
        return null;
    }
    return (
        <div className="user__transactions__root mt-6 lg:mt-8">
            <Typography className="mb-4!" variant="h5" fontWeight={600}>{t("messages.transaction_information")}</Typography>
            <UdaanTable
                data={courses}
                columns={columns}
                loading={isLoading}
            />
        </div>
    )
}
