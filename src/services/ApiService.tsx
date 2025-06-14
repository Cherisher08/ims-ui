import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  UserRequest,
  AuthorizeUserResponse,
  User,
  GeneralResponse,
  UpdateUserPasswordRequest,
} from "../types/user";
import { VerifyOtpRequest } from "../types/common";

// Define a service using a base URL and expected endpoints
export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000/" }),
  endpoints: (build) => ({
    getUser: build.query<User, null>({
      query: () => `auth/users/me`,
    }),
    authorizeUser: build.mutation<AuthorizeUserResponse, UserRequest>({
      query: ({ ...user }) => ({
        url: `auth/users/tokens`,
        method: "POST",
        body: user,
      }),
    }),
    registerUser: build.mutation<User, User>({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: ({ _id, ...user }) => ({
        url: `auth/users/`,
        method: "POST",
        body: user,
      }),
    }),
    resetPassword: build.mutation<GeneralResponse, string>({
      query: (email) => ({
        url: `auth/users/reset`,
        method: "POST",
        body: {
          email: email,
        },
      }),
    }),
    verifyOtp: build.mutation<GeneralResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "auth/users/otp",
        method: "POST",
        body: body,
      }),
    }),
    updateUserPassword: build.mutation<User, UpdateUserPasswordRequest>({
      query: (body) => ({
        url: `auth/users/update`,
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const {
  useGetUserQuery,
  useAuthorizeUserMutation,
  useRegisterUserMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
  useUpdateUserPasswordMutation,
} = loginApi;
