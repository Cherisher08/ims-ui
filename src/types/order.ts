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
}

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
  product: Product | null;
  mode: PaymentMode;
};

export type RentalOrderType = {
  order_id: string;
  contact: string;
  deposit: number;
  order_InDate: string;
  orderOutDate: string;
  productId: string;
  productUnit: number;
  inDate: string;
  outDate: string;
};

export type RentalType = {
  order_id: string;
  contact: string;
  deposit: DepositType[];
  orderInDate: string;
  orderOutDate: string;
  productId: string;
  productUnit: number;
  inDate: string;
  outDate: string;
  actions?: string;
};

export type OrderSummaryType = {
  product: Product;
  repair_count: number;
  quantity: number;
  unit_price: number;
  final_amount: number;
};

export type OrderInfo = {
  _id: string;
  order_id: string;
  customer: ContactInfoType;
  billing_mode: BillingMode;
  status: PaymentStatus;
  payment_mode: PaymentMode;
  remarks: string;
  round_off: number;
  discount: number;
  discount_amount: number;
};

export type RentalOrderInfo = OrderInfo & {
  type: ProductType.RENTAL;
  event_address: string;
  event_pincode: string;
  deposit: DepositType[];
  in_date: string;
  out_date: string;
  expected_date: string;
  billing_unit: BillingUnit;
  product_details: ProductDetails[];
};

export type SalesOrderInfo = OrderInfo & {
  type: ProductType.SALES;
  outTime: string;
  productDetails: Product[];
};

export type ServiceOrderInfo = OrderInfo & {
  type: ProductType.SERVICE;
  inDate: string;
  outDate: string;
};

export type OrderInfoType = RentalOrderInfo | SalesOrderInfo | ServiceOrderInfo;
