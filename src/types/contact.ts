import type { Dispatch, SetStateAction } from "react";

export type ContactInfoType = {
  _id?: string;
  name: string;
  personal_number: string;
  office_number: string;
  gstin: string;
  email: string;
  address: string;
  pincode: string;
  company_name?: string;
  address_proof?: string;
};

export type ContactInfoWithActions = ContactInfoType & { actions?: unknown };
export type UpdateContactInfoType = ContactInfoType & { id: string };

export type AddContactModalType = {
  addContactOpen: boolean;
  setAddContactOpen: (value: boolean) => void;
};

export type UpdateContactModalType = {
  updateContactOpen: boolean;
  setUpdateContactOpen: (value: boolean) => void;
  updateContactData: UpdateContactInfoType;
  setUpdateContactData: Dispatch<SetStateAction<UpdateContactInfoType>>;
};

export type DeleteContactType = {
  deleteContactOpen: boolean;
  setDeleteContactOpen: (value: boolean) => void;
  deleteContactId: string;
  setDeleteContactId: (value: string) => void;
};
