import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const QUIZ_API = "http://localhost:8080/api/v1/quiz";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({
    baseUrl: QUIZ_API,
    credentials: "include",
  }),
  tagTypes: ["Quiz", "QuizAttempt"],
  endpoints: (builder) => ({
    getQuizByCourse: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [{ type: 'Quiz', id: courseId }],
    }),
    saveQuiz: builder.mutation({
      query: ({ courseId, quizData }) => ({
        url: `/course/${courseId}`,
        method: "POST",
        body: quizData,
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Quiz', id: courseId }],
    }),
    getQuizForStudent: builder.query({
      query: (courseId) => ({
        url: `/student/course/${courseId}`,
        method: "GET",
      }),
    }),
    submitQuiz: builder.mutation({
        query: ({ courseId, answers }) => ({
            url: `/course/${courseId}/submit`,
            method: 'POST',
            body: { answers },
        }),
        invalidatesTags: ["QuizAttempt"],
    }),
    getQuizResult: builder.query({
        query: (attemptId) => ({
            url: `/result/${attemptId}`,
            method: 'GET'
        }),
        providesTags: (result, error, attemptId) => [{ type: 'QuizAttempt', id: attemptId }],
    }),
    sendCertificate: builder.mutation({
        query: (attemptId) => ({
            url: `../certificate/${attemptId}/send`, 
            method: 'POST',
        }),
    }),
  }),
});

export const {
  useGetQuizByCourseQuery,
  useSaveQuizMutation,
  useGetQuizForStudentQuery,
  useSubmitQuizMutation,
  useGetQuizResultQuery,
  useSendCertificateMutation,
} = quizApi;
