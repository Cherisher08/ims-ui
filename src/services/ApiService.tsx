import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  UserRequest,
  AuthorizeUserResponse,
  User,
  GeneralResponse,
  UpdateUserPasswordRequest,
} from "../types/user";
import { Product, VerifyOtpRequest } from "../types/common";

// Define a service using a base URL and expected endpoints
export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Product"],
  endpoints: (build) => ({
    getUser: build.query<User, void>({
      query: () => `auth/users/me`,
    }),
    authorizeUser: build.mutation<AuthorizeUserResponse, UserRequest>({
      query: ({ email, password }) => ({
        url: `auth/users/tokens`,
        method: "POST",
        body: new URLSearchParams({
          grant_type: "password",
          username: email,
          password,
        }),
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
    getProducts: build.query<Product[], void>({
      query: () => `products`,
      providesTags: ["Product"],
    }),
    createProduct: build.mutation<Product, Product>({
      query: (body) => ({
        url: `products`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Product"],
    }),
    getProductById: build.query<Product, string>({
      query: (id) => `products/${id}`,
    }),
    updateProduct: build.mutation<Product, Product>({
      query: ({ _id, ...product }) => ({
        url: `products/${_id}`,
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
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
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
} = loginApi;
