import { Product, Unit } from "./common";
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
  GPAY = "gpay",
}

export enum OrderType {
  RENTAL = "rental",
  SALES = "sales",
  SERVICE = "service",
}

export type ProductDetails = {
  _id: string;
  name: string;
  category: string;
  billing_unit: BillingUnit;
  product_unit: Unit;
  inDate: string;
  outDate: string;
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
  product: Product;
  mode: PaymentMode;
};

export type RentalOrderType = {
  orderId: string;
  contact: string;
  deposit: number;
  orderInDate: string;
  orderOutDate: string;
  productId: string;
  productUnit: number;
  inDate: string;
  outDate: string;
};

export type RentalType = {
  orderId: string;
  contact: string;
  deposit: number;
  orderInDate: string;
  orderOutDate: string;
  productId: string;
  productUnit: number;
  inDate: string;
  outDate: string;
  actions?: string;
};

export type OrderSummaryType = {
  no: number;
  product: Product;
  repair_count: number;
  quantity: number;
  unit_price: number;
  final_amount: number;
};

export type OrderInfo = {
  orderId: string;
  customer: ContactInfoType;
  eventAddress: string;
  eventPincode: string;
  billingMode: BillingMode;
  status: PaymentStatus;
  paymentMode: PaymentMode;
  remarks: string;
};

export type RentalOrderInfo = OrderInfo & {
  type: OrderType.RENTAL;
  deposit: number;
  outDate: string;
  expectedDate: string;
  inDate: string;
  billingUnit: BillingUnit;
  productDetails: ProductDetails[];
};

export type SalesOrderInfo = OrderInfo & {
  type: OrderType.SALES;
  outTime: string;
  productDetails: Product[];
};

export type ServiceOrderInfo = OrderInfo & {
  type: OrderType.SERVICE;
  inDate: string;
  outDate: string;
};

export type OrderInfoType = RentalOrderInfo | SalesOrderInfo | ServiceOrderInfo;
