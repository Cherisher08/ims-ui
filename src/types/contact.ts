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

export interface ContactWithFile extends ContactInfoType {
  file: File | null;
}

export type ContactInfoWithActions = ContactInfoType & { actions?: string };

export const initialContactType: ContactInfoType = {
  _id: "",
  name: "",
  personal_number: "",
  office_number: "",
  gstin: "",
  email: "",
  address: "",
  pincode: "",
  company_name: "",
  address_proof: "",
};
