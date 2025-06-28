import { ProductType } from "./common";
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
  id: string;
  inDate: string;
  outDate: string;
};

export type ContactSelectionType = {
  id: string;
  value: string;
};

export type DepositType = {
  amount: number;
  date: string;
  product: number;
  mode: PaymentMode;
};

export type OrderInfo = {
  orderId: string;
  customer: ContactSelectionType;
  product: ProductType[];
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
};

export type ServiceOrderInfo = OrderInfo & {
  type: OrderType.SERVICE;
  inDate: string;
  outDate: string;
};

export type OrderInfoType = RentalOrderInfo | SalesOrderInfo | ServiceOrderInfo;
