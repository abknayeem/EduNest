import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CATEGORY_API = "http://localhost:8080/api/v1/category";

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: CATEGORY_API,
        credentials: "include",
    }),
    tagTypes: ["Categories"],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => ({
                url: "/",
                method: "GET",
            }),
            providesTags: ["Categories"],
        }),
        addCategory: builder.mutation({
            query: (newCategory) => ({
                url: "/",
                method: "POST",
                body: newCategory,
            }),
            invalidatesTags: ["Categories"],
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Categories"],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Categories"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useAddCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;