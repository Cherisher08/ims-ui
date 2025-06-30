import { IdNamePair } from "../pages/private/Inventory";
import { Product, ProductType, Unit } from "./common";
import { ContactInfoType } from "./contact";

export enum BillingMode {
  RETAIL = "Retail",
  BUSINESS = "Business",
}

export enum BillingUnit {
  SHIFT = "shift",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
}

export enum PaymentMode {
  CASH = "cash",
  UPI = "upi",
  ACCOUNT = "account",
}

// --------------------------------------------------------------------------------------------
// Nested Structures

export type ProductDetails = {
  _id: string;
  name: string;
  category: string;
  billing_unit: BillingUnit;
  product_unit: Unit;
  in_date: string;
  out_date: string;
  order_repair_count: number;
  order_quantity: number;
  rent_per_unit: number;
};

export type ContactSelectionType = {
  _id: string;
  value: string;
};

export type DepositType = {
  amount: number;
  date: string;
  product: IdNamePair | null;
  mode: PaymentMode;
};

// --------------------------------------------------------------------------------------------
// Types for Frontend

export type RentalOrderType = {
  _id: string;
  order_id: string;
  contact_name: string;
  deposits: DepositType[];
  products: string;
  in_date: string;
  out_date: string;
  expected_date: string;
  payment_status: PaymentStatus;
};

export type RentalType = {
  _id: string;
  order_id: string;
  contact_name: string;
  deposits: DepositType[];
  products: string;
  in_date: string;
  out_date: string;
  expected_date: string;
  payment_status: PaymentStatus;
  actions?: string;
};

export type OrderSummaryType = {
  product: Product;
  repair_count: number;
  quantity: number;
  unit_price: number;
  final_amount: number;
};

// --------------------------------------------------------------------------------------------
// Backend Data Types

export type OrderInfo = {
  _id?: string;
  order_id: string;
  customer: ContactInfoType;
  billing_mode: BillingMode;
  discount: number;
  discount_amount: number;
  status: PaymentStatus;
  remarks: string;
  round_off: number;
  payment_mode: PaymentMode;
  gst: number;
};

export type RentalOrderInfo = OrderInfo & {
  type: ProductType.RENTAL;
  deposits: DepositType[];
  out_date: string;
  expected_date: string;
  in_date: string;
  product_details: ProductDetails[];
  event_address: string;
  event_pincode: string;
};

export type SalesOrderInfo = OrderInfo & {
  type: ProductType.SALES;
  outTime: string;
  products: Product[];
};

export type ServiceOrderInfo = OrderInfo & {
  type: ProductType.SERVICE;
  inDate: string;
  outDate: string;
};

export type OrderInfoType = RentalOrderInfo | SalesOrderInfo | ServiceOrderInfo;
