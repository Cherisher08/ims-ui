import dayjs from 'dayjs';
import { BillingUnit, ProductDetails } from '../types/order';

export const calculateDiscountAmount = (discountPercent: number, finalAmount: number) => {
  return +((discountPercent / 100.0) * finalAmount).toFixed(2);
};

export const calculateProductRent = (product: ProductDetails): number => {
  const {
    out_date,
    duration: expected_duration,
    billing_unit,
    rent_per_unit,
    order_quantity,
    order_repair_count,
  } = product;
  if (!out_date) return 0;
  let end_date = '';

  if (billing_unit === BillingUnit.SHIFT) {
    end_date = dayjs(out_date)
      .add(expected_duration * 8, 'hour')
      .toISOString();
  } else {
    end_date = dayjs(out_date)
      .add(expected_duration, billing_unit.toLowerCase() as dayjs.ManipulateType)
      .toISOString();
  }

  let duration = 0;
  const start = dayjs(out_date).second(0).millisecond(0);
  const end = dayjs(end_date).second(0).millisecond(0);

  switch (billing_unit) {
    case BillingUnit.SHIFT: {
      const hoursDiff = end.diff(start, 'hour');
      duration = Math.ceil(hoursDiff / 8) || 1;
      break;
    }
    case BillingUnit.DAYS:
      duration = end.diff(start, 'day') || 1;
      break;
    case BillingUnit.WEEKS:
      duration = end.diff(start, 'week') || 1;
      break;
    case BillingUnit.MONTHS:
      duration = end.diff(start, 'month') || 1;
      break;
    default:
      duration = 1;
  }

  const effectiveQuantity = order_quantity - order_repair_count;
  return rent_per_unit * effectiveQuantity * duration;
};

export const formatBillingUnit = (unit: BillingUnit | string): string => {
  if (!unit) return '-';
  const normalized = unit.toLowerCase();
  // Convert to title case and put trailing 's' in parentheses
  const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1, -1);
  return `${titleCase}(s)`;
};
