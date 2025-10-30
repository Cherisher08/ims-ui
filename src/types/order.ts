import { IdNamePair } from '../pages/private/Stocks';
import { DiscountType, Product, ProductType, Unit } from './common';
import { ContactInfoType } from './contact';

export enum BillingMode {
  B2B = 'B2B',
  B2C = 'B2C',
}

// export enum BillingUnit {
//   SHIFT = "shift",
//   DAYS = "days",
//   WEEKS = "weeks",
//   MONTHS = "months",
// }

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  NO_BILL = 'no bill',
}

export enum PaymentMode {
  NULL = '-',
  CASH = 'cash',
  UPI = 'upi',
  ACCOUNT = 'account',
}
export enum RepaymentMode {
  NULL = '-',
  CASHLESS = 'cash less',
  UPILESS = 'upi less',
  KVBLESS = 'kvb less',
}

export enum TransportType {
  NULL = '-',
  UP = 'Up',
  DOWN = 'Down',
  BOTH = 'Both',
}

// --------------------------------------------------------------------------------------------
// Nested Structures

export type ProductDetails = {
  _id: string;
  name: string;
  type: ProductType;
  category: string;
  // billing_unit: BillingUnit;
  product_unit: Unit;
  in_date: string;
  out_date: string;
  duration: number;
  order_repair_count: number;
  order_quantity: number;
  rent_per_unit: number;
  product_code: string;
  damage: string;
};

export type ContactSelectionType = {
  _id: string;
  value: string;
};

export type DepositType = {
  _id?: string;
  amount: number;
  date: string;
  product: IdNamePair | null;
  mode: PaymentMode;
};

// --------------------------------------------------------------------------------------------
// Types for Frontend

export type RentalOrderType = Omit<RentalOrderInfo, 'customer'> & {
  customer: IdNamePair;
};

export type RentalType = Omit<RentalOrderInfo, 'customer'> & {
  customer: IdNamePair;
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
  customer?: ContactInfoType;
  billing_mode: BillingMode;
  discount: number;
  discount_type: DiscountType;
  status: PaymentStatus;
  remarks: string;
  round_off: number;
  payment_mode: RepaymentMode;
  gst: number;
  invoice_id: string;
};

export type RentalOrderInfo = OrderInfo & {
  type: ProductType.RENTAL;
  deposits: DepositType[];
  out_date: string;
  rental_duration: number;
  in_date: string;
  product_details: ProductDetails[];
  event_address: string;
  eway_amount: number;
  eway_mode: PaymentMode;
  eway_type: TransportType;
  balance_paid: number;
  balance_paid_mode: PaymentMode;
  balance_paid_date: string;
  repay_amount: number;
  repay_date: string;
  event_name: string;
  event_venue: string;
  challan?: {
    sent: boolean;
    last_sent_date: string;
  };
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

type MessageDetails = {
  customerName: string;
  orderId: string;
};

export type DCWhatsappPayload = {
  messageDetails: MessageDetails;
  mobile_number: string;
  pdf_file: File | null;
};
