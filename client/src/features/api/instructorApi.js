import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const INSTRUCTOR_API = "http://localhost:8080/api/v1/instructor";

export const instructorApi = createApi({
  reducerPath: "instructorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: INSTRUCTOR_API,
    credentials: "include",
  }),
  tagTypes: [
    "EnrolledStudents",
    "InstructorAnalytics",
    "QuizAttempts",
    "StudentProgress",
    "InstructorFinancials",
  ],
  endpoints: (builder) => ({
    getEnrolledStudents: builder.query({
      query: () => ({ url: "/students", method: "GET" }),
      providesTags: ["EnrolledStudents"],
    }),
    getInstructorAnalytics: builder.query({
      query: (period) => ({
        url: `/analytics?period=${period}`,
        method: "GET",
      }),
      providesTags: ["InstructorAnalytics"],
    }),
    getInstructorFinancials: builder.query({
      query: (period = "all") => ({
        url: `/financials?period=${period}`,
        method: "GET",
      }),
      providesTags: ["InstructorFinancials"],
    }),
    getQuizAttemptsByCourse: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/quiz-attempts`,
        method: "GET",
      }),
      providesTags: ["QuizAttempts"],
    }),
    getStudentProgress: builder.query({
      query: ({ courseId, studentId }) => ({
        url: `/student-progress/${courseId}/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, { studentId, courseId }) => [
        { type: "StudentProgress", id: `${studentId}-${courseId}` },
      ],
    }),
    getInstructorFinancialsReport: builder.query({
      query: ({ period, format }) => ({
        url: `/financials/report?period=${period}&format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetEnrolledStudentsQuery,
  useGetInstructorAnalyticsQuery,
  useGetInstructorFinancialsQuery,
  useGetQuizAttemptsByCourseQuery,
  useGetStudentProgressQuery,
  useGetInstructorFinancialsReportQuery,
} = instructorApi;
