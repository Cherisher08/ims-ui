import { setExpiredRentalOrders } from "../store/OrdersSlice";
import { PatchPayload } from "../types/common";
import { RentalOrderInfo } from "../types/order";
import { rootApi } from "./ApiService";
import {
  transformRentalOrderResponse,
  transformRentalOrderToUTC,
} from "./transformFunctions";

export const contactApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getRentalOrders: build.query<RentalOrderInfo[], void>({
      query: () => `orders/rentals`,
      providesTags: ["Rental"],
    }),
    createRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: (order) => {
        const body = transformRentalOrderToUTC(order);
        return {
          url: `orders/rentals`,
          method: "POST",
          body: body,
        };
      },
      invalidatesTags: ["Rental"],
    }),
    getRentalOrderById: build.query<RentalOrderInfo, string>({
      query: (id) => `orders/rentals/${id}`,
      transformResponse: (response: RentalOrderInfo) =>
        transformRentalOrderResponse(response),
      providesTags: ["Rental"],
    }),
    updateRentalOrder: build.mutation<RentalOrderInfo, RentalOrderInfo>({
      query: ({ _id, ...order }) => {
        const body = transformRentalOrderToUTC(order);
        return {
          url: `orders/rentals/${_id}`,
          method: "PUT",
          body: body,
        };
      },
      invalidatesTags: ["Rental"],
    }),
    deleteRentalOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `orders/rentals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rental"],
    }),
    getExpiredRentalOrders: build.query<RentalOrderInfo[], void>({
      query: () => `orders/rentals/expired`,
      providesTags: ["Expired"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setExpiredRentalOrders(data));
        } catch (err) {
          if (err?.error.status === 404) {
            dispatch(setExpiredRentalOrders([]));
            return;
          }
          console.error("Failed to fetch customers:", err);
        }
      },
    }),
    patchRentalOrder: build.mutation<RentalOrderInfo, PatchPayload>({
      query: ({ id, payload }) => {
        return {
          url: `orders/rentals/${id}`,
          method: "PATCH",
          body: payload,
        };
      },
      invalidatesTags: ["Rental"],
      async onQueryStarted({ payload }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Check if the patched field includes "in_date"
          const inDatePatched = payload.some(
            (op) => op.path === "/expected_date" || op.path === "/status"
          );

          if (inDatePatched) {
            // Manually invalidate or trigger related query
            dispatch(rootApi.util.invalidateTags(["Expired"])); // or use your specific tag/query
          }
        } catch (err) {
          console.error("Patch failed:", err);
        }
      },
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
  usePatchRentalOrderMutation,
} = contactApi;
