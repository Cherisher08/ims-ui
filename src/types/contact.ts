import type { Dispatch, SetStateAction } from "react";

export type ContactInfoType = {
  id: string;
  name: string;
  personalNumber: string;
  officeNumber: string;
  gstin: string;
  email: string;
  address: string;
  pincode: string;
  addressProof?: string;
  companyName?: string;
  actions?: string;
};

export type AddContactModalType = {
  addContactOpen: boolean;
  setAddContactOpen: (value: boolean) => void;
};

export type UpdateContactModalType = {
  updateContactOpen: boolean;
  setUpdateContactOpen: (value: boolean) => void;
  updateContactData: ContactInfoType | null;
  setUpdateContactData: Dispatch<SetStateAction<ContactInfoType | null>>;
};

export type DeleteContactType = {
  deleteContactOpen: boolean;
  setDeleteContactOpen: (value: boolean) => void;
  deleteContactId: string;
  setDeleteContactId: (value: string) => void;
};
