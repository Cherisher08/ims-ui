import { RentalOrderInfo } from "../types/order";
import { rootApi } from "./ApiService";
import {
  transformRentalOrderResponse,
  transformRentalOrderToUTC,
} from "./transformFunctions";

export const contactApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getRentalOrders: build.query<RentalOrderInfo[], void>({
      query: () => `http://127.0.0.1:8000/orders/rentals`,
      providesTags: ["Rental"],
    }),
    createRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: (order) => {
        const body = transformRentalOrderToUTC(order);
        return {
          url: `http://127.0.0.1:8000/orders/rentals`,
          method: "POST",
          body: body,
        };
      },
      invalidatesTags: ["Rental"],
    }),
    getRentalOrderById: build.query<RentalOrderInfo, string>({
      query: (id) => `http://127.0.0.1:8000/orders/rentals/${id}`,
      transformResponse: (response: RentalOrderInfo) =>
        transformRentalOrderResponse(response),
      providesTags: ["Rental"],
    }),
    updateRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: ({ _id, ...order }) => {
        const body = transformRentalOrderToUTC(order);
        return {
          url: `http://127.0.0.1:8000/orders/rentals/${_id}`,
          method: "PUT",
          body: body,
        };
      },
      invalidatesTags: ["Rental"],
    }),
    deleteRentalOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `http://127.0.0.1:8000/orders/rentals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rental"],
    }),
    getExpiredRentalOrders: build.query<RentalOrderInfo[], void>({
      query: () => `http://127.0.0.1:8000/orders/rentals/expired`,
      providesTags: ["Rental"],
    }),
  }),
});

export const {
  useGetRentalOrderByIdQuery,
  useGetRentalOrdersQuery,
  useCreateRentalOrderMutation,
  useUpdateRentalOrderMutation,
  useDeleteRentalOrderMutation,
  useLazyGetExpiredRentalOrdersQuery,
} = contactApi;
