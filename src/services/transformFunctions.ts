import dayjs from 'dayjs';
import { DCWhatsappPayload, PurchaseOrderInfo, RentalOrderInfo } from '../types/order';

const formatLocalDateTime = (isoDateStr: string) => {
  if (!isoDateStr) return isoDateStr;
  return dayjs(isoDateStr).format('YYYY-MM-DDTHH:mm');
};

export const transformRentalOrderResponse = (order: RentalOrderInfo): RentalOrderInfo => {
  return {
    ...order,
    in_date: formatLocalDateTime(order.in_date),
    out_date: formatLocalDateTime(order.out_date),
    repay_date: formatLocalDateTime(order.repay_date),
    balance_paid_date: formatLocalDateTime(order.balance_paid_date),
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
  };
};

const toUTCISOString = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return date.toISOString();
};

export const transformRentalOrderToUTC = (order: RentalOrderInfo) => {
  return {
    ...order,
    in_date: toUTCISOString(order.in_date),
    out_date: toUTCISOString(order.out_date),
    repay_date: toUTCISOString(order.repay_date),
    balance_paid_date: toUTCISOString(order.balance_paid_date),
    invoice_date: toUTCISOString(order.invoice_date),
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

export const constructWhatsappFormData = (payloadData: DCWhatsappPayload) => {
  const formData = new FormData();
  formData.append('mobile_number', payloadData.mobile_number);
  formData.append('customer_name', payloadData.messageDetails.customerName);
  formData.append('bill_type', payloadData.messageDetails.bill_type);
  formData.append('order_id', payloadData.messageDetails.orderId);
  if (payloadData.pdf_file !== null) formData.append('file', payloadData.pdf_file);
  return formData;
};

export const transformPurcharseOrderToFormData = (order: PurchaseOrderInfo) => {
  const orderWithUtcDate = {
    ...order,
    purchase_date: toUTCISOString(order.purchase_date),
  };
  const formData = new FormData();
  Object.entries(orderWithUtcDate).forEach(([key, value]) => {
    if (key === 'invoice_pdf' && value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};
