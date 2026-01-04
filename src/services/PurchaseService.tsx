/* eslint-disable @typescript-eslint/no-explicit-any */
import { PurchaseOrderInfo } from '../types/order';
import { rootApi } from './ApiService';

export const purchaseApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getPurchases: build.query<PurchaseOrderInfo[], void | { limit?: number; [key: string]: any }>({
      query: (params?: { limit?: number; [key: string]: any }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) queryParams.append(key, value.toString());
          });
        }
        if (!queryParams.has('limit')) {
          queryParams.append('limit', '0');
        }
        const queryString = queryParams.toString();
        return `orders/purchase${queryString ? '?' + queryString : ''}`;
      },
      providesTags: ['Purchase'],
    }),
    createPurchase: build.mutation<PurchaseOrderInfo, PurchaseOrderInfo>({
      query: (order) => {
        const formData = new FormData();
        Object.entries(order).forEach(([key, value]) => {
          if (key === 'invoice_pdf' && value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        return {
          url: 'orders/purchase',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Purchase', 'Product'],
    }),
    getPurchaseById: build.query<PurchaseOrderInfo, string>({
      query: (id) => `orders/purchase/${id}`,
      providesTags: ['Purchase'],
    }),
    updatePurchase: build.mutation<PurchaseOrderInfo, PurchaseOrderInfo>({
      query: ({ _id, ...order }) => {
        const formData = new FormData();
        Object.entries(order).forEach(([key, value]) => {
          if (key === 'invoice_pdf' && value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        return {
          url: `orders/purchase/${_id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Purchase', 'Product'],
    }),
    deletePurchase: build.mutation<void, string>({
      query: (id) => ({
        url: `orders/purchase/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchase'],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseApi;
