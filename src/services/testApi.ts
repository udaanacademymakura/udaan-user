import { createApi } from "@reduxjs/toolkit/query/react";
import type { CategoryFilterParams, QueryParams } from "../types";
import type { AnalyticsList } from "../types/dashboard";
import type { McqReportData, McqSubmissionPayload, McqSubmissionResponse, QuestionTypeProps, SetList, SetOveriew, SetProps, SingleMcqResponse, TestList, TestProps } from "../types/question";
import type { GlobalResponse } from "../types/user";
import { buildQueryParams } from "../utils/buildQueryParams";
import { baseQuery } from "./baseQuery";

export const testApi = createApi({
    reducerPath: "testApi",
    baseQuery: baseQuery,
    tagTypes: ["Test", "Set"],
    endpoints: (builder) => ({
        getUserAllTest: builder.query<TestList, QueryParams & { id?: number, status?: string, type?: QuestionTypeProps }>({
            query: ({ id, pageIndex, pageSize, search, startDate, endDate, status, type }) => ({
                url: `my-test?${buildQueryParams({
                    page: pageIndex, page_size: pageSize, search, course_id: id, start_date: startDate,
                    end_date: endDate,
                    status,
                    type
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test" as const, id }],
        }),
        getUserIndividualTest: builder.query<TestList, QueryParams & { id?: number, status?: string, type: QuestionTypeProps }>({
            query: ({ id, pageIndex, pageSize, search, startDate, endDate, status, type }) => ({
                url: `my-individual?${buildQueryParams({
                    page: pageIndex, page_size: pageSize, search, course_id: id, start_date: startDate,
                    end_date: endDate,
                    status, type
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test" as const, id }],
        }),
        getUserBundles: builder.query<SetList, QueryParams & { id?: number, status?: string, days: number | null }>({
            query: ({ id, pageIndex, pageSize, search, startDate, endDate, status, days }) => ({
                url: `my-bundle?${buildQueryParams({
                    page: pageIndex, page_size: pageSize, search, course_id: id, start_date: startDate,
                    end_date: endDate,
                    status,
                    days
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Test" as const, id }],
        }),
        getTestById: builder.query<SingleMcqResponse, { courseId?: number; testId: number }>({
            query: ({ courseId, testId }) => ({
                url: `/test/${testId}${courseId ? `?course_id=${courseId}` : ''}`,
                method: "GET",
            }),
        }),
        submitMcq: builder.mutation<McqSubmissionResponse, { body: McqSubmissionPayload, courseId?: number; testId: number }>({
            query: ({ courseId, testId, body }) => ({
                url: `/test/${testId}/mcq${courseId ? `?course_id=${courseId}` : ''}`,
                method: "POST",
                body
            })
        }),
        uploadSubjectiveAnswers: builder.mutation<GlobalResponse & {
            data: {
                id: number;
                url: string
            }[]
        }, { courseId?: number; testId: number, questionId: number, body: FormData }>({
            query: ({ courseId, testId, questionId, body }) => ({
                url: `/test/${testId}/subjective/${questionId}/media${courseId ? `?course_id=${courseId}` : ''}`,
                method: "POST",
                body: body
            })
        }),
        getSubjectiveAnswer: builder.query<GlobalResponse & {
            data: {
                id: number;
                url: string
            }[]
        }, { courseId?: number; testId: number, questionId: number }>({
            query: ({ courseId, testId, questionId }) => ({
                url: `/test/${testId}/subjective/${questionId}/media${courseId ? `?course_id=${courseId}` : ''}`,
                method: "GET",
            })
        }),
        deleteSubjectiveAnswers: builder.mutation<GlobalResponse & {
            data: {
                id: number;
                url: string
            }[]
        }, { courseId: number; testId: number, questionId: number, mediaId: number }>({
            query: ({ courseId, testId, questionId, mediaId }) => ({
                url: `/test/${testId}/subjective/${questionId}/media/${mediaId}${courseId ? `?course_id=${courseId}` : ''}`,
                method: "DELETE",
            })
        }),
        reviewTestResult: builder.query<{ data: McqReportData }, { courseId?: number; testId: number }>({
            query: ({ courseId, testId }) => ({
                url: `/test/${testId}/review${courseId ? `?course_id=${courseId}` : ''}`,
                method: "GET",
            })
        }),
        reviewSubjectiveTestResult: builder.query<{ data: any }, { courseId?: number; testId: number }>({
            query: ({ courseId, testId }) => ({
                url: `/test/${testId}/review/subjective${courseId ? `?course_id=${courseId}` : ''}`,
                method: "GET",
            })
        }),
        submitSubjectiveFinal: builder.mutation<GlobalResponse, { courseId: number; testId: number, questionId: number, time_taken?: number }>({
            query: ({ courseId, testId, time_taken }) => ({
                url: `/test/${testId}/subjective/submit${courseId ? `?course_id=${courseId}` : ''}`,
                method: "POST",
                body: { time_taken },
            }),
            invalidatesTags: () => [{ id: "LIST", type: "Test" }]
        }),
        getTestResult: builder.query<GlobalResponse & McqSubmissionResponse, { courseId?: number; testId: number }>({
            query: ({ courseId, testId }) => ({
                url: `/test/${testId}/result${courseId ? `?course_id=${courseId}` : ''}`,
                method: "GET",
            })
        }),
        getTestSample: builder.query<GlobalResponse & {
            data: {
                sample: File | null;
                sample_url: string;
                video_url: string;
            }
        }, { id?: number | null }>({
            query: ({ id }) => ({
                url: `/test/${id}/sample`,
                method: "GET",
            }),
        }),
        getTestOverview: builder.query<GlobalResponse & {
            data: TestProps
        }, { id?: number | null }>({
            query: ({ id }) => ({
                url: `/test/${id}/overview`,
                method: "GET",
            }),
        }),
        getAllIndividualTest: builder.query<TestList, QueryParams & { type?: string }>({
            query: ({ pageIndex, pageSize, search, type }) => ({
                url: `/test?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search: search, type
                })}`
            }),
            providesTags: [{ type: "Test", id: "LIST" }]
        }),
        getAllBundle: builder.query<SetList, QueryParams & { type?: QuestionTypeProps; days?: number | null; categoryFilter?: CategoryFilterParams; }>({
            query: ({ pageIndex, pageSize, search, categoryFilter }) => ({
                url: `/bundle?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    search,
                    mega_categories: categoryFilter?.mega_category,
                })}`,
                method: "GET",
            }),
            providesTags: [{ type: "Set", id: "LIST" }]
        }),
        getBundleById: builder.query<{ data: SetProps }, { id: number }>({
            query: ({ id }) => ({
                url: `/bundle/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Set", id }]
        }),
        getBundleByOverview: builder.query<{ data: SetOveriew }, { id: number }>({
            query: ({ id }) => ({
                url: `/bundle/${id}/overview`,
                method: "GET"
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Set", id }]
        }),
        getTestRelatedToBundle: builder.query<TestList, QueryParams & QueryParams & { id?: number, status?: string, type?: QuestionTypeProps }>({
            query: ({ id, pageIndex, pageSize, type, status }) => ({
                url: `/bundle/${id}/selected-test?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    type, status
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Set", id }]
        }),
        getUserPurchasedTestRelatedToBundle: builder.query<TestList, QueryParams & QueryParams & { id?: number, status?: string, type?: QuestionTypeProps }>({
            query: ({ id, pageIndex, pageSize, type, status }) => ({
                url: `/my-bundle/${id}/test?${buildQueryParams({
                    page: pageIndex,
                    page_size: pageSize,
                    type, status
                })}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: "Set", id }]
        }),
        getUserBunldeAnalytics: builder.query<AnalyticsList, void>({
            query: () => ({
                url: `/my-bundle/analytics`,
                method: "GET"
            })
        }),
    })
})

export const {
    useGetUserAllTestQuery,
    useGetUserIndividualTestQuery,
    useGetUserBundlesQuery,
    useGetTestByIdQuery,
    useSubmitMcqMutation,
    useReviewTestResultQuery,
    useUploadSubjectiveAnswersMutation,
    useDeleteSubjectiveAnswersMutation,
    useGetSubjectiveAnswerQuery,
    useReviewSubjectiveTestResultQuery,
    useSubmitSubjectiveFinalMutation,
    useGetTestResultQuery,
    useGetTestSampleQuery,
    useGetAllIndividualTestQuery,
    useGetTestOverviewQuery,
    useGetAllBundleQuery,
    useGetBundleByIdQuery,
    useGetBundleByOverviewQuery,
    useGetTestRelatedToBundleQuery,
    useGetUserPurchasedTestRelatedToBundleQuery,
    useGetUserBunldeAnalyticsQuery
} = testApi;