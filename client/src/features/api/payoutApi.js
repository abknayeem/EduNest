import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PAYOUT_API = "http://localhost:8080/api/v1/payout";

export const payoutApi = createApi({
  reducerPath: "payoutApi",
  baseQuery: fetchBaseQuery({ baseUrl: PAYOUT_API, credentials: "include" }),
  tagTypes: ["Payouts", "User", "PayoutHistory"],
  endpoints: (builder) => ({
    requestPayout: builder.mutation({
      query: (payoutData) => ({ url: "/request", method: "POST", body: payoutData }),
      invalidatesTags: ["User", "PayoutHistory"],
    }),
    getPendingPayouts: builder.query({
      query: () => "/pending",
      providesTags: ["Payouts"],
    }),
    completePayout: builder.mutation({
      query: (payoutId) => ({ url: `/${payoutId}/complete`, method: "PATCH" }),
      invalidatesTags: ["Payouts"],
    }),
    declinePayout: builder.mutation({
        query: ({ payoutId, reason }) => ({
            url: `/${payoutId}/decline`,
            method: 'PATCH',
            body: { reason }
        }),
        invalidatesTags: ["Payouts"]
    }),
    getPayoutHistory: builder.query({
        query: () => '/history',
        providesTags: ['PayoutHistory']
    }),
    getAllPayoutHistory: builder.query({
        query: () => '/history/all',
        providesTags: ['Payouts']
    })
  }),
});

export const {
  useRequestPayoutMutation,
  useGetPendingPayoutsQuery,
  useCompletePayoutMutation,
  useDeclinePayoutMutation,
  useGetPayoutHistoryQuery,
  useGetAllPayoutHistoryQuery,
} = payoutApi;