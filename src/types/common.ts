export type ErrorResponse = {
  detail?: string;
  message?: string;
};

export interface VerifyOtpRequest {
  otp: string;
  email: string;
}

export interface ProductCategory {
  id?: string;
  name: string;
}

export interface Unit {
  id?: string;
  name: string;
  symbol: string;
}

export enum ProductType {
  Rental="rental",
  Sales="sales",
  Service="service",
}

export interface Product {
  _id?: string;
  name: string;
  product_code: string;
  created_by?: string,
  created_at?: string,
  unit: string;
  category: string;
  type: string;
  quantity: number;
  purchase_date: string;
  price: number;
  rent_per_unit: number;
  discount: number;
  discount_type: string;
  seller?: string;
  purchaseOrder?: boolean;
}