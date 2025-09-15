import { ContactInfoType, ContactWithFile } from '../types/contact';
import { rootApi } from './ApiService';

const constructContactFormData = (contactWithFile: ContactWithFile) => {
  const formData = new FormData();
  formData.append('name', contactWithFile.name);
  formData.append('personal_number', contactWithFile.personal_number);
  formData.append('office_number', contactWithFile.office_number);
  formData.append('gstin', contactWithFile.gstin);
  formData.append('company_name', contactWithFile.company_name!);
  formData.append('email', contactWithFile.email);
  formData.append('address', contactWithFile.address);
  formData.append('pincode', contactWithFile.pincode);
  formData.append('address_proof', contactWithFile.address_proof!);
  if (contactWithFile.file !== null) formData.append('file', contactWithFile.file);
  return formData;
};

export const contactApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getContacts: build.query<ContactInfoType[], void>({
      query: () => 'contacts',
      providesTags: ['Contact'],
    }),
    createContact: build.mutation<ContactInfoType, ContactWithFile>({
      query: (body) => {
        const formData = constructContactFormData(body);
        return {
          url: 'contacts',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Contact'],
    }),
    getContactById: build.query<ContactInfoType, string>({
      query: (id) => `contacts/${id}`,
    }),
    updateContact: build.mutation<ContactInfoType, ContactWithFile>({
      query: ({ _id, ...contact }) => {
        const formData = constructContactFormData(contact);
        return {
          url: `contacts/${_id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Contact'],
    }),
    deleteContact: build.mutation<void, string>({
      query: (id) => ({
        url: `contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useGetContactByIdQuery,
  useGetContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
