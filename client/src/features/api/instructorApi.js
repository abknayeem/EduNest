import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const INSTRUCTOR_API = "http://localhost:8080/api/v1/instructor";

export const instructorApi = createApi({
  reducerPath: "instructorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: INSTRUCTOR_API,
    credentials: "include",
  }),
  tagTypes: ["EnrolledStudents", "InstructorAnalytics", "QuizAttempts"],
  endpoints: (builder) => ({
    getEnrolledStudents: builder.query({
      query: () => ({ url: "/students", method: "GET" }),
      providesTags: ["EnrolledStudents"],
    }),
    getInstructorAnalytics: builder.query({
      query: (period) => ({ url: `/analytics?period=${period}`, method: "GET" }),
      providesTags: ["InstructorAnalytics"],
    }),
    getQuizAttemptsByCourse: builder.query({
        query: (courseId) => ({
            url: `/course/${courseId}/quiz-attempts`,
            method: 'GET'
        }),
        providesTags: ["QuizAttempts"]
    }),
  }),
});

export const { 
    useGetEnrolledStudentsQuery, 
    useGetInstructorAnalyticsQuery,
    useGetQuizAttemptsByCourseQuery
} = instructorApi;