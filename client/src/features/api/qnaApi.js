import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const QNA_API = "http://localhost:8080/api/v1/qna";

export const qnaApi = createApi({
    reducerPath: "qnaApi",
    baseQuery: fetchBaseQuery({
        baseUrl: QNA_API,
        credentials: "include",
    }),
    tagTypes: ["Qna", "CourseQna"],
    endpoints: (builder) => ({
        getQuestions: builder.query({
            query: (lectureId) => `/lecture/${lectureId}/questions`,
            providesTags: (result, error, lectureId) => [{ type: 'Qna', id: lectureId }],
        }),
        getQuestionsForCourse: builder.query({
            query: (courseId) => `/course/${courseId}/questions`,
            providesTags: (result, error, courseId) => [{ type: 'CourseQna', id: courseId }],
        }),
        addQuestion: builder.mutation({
            query: ({ lectureId, ...data }) => ({
                url: `/lecture/${lectureId}/questions`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { lectureId, courseId }) => [
                { type: 'Qna', id: lectureId },
                { type: 'CourseQna', id: courseId }
            ],
        }),
        addAnswer: builder.mutation({
            query: ({ questionId, ...data }) => ({
                url: `/questions/${questionId}/answers`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { lectureId, courseId }) => [
                { type: 'Qna', id: lectureId },
                { type: 'CourseQna', id: courseId }
            ],
        }),
        updateAnswer: builder.mutation({
            query: ({ answerId, content }) => ({
                url: `/answers/${answerId}`,
                method: 'PATCH',
                body: { content },
            }),
            invalidatesTags: (result, error, { courseId }) => [{ type: 'CourseQna', id: courseId }],
        }),
        deleteAnswer: builder.mutation({
            query: ({ answerId }) => ({
                url: `/answers/${answerId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { courseId }) => [{ type: 'CourseQna', id: courseId }],
        }),
    }),
});

export const {
    useGetQuestionsQuery,
    useGetQuestionsForCourseQuery,
    useAddQuestionMutation,
    useAddAnswerMutation,
    useUpdateAnswerMutation,
    useDeleteAnswerMutation,
} = qnaApi;
