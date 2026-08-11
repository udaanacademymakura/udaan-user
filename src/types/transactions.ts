import type { Pagination } from ".";
import type { PaymentMethods, PurchaseModuleTypes } from "./purchase";
import type { GlobalResponse } from "./user";

export interface TransactionProps {
    id: number;
    course_name: string;
    module_type?: PurchaseModuleTypes;
    payment_method: string;
    purchased_date: string;
    amount_paid: number;
    invoice_id: string;
    status: "success" | "failed" | "pending";
}


export interface TransactionsResponse extends GlobalResponse {
    data: {
        data: TransactionProps[];
        pagination: Pagination;
    }
}

export interface ReciptProps {
    amount: number;
    thumbnail_url: string;
    name: string;
    published_date: string;
    transaction_id: string;
    created_at: string;
    payment_method: PaymentMethods;
    status: "success" | "failed" | "pending";
    download_url: string;
    mega_categories: string[]
}