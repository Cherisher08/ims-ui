import { ProductDetails } from '../types/order';

export const calculateDiscountAmount = (discountPercent: number, finalAmount: number) => {
  return +((discountPercent / 100.0) * finalAmount).toFixed(2);
};

export const calculateProductRent = (
  product: ProductDetails,
  isReturnDuration: boolean = false
): number => {
  const { duration, rent_per_unit, order_quantity, order_repair_count } = product;

  const effectiveQuantity = order_quantity - order_repair_count;
  if (isReturnDuration) return duration;
  return rent_per_unit * effectiveQuantity * duration;
};

