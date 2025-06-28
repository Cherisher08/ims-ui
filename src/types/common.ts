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
  Rental = "rental",
  Sales = "sales",
  Service = "service",
}

export enum DiscountType {
  Rupees = "rupees",
  Percent = "percent",
}

export interface Product {
  _id?: string;
  name: string;
  product_code: string;
  created_by?: string;
  created_at?: string;
  unit: Unit;
  category: ProductCategory;
  type: ProductType;
  quantity: number;
  purchase_date: string;
  price: number;
  rent_per_unit: number;
  discount: number;
  discount_type: DiscountType;
  seller?: string;
  purchaseOrder?: boolean;
}
