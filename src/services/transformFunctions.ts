import dayjs from "dayjs";
import { RentalOrderInfo } from "../types/order";
import { ProductType } from "../types/common";
import { calculateDiscountAmount } from "./utility_functions";

const formatLocalDateTime = (isoDateStr: string) => {
  if (!isoDateStr) return isoDateStr;
  return dayjs(isoDateStr).format("YYYY-MM-DDTHH:mm");
};

const calculateTotalAmount = (order: RentalOrderInfo) => {
  if (order.type === ProductType.RENTAL && order.product_details) {
    return parseFloat(
      order.product_details
        .reduce(
          (total, prod) =>
            total +
            prod.rent_per_unit *
              (prod.order_quantity - prod.order_repair_count),
          0
        )
        .toFixed(2)
    );
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
    expected_date: formatLocalDateTime(order.expected_date),
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
