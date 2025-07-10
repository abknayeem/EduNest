import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  tagTypes: ["User", "Transactions"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
        query: (passwordData) => ({
            url: "profile/change-password",
            method: "PUT",
            body: passwordData
        }),
        invalidatesTags: ["User"],
    }),
    getTransactionHistory: builder.query({
        query: () => ({
            url: "profile/transactions",
            method: "GET"
        }),
        providesTags: ["Transactions"]
    }),
    verifyEmail: builder.query({
      query: (token) => ({
        url: `verify-email/${token}`,
        method: "GET",
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, ...body }) => ({
        url: `reset-password/${token}`,
        method: "POST",
        body,
      }),
    }),
    requestInstructorRole: builder.mutation({
      query: () => ({
        url: "profile/request-instructor",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    verifyPassword: builder.mutation({
      query: (passwordData) => ({
        url: 'profile/verify-password',
        method: 'POST',
        body: passwordData,
      }),
    }),
  }),
});
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useVerifyEmailQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetTransactionHistoryQuery,
  useRequestInstructorRoleMutation,
  useVerifyPasswordMutation,
} = authApi;
