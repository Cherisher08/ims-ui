import { PettyCash } from '../types/common';
import { rootApi } from './ApiService';

export const pettyCashApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getPettyCashes: build.query<PettyCash[], void>({
      query: () => 'petty-cash',
      providesTags: ['PettyCash'],
    }),
    createPettyCash: build.mutation<PettyCash, PettyCash>({
      query: (body) => ({
        url: 'petty-cash',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['PettyCash'],
    }),
    updatePettyCash: build.mutation<PettyCash, PettyCash>({
      query: ({ _id, ...pettyCash }) => ({
        url: `petty-cash/${_id}`,
        method: 'PUT',
        body: pettyCash,
      }),
      invalidatesTags: ['PettyCash'],
    }),
    deletePettyCash: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `petty-cash/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PettyCash'],
    }),
  }),
});

export const {
  useGetPettyCashesQuery,
  useCreatePettyCashMutation,
  useUpdatePettyCashMutation,
  useDeletePettyCashMutation,
} = pettyCashApi;
