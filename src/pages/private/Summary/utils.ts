import { ValueFormatterParams, ValueGetterParams, ValueSetterParams } from "ag-grid-community";
import {
  BillingMode,
  BillingUnit,
  OrderInfo,
  PaymentMode,
  PaymentStatus,
  RentalOrderInfo,
} from "../../../types/order";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Product, ProductType } from "../../../types/common";
import { IdNamePair } from "../Inventory";

dayjs.extend(utc);

const utcString = () => dayjs().utc().format();

export const gstAmountGetter = (params: ValueGetterParams) => {
  const amount = Number(params.data.amount ?? 0);
  const gstPercent = Number(params.data.gst_percent ?? 0);
  return parseFloat(((amount * gstPercent) / 100).toFixed(2));
};

export const gstPercentSetter = (params: ValueSetterParams): boolean => {
  const newValue = Number(params.newValue ?? 0);
  if (isNaN(newValue)) return false;

  if (params.data.gst_percent !== newValue) {
    params.data.gst_percent = newValue;
    return true;
  }
  return false;
};

export const gstAmountSetter = (params: ValueSetterParams): boolean => {
  const newGstAmount = Number(params.newValue ?? 0);
  const baseAmount = Number(params.data.amount ?? 0);

  if (isNaN(newGstAmount) || baseAmount === 0) return false;

  const newGstPercent = parseFloat(((newGstAmount / baseAmount) * 100).toFixed(2));

  if (params.data.gst_percent !== newGstPercent) {
    params.data.gst_percent = newGstPercent;
    return true;
  }

  return false;
};

export const currencyFormatter = (params: ValueFormatterParams) => {
  const value = parseFloat(params.value ?? 0);
  if (isNaN(value)) return "";
  return `₹${value.toFixed(2)}`;
};

export const getNewOrderId = (orders: OrderInfo[]) => {
  console.log("orders: ", orders);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JS months 0-11
  const startYear = month < 4 ? year - 1 : year;
  const endYear = startYear + 1;
  const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;

  const suffixes = orders
    .map((order) => {
      const match = order.order_id?.match(/RO\/\d{2}-\d{2}\/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => num > 0);

  const maxSuffix = suffixes.length > 0 ? Math.max(...suffixes) : 0;
  const nextSuffix = (maxSuffix + 1).toString().padStart(4, "0");

  return `RO/${fy}/${nextSuffix}`;
};

export const getDefaultRentalOrder = (orderId: string): RentalOrderInfo => {
  return {
    billing_mode: BillingMode.B2C,
    customer: undefined,
    deposits: [],
    discount: 0,
    discount_amount: 0,
    event_address: "",
    rental_duration: 0,
    gst: 0,
    in_date: "",
    order_id: orderId,
    out_date: utcString(),
    payment_mode: PaymentMode.CASH,
    product_details: [],
    remarks: "",
    round_off: 0,
    status: PaymentStatus.PENDING,
    type: ProductType.RENTAL,
    eway_amount: 0,
    eway_mode: PaymentMode.CASH,
    event_name: "",
    event_venue: "",
  };
};

export const getDefaultDeposit = (products: IdNamePair[]) => {
  return {
    amount: 0,
    date: utcString(),
    mode: PaymentMode.CASH,
    product: products[0],
  };
};

export const getDuration = (out_date: string, in_date: string) => {
  const start = dayjs(out_date).second(0).millisecond(0);
  const end = dayjs(in_date).second(0).endOf("day");
  const duration = end.diff(start, "day");
  return duration;
};

export const getDefaultProduct = (out_date: string, in_date: string) => {
  const inDate = in_date || utcString();
  const outDate = out_date || utcString();
  const duration = getDuration(outDate, inDate);
  return {
    _id: "",
    name: "",
    category: "",
    billing_unit: BillingUnit.DAYS,
    product_unit: {
      _id: "",
      name: "",
    },
    in_date: inDate,
    order_quantity: 0,
    order_repair_count: 0,
    out_date: outDate,
    duration: duration,
    rent_per_unit: 0,
    product_code: "",
  };
};

export const formatProducts = (products: Product[]) => {
  return products.map((product) => ({
    id: product._id || "",
    value: product.name,
  }));
};

export const billingUnitOptions = Object.entries(BillingUnit).map(([key, value]) => ({
  id: key,
  value,
}));

export const paymentModeOptions = Object.entries(PaymentMode).map(([key, value]) => ({
  id: key,
  value,
}));
