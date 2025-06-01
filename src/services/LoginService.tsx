import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UserRequest, AuthorizeUserResponse, User } from "../types/user";

// Define a service using a base URL and expected endpoints
export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8012/" }),
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
  }),
});

export const {
  useGetUserQuery,
  useAuthorizeUserMutation,
  useRegisterUserMutation,
} = loginApi;
