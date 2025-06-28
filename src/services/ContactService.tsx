import { ContactInfoType } from "../types/contact";
import { rootApi } from "./ApiService";

export const contactApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getContacts: build.query<ContactInfoType[], void>({
      query: () => `contacts`,
      providesTags: ["Contact"],
    }),
    createContact: build.mutation<ContactInfoType, ContactInfoType>({
      query: (body) => ({
        url: `contacts`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Contact"],
    }),
    getContactById: build.query<ContactInfoType, string>({
      query: (id) => `contacts/${id}`,
    }),
    updateContact: build.mutation<ContactInfoType, ContactInfoType>({
      query: ({ _id, ...contact }) => ({
        url: `contacts/${_id}`,
        method: "POST",
        body: contact,
      }),
      invalidatesTags: ["Contact"],
    }),
    deleteContact: build.mutation<void, string>({
      query: (id) => ({
        url: `contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});
