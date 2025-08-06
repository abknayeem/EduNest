import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ADMIN_API = "http://localhost:8080/api/v1/admin";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_API,
    credentials: "include",
  }),
  tagTypes: [
    "AdminStats",
    "Instructors",
    "Users",
    "AdminCourses",
    "CategoryStats",
    "AdminAnalytics",
    "Transactions",
    "QuizAttempts",
    "UserProgress",
    "PlatformFinancials",
  ],
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => ({ url: "/stats" }),
      providesTags: ["AdminStats"],
    }),
    getPlatformAnalytics: builder.query({
      query: ({ period, categoryPeriod }) =>
        `/analytics?period=${period}&categoryPeriod=${categoryPeriod}`,
      providesTags: ["AdminAnalytics"],
    }),
    getPlatformFinancials: builder.query({
      query: (period = "all") => `/financials?period=${period}`,
      providesTags: ["PlatformFinancials"],
    }),
    getAllInstructors: builder.query({
      query: () => ({ url: "/instructors" }),
      providesTags: ["Instructors"],
    }),
    getAllUsers: builder.query({
      query: () => ({ url: "/users" }),
      providesTags: ["Users"],
    }),
    getUserDetailsForAdmin: builder.query({
      query: (userId) => `/users/${userId}/details`,
      providesTags: (r, e, arg) => [{ type: "Users", id: arg }],
    }),
    createUserByAdmin: builder.mutation({
      query: (userData) => ({
        url: "/users/create",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users", "Instructors"],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users", "Instructors"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({ url: `/users/${userId}`, method: "DELETE" }),
      invalidatesTags: ["Users", "AdminStats", "Instructors"],
    }),
    getAllCoursesForAdmin: builder.query({
      query: () => ({ url: "/courses" }),
      providesTags: ["AdminCourses"],
    }),
    updateCoursePublicationStatus: builder.mutation({
      query: ({ courseId, isPublished }) => ({
        url: `/courses/${courseId}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      invalidatesTags: ["AdminCourses"],
    }),
    getCategoryStats: builder.query({
      query: () => ({ url: "/categories/stats" }),
      providesTags: ["CategoryStats"],
    }),
    deleteInstructor: builder.mutation({
      query: (instructorId) => ({
        url: `/instructors/${instructorId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Instructors", "Users"],
    }),
    getInstructorMonthlySales: builder.query({
      query: ({ instructorId, year }) =>
        `/instructors/${instructorId}/analytics?year=${year}`,
    }),
    getInstructorDetails: builder.query({
      query: (instructorId) => `/instructors/${instructorId}/details`,
      providesTags: (r, e, arg) => [{ type: "Instructors", id: arg }],
    }),
    getAllTransactions: builder.query({
      query: ({ month, year }) => {
        let u = "/transactions";
        const p = new URLSearchParams();
        if (month) p.append("month", month);
        if (year) p.append("year", year);
        if (p.toString()) {
          u += `?${p.toString()}`;
        }
        return { url: u };
      },
      providesTags: ["Transactions"],
    }),
    getPendingRequestsCount: builder.query({
      query: () => ({ url: "/pending-requests/count" }),
      providesTags: ["Users"],
    }),
    refuseInstructorRequest: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/refuse-instructor`,
        method: "PATCH",
      }),
      invalidatesTags: ["Users"],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, isDisabled }) => ({
        url: `/users/${userId}/status`,
        method: "PATCH",
        body: { isDisabled },
      }),
      invalidatesTags: ["Users", "Instructors"],
    }),
    getQuizAttemptsForUser: builder.query({
      query: (userId) => ({
        url: `/quiz-attempts?studentId=${userId}`,
        method: "GET",
      }),
      providesTags: ["QuizAttempts"],
    }),
    getUserCourseProgress: builder.query({
      query: ({ userId, courseId }) => ({
        url: `/users/${userId}/progress/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, { userId, courseId }) => [
        { type: "UserProgress", id: `${userId}-${courseId}` },
      ],
    }),
    getPlatformFinancialsReport: builder.query({
      query: ({ period, format }) => ({
        url: `/financials/report?period=${period}&format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetPlatformAnalyticsQuery,
  useGetPlatformFinancialsQuery,
  useGetAllInstructorsQuery,
  useGetAllUsersQuery,
  useGetUserDetailsForAdminQuery,
  useCreateUserByAdminMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAllCoursesForAdminQuery,
  useUpdateCoursePublicationStatusMutation,
  useGetCategoryStatsQuery,
  useDeleteInstructorMutation,
  useGetInstructorMonthlySalesQuery,
  useGetInstructorDetailsQuery,
  useGetAllTransactionsQuery,
  useGetPendingRequestsCountQuery,
  useRefuseInstructorRequestMutation,
  useUpdateUserStatusMutation,
  useGetQuizAttemptsForUserQuery,
  useGetUserCourseProgressQuery,
  useGetPlatformFinancialsReportQuery,
} = adminApi;
