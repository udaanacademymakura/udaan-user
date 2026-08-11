import { createApi } from "@reduxjs/toolkit/query/react";
import type { EbookDetailResponse, EbookList, EbookQueryParams } from "../types/ebook";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseQuery } from "./baseQuery";

export const ebookApi = createApi({
    reducerPath: "ebookApi",
    baseQuery: baseQuery,
    tagTypes: ["Ebook", "MyEbook"],
    endpoints: (builder) => ({
        getAllEbook: builder.query<EbookList, EbookQueryParams>({
            query: ({ pageIndex, pageSize, search, categoryFilter }) => {
                const params = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    mega_categories: categoryFilter?.mega_category,
                    categories: categoryFilter?.category,
                    sub_categories: categoryFilter?.sub_category,
                    positions: categoryFilter?.positions,
                });

                return { url: `/ebook?${params}`, method: "GET" };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((ebook) => ({ type: "Ebook" as const, id: ebook.id })),
                        { type: "Ebook", id: "LIST" },
                    ]
                    : [{ type: "Ebook", id: "LIST" }],
        }),
        getMyEbooks: builder.query<EbookList, EbookQueryParams>({
            query: ({ pageIndex, pageSize, search, categoryFilter }) => {
                const params = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    mega_categories: categoryFilter?.mega_category,
                    categories: categoryFilter?.category,
                    sub_categories: categoryFilter?.sub_category,
                    positions: categoryFilter?.positions,
                });

                return { url: `/my-ebook?${params}`, method: "GET" };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((ebook) => ({ type: "MyEbook" as const, id: ebook.id })),
                        { type: "MyEbook", id: "LIST" },
                    ]
                    : [{ type: "MyEbook", id: "LIST" }],
        }),
        getEbookById: builder.query<EbookDetailResponse, { id: number }>({
            query: ({ id }) => ({ url: `/ebook/${id}`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "Ebook", id }],
        }),
        getRelatedEbooks: builder.query<{ data: EbookList["data"]["data"] }, { id: number }>({
            query: ({ id }) => ({ url: `/ebook/${id}/related`, method: "GET" }),
            providesTags: (_result, _error, { id }) => [{ type: "Ebook", id }],
        }),
        downloadEbook: builder.mutation<Blob, { id: number }>({
            query: ({ id }) => ({
                url: `/ebook/${id}/download`,
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: "MyEbook", id }],
        }),
    }),
});

export const {
    useGetAllEbookQuery,
    useGetMyEbooksQuery,
    useGetEbookByIdQuery,
    useGetRelatedEbooksQuery,
    useDownloadEbookMutation,
} = ebookApi;
