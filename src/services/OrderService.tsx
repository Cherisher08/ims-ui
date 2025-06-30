import { RentalOrderInfo } from "../types/order";
import { rootApi } from "./ApiService";
import { transformRentalOrderResponse } from "./transformFunctions";

export const contactApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getRentalOrders: build.query<RentalOrderInfo[], void>({
      query: () => `orders/rentals`,
      providesTags: ["Rental"],
    }),
    createRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: (contact) => ({
        url: `orders/rentals`,
        method: "POST",
        body: contact,
      }),
      invalidatesTags: ["Rental"],
    }),
    getRentalOrderById: build.query<RentalOrderInfo, string>({
      query: (id) => `orders/rentals/${id}`,
      transformResponse: (response: RentalOrderInfo) =>
        transformRentalOrderResponse(response),
      providesTags: ["Rental"],
    }),
    updateRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: ({ _id, ...order }) => ({
        url: `orders/rentals/${_id}`,
        method: "PUT",
        body: order,
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
