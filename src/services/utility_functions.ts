export const calculateDiscountAmount = (
  discountPercent: number,
  finalAmount: number
) => {
  return +((discountPercent / 100.0) * finalAmount).toFixed(2);
};
