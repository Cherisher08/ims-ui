import dayjs from "dayjs";
import { RentalOrderInfo } from "../types/order";
import { ProductType } from "../types/common";
import {
  calculateDiscountAmount,
  calculateProductRent,
} from "./utility_functions";

const formatLocalDateTime = (isoDateStr: string) => {
  if (!isoDateStr) return isoDateStr;
  return dayjs(isoDateStr).format("YYYY-MM-DDTHH:mm");
};

const calculateTotalAmount = (orderInfo: RentalOrderInfo) => {
  if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
    const total = orderInfo.product_details.reduce((sum, prod) => {
      return sum + calculateProductRent(prod);
    }, 0);

    return parseFloat(total.toFixed(2));
  }
  return 0;
};

export const transformRentalOrderResponse = (
  order: RentalOrderInfo
): RentalOrderInfo => {
  return {
    ...order,
    in_date: formatLocalDateTime(order.in_date),
    out_date: formatLocalDateTime(order.out_date),
    deposits:
      order.deposits?.map((d) => ({
        ...d,
        date: formatLocalDateTime(d.date),
      })) ?? [],
    product_details:
      order.product_details?.map((p) => ({
        ...p,
        out_date: formatLocalDateTime(p.out_date),
        in_date: formatLocalDateTime(p.in_date),
      })) ?? [],
    discount_amount: calculateDiscountAmount(
      order.discount,
      calculateTotalAmount(order)
    ),
  };
};

function toUTCISOString(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return date.toISOString();
}

export const transformRentalOrderToUTC = (order: RentalOrderInfo) => {
  return {
    ...order,
    in_date: toUTCISOString(order.in_date),
    out_date: toUTCISOString(order.out_date),
    customer: order.customer
      ? {
          ...order.customer,
        }
      : null,
    deposits:
      order.deposits?.map((deposit) => ({
        ...deposit,
        date: toUTCISOString(deposit.date),
      })) ?? [],
    product_details:
      order.product_details?.map((product) => ({
        ...product,
        in_date: toUTCISOString(product.in_date),
        out_date: toUTCISOString(product.out_date),
        product_unit: product.product_unit
          ? {
              ...product.product_unit,
            }
          : null,
      })) ?? [],
  };
};
