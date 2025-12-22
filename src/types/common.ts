import { ContactInfoType } from './contact';
import { PaymentMode, RepaymentMode } from './order';

export type ErrorResponse = {
  detail?: string;
  message?: string;
};

export interface VerifyOtpRequest {
  otp: string;
  email: string;
}

export interface ProductCategory {
  _id?: string;
  name: string;
}

export interface Unit {
  _id?: string;
  name: string;
}

export enum ProductType {
  RENTAL = 'rental',
  SALES = 'sales',
  SERVICE = 'service',
}

export enum DiscountType {
  RUPEES = 'rupees',
  PERCENT = 'percent',
}

export const discountTypeValues = [
  {
    id: 'percent',
    value: '%',
  },
  {
    id: 'rupees',
    value: '₹',
  },
];

export enum EventNameType {
  CONSTRUCTION_WORK = 'Construction work',
  DEWATERING_WORK = 'Dewatering Work',
  CLEANING_WORK = 'Cleaning Work',
  GARDEN_WORK = 'Garden Work',
}

export enum OrderStatusType {
  MACHINE_WORKING = 'Machine working',
  MACHINE_NOT_RETURN = 'Machine not return',
  BILL_PENDING = 'Bill pending',
  REPAYMENT_PENDING = 'Repayment pending',
  PAID = 'Paid',
  MACHINE_REPAIR = 'Repair Bill Pending',
  CANCELLED = 'Cancelled',
  NO_BILL = 'No Bill',
}

export interface Product {
  _id?: string;
  name: string;
  created_at?: string;
  quantity: number;
  available_stock: number;
  repair_count: number;
  product_code: string;
  category: ProductCategory;
  price: number;
  type: ProductType;
  purchase_date: string;
  unit: Unit;
  rent_per_unit: number;
  discount: number;
  discount_type: DiscountType;
  created_by?: string;
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace';
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PatchPayload {
  id: string;
  payload: PatchOperation[];
}

export type PettyCash = {
  _id?: string;
  created_date: string;
  customer: ContactInfoType;
  balance_paid: number;
  balance_paid_mode: PaymentMode;
  payment_mode: RepaymentMode;
  repay_amount: number;
};
