import { ProductDetails } from "../types/order";
import { getDuration } from "../pages/private/Orders/utils";

export const calculateDiscountAmount = (discountPercent: number, finalAmount: number) => {
  return +((discountPercent / 100.0) * finalAmount).toFixed(2);
};

export const calculateProductRent = (
  product: ProductDetails,
  isReturnDuration: boolean = false
): number => {
  const { in_date, out_date, rent_per_unit, order_quantity, order_repair_count } = product;
  if (!in_date || !out_date) return 0;

  const duration = getDuration(out_date, in_date);

  const effectiveQuantity = order_quantity - order_repair_count;
  if (isReturnDuration) return duration;
  return rent_per_unit * effectiveQuantity * duration;
};
