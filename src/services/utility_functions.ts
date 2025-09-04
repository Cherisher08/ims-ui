import dayjs from "dayjs";
import { ProductDetails } from "../types/order";

export const calculateDiscountAmount = (discountPercent: number, finalAmount: number) => {
  return +((discountPercent / 100.0) * finalAmount).toFixed(2);
};

export const calculateProductRent = (
  product: ProductDetails,
  isReturnDuration: boolean = false
): number => {
  const { in_date, out_date, rent_per_unit, order_quantity, order_repair_count } = product;
  if (!in_date || !out_date) return 0;

  const start = dayjs(out_date).second(0).millisecond(0); // truncate to minute
  const end = dayjs(in_date).second(0).millisecond(0);

  const duration = end.diff(start, "day") || 1;

  // switch (billing_unit) {
  //   case BillingUnit.SHIFT: {
  //     const hoursDiff = end.diff(start, "hour");
  //     duration = Math.ceil(hoursDiff / 8) || 1;
  //     break;
  //   }
  //   case BillingUnit.DAYS:
  //     duration = end.diff(start, "day") || 1;
  //     break;
  //   case BillingUnit.WEEKS:
  //     duration = end.diff(start, "week") || 1;
  //     break;
  //   case BillingUnit.MONTHS:
  //     duration = end.diff(start, "month") || 1;
  //     break;
  //   default:
  //     duration = 1;
  // }

  const effectiveQuantity = order_quantity - order_repair_count;
  if (isReturnDuration) return duration;
  return rent_per_unit * effectiveQuantity * duration;
};
