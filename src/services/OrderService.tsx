import { RentalOrderInfo } from "../types/order";
import { rootApi } from "./ApiService";

export const contactApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getRentalOrders: build.query<RentalOrderInfo[], void>({
      query: () => `orders/rentals`,
      providesTags: ["Rental"],
    }),
    createRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: (body) => ({
        url: `orders/rentals`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Rental"],
    }),
    getRentalOrderById: build.query<RentalOrderInfo, string>({
      query: (id) => `orders/rentals/${id}`,
    }),
    updateRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: (body) => ({
        url: `orders/rentals`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Rental"],
    }),
    deleteRentalOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `orders/rentals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rental"],
    }),
  }),
});

export const {
  useGetRentalOrderByIdQuery,
  useGetRentalOrdersQuery,
  useCreateRentalOrderMutation,
  useUpdateRentalOrderMutation,
  useDeleteRentalOrderMutation,
} = contactApi;
