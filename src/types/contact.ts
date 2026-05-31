import { Branch } from './user';

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
  remarks?: string;
  branch?: Branch;
  // Aadhaar eKYC fields
  aadhaar_verified?: boolean;
  aadhaar_masked_uid?: string;
  aadhaar_name?: string;
  aadhaar_dob?: string;
  aadhaar_gender?: string;
  aadhaar_address?: string;
};

export interface ContactWithFile extends ContactInfoType {
  file: File | null;
}

export type ContactInfoWithActions = ContactInfoType & { actions?: string };

export const initialContactType: ContactInfoType = {
  _id: '',
  name: '',
  personal_number: '',
  office_number: '',
  gstin: '',
  email: '',
  address: '',
  pincode: '',
  company_name: '',
  address_proof: '',
  remarks: '',
  branch: Branch.PADUR,
};
