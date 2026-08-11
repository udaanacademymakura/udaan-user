import type { CategoryFilterParams, Pagination, QueryParams } from ".";

export type EbookDiscountType = "percentage" | "amount";

export interface EbookProps {
    id: number;
    title: string;
    description: string;
    is_downloadable: boolean;
    price: string;
    discount: number;
    discount_type: EbookDiscountType;
    marked_price: string;
    sale_price: string;
    thumbnail_url?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    total_pages?: number;
    mega_categories?: string[];
    categories?: string[];
    has_purchased?: boolean;
    is_saved?: boolean;
    downloads?: number;
    purchased_at?: string;
    created_at?: string;
}

export interface EbookList {
    data: {
        data: EbookProps[];
        pagination: Pagination;
    };
}

export interface EbookDetailResponse {
    data: EbookProps;
}

export type EbookQueryParams = QueryParams & {
    categoryFilter?: CategoryFilterParams;
};
