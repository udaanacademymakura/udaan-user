import { createApi } from "@reduxjs/toolkit/query/react";
import type { QueryParams } from "../types";
import type { GorkhapatraList, GorkhapatraProps, GorkhapatraTypes } from "../types/gorkhapatra";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseQuery } from "./baseQuery";

export const gorkhapatraApi = createApi({
    reducerPath: "gorkhapatraApi",
    baseQuery: baseQuery,
    tagTypes: ["Gorkhapatra"],
    endpoints: (builder) => ({

        getAllGorkhapatra: builder.query<GorkhapatraList, QueryParams & { type?: GorkhapatraTypes; days?: number | null; status?: "" | "draft" | "published" }>({
            query: ({ pageIndex, pageSize, search, status, type, }) => {
                const params = buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search,
                    status: status,
                    type: type,
                });

                return {
                    url: `/gorkhapatra?${params}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.data?.data
                    ? [
                        ...result.data.data.map((gorkhapatra) => ({ type: "Gorkhapatra" as const, id: gorkhapatra.id })),
                        { type: "Gorkhapatra", id: "LIST" },
                    ]
                    : [{ type: "Gorkhapatra", id: "LIST" }],
        }),

        getGorkhapatraById: builder.query<{ data: GorkhapatraProps }, { id: number }>({
            query: ({ id }) => ({
                url: `/gorkhapatra/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Gorkhapatra", id }],
        }),

        relatedGorkhapatra: builder.query<{ data: GorkhapatraProps[] }, { id: number }>({
            query: ({ id }) => ({
                url: `/gorkhapatra/${id}/related`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Gorkhapatra", id }],
        }),

        downloadGorkhapatra: builder.mutation<Blob, { id: number }>({
            query: ({ id }) => ({
                url: `/gorkhapatra/${id}/download`,
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
        }),
    })
})

export const {
    useGetAllGorkhapatraQuery,
    useGetGorkhapatraByIdQuery,
    useRelatedGorkhapatraQuery,
    useDownloadGorkhapatraMutation
} = gorkhapatraApi;