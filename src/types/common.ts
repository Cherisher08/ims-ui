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
  RENTAL = "rental",
  SALES = "sales",
  SERVICE = "service",
}

export enum DiscountType {
  RUPEES = "rupees",
  PERCENT = "percent",
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
  op: "add" | "remove" | "replace";
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PatchPayload {
  id: string;
  payload: PatchOperation[];
}
