import { ValueFormatterParams, ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DiscountType, OrderStatusType, Product, ProductType } from '../../../types/common';
import {
  BillingMode,
  OrderInfo,
  PaymentMode,
  PaymentStatus,
  ProductDetails,
  RentalOrderInfo,
  RentalOrderType,
  RepaymentMode,
  TransportType,
} from '../../../types/order';
import { IdNamePair } from '../Stocks';

// import * as XLSX from 'xlsx';
import XLSX from 'xlsx-js-style';

import { calculateDiscountAmount, calculateProductRent } from '../../../services/utility_functions';

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
  if (isNaN(value)) return '';
  return `₹${value.toFixed(2)}`;
};

export const getNewOrderId = (orders: OrderInfo[]) => {
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
  const nextSuffix = (maxSuffix + 1).toString().padStart(4, '0');

  return `RO/${fy}/${nextSuffix}`;
};

export const getDefaultRentalOrder = (orderId: string): RentalOrderInfo => {
  return {
    billing_mode: BillingMode.B2C,
    customer: undefined,
    deposits: [],
    discount: 0,
    discount_type: DiscountType.RUPEES,
    event_address: '',
    rental_duration: 0,
    gst: 0,
    in_date: '',
    order_id: orderId,
    out_date: utcString(),
    payment_mode: RepaymentMode.NULL,
    product_details: [],
    remarks: '',
    round_off: 0,
    status: PaymentStatus.PENDING,
    type: ProductType.RENTAL,
    eway_amount: 0,
    eway_mode: PaymentMode.CASH,
    eway_type: TransportType.NULL,
    balance_paid: 0,
    balance_paid_mode: PaymentMode.NULL,
    repay_amount: 0,
    event_name: '',
    event_venue: '',
    balance_paid_date: '',
    repay_date: '',
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
  const start = dayjs(out_date).startOf('day');
  const end = dayjs(in_date).endOf('day');
  const duration = end.diff(start, 'day') + 1;
  return duration;
};

export const getDefaultProduct = (out_date: string, in_date?: string) => {
  const inDate = in_date || utcString();
  const outDate = out_date || utcString();
  const duration = getDuration(outDate, inDate);
  return {
    _id: '',
    name: '',
    type: ProductType.RENTAL,
    category: '',
    // billing_unit: BillingUnit.DAYS,
    product_unit: {
      _id: '',
      name: '',
    },
    in_date: inDate,
    order_quantity: 0,
    order_repair_count: 0,
    out_date: outDate,
    duration: duration,
    rent_per_unit: 0,
    product_code: '',
    damage: '',
  };
};

export const formatProducts = (products: Product[] | ProductDetails[]) => {
  return products.map((product) => ({
    id: product._id || '',
    value: product.name,
    description:
      'available_stock' in product ? `${(product as Product).available_stock}` || '0' : '',
  }));
};

export const calculateTotalAmount = (orderInfo: RentalOrderType) => {
  if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
    let total = 0;
    if (orderInfo.billing_mode === BillingMode.B2C) {
      total = orderInfo.product_details.reduce((sum, prod) => {
        const rent_per_unit = calculateProductRent(prod);
        const exclusiveAmount = rent_per_unit / (1 + orderInfo.gst / 100);
        return sum + exclusiveAmount;
      }, 0);
    } else {
      total = orderInfo.product_details.reduce((sum, prod) => {
        return sum + calculateProductRent(prod);
      }, 0);
    }

    return parseFloat(total.toFixed(2));
  }
  return 0;
};

export const calculateFinalAmount = (orderInfo: RentalOrderType) => {
  const finalAmount = calculateTotalAmount(orderInfo);
  const roundOff = orderInfo.round_off || 0;
  const ewayBillAmount = orderInfo.eway_amount || 0;
  const balance_paid = orderInfo.balance_paid || 0;
  const discountAmount =
    orderInfo.discount_type === DiscountType.PERCENT
      ? calculateDiscountAmount(orderInfo.discount || 0, finalAmount)
      : orderInfo.discount || 0;
  const gstAmount = calculateDiscountAmount(orderInfo.gst || 0, finalAmount - discountAmount);
  return parseFloat(
    (finalAmount - discountAmount - balance_paid + gstAmount + roundOff + ewayBillAmount).toFixed(2)
  );
};

export const exportOrderToExcel = (orders: RentalOrderType[]) => {
  const ws = XLSX.utils.aoa_to_sheet([]);

  const data = orders.map((order) => {
    const products = order.product_details.map((p) => p.name).join('\n');
    const productAmounts = order.product_details
      .map((p) => (p.rent_per_unit * p.order_quantity * p.duration).toString())
      .join('\n');
    const orderQuantities = order.product_details
      .map((p) => p.order_quantity.toString())
      .join('\n');
    const depositAmounts = order.deposits.map((d) => d.amount.toString()).join('\n');
    const depositModes = order.deposits.map((d) => d.mode.toString()).join('\n');

    return {
      'Order ID': order.order_id,
      Customer: order.customer?.name,
      Products: products,
      'Product Amounts': productAmounts,
      'Order Quantity': orderQuantities,
      'Amount (Before Taxes)': calculateTotalAmount(order).toString(),
      'Amount (After Taxes)': calculateFinalAmount(order).toString(),
      'Balance Amount': Math.max(
        0,
        calculateFinalAmount(order) -
          order.deposits.reduce((total, deposit) => total + deposit.amount, 0)
      ).toFixed(2),
      'Repayment Amount': Math.abs(
        Math.min(
          0,
          calculateFinalAmount(order) -
            order.deposits.reduce((total, deposit) => total + deposit.amount, 0)
        )
      ).toFixed(2),
      'Order Out Date': order.out_date ? dayjs(order.out_date).format('DD-MMM-YYYY hh:mm A') : '',
      'Order In Date':
        order.in_date && dayjs(order.in_date).isValid()
          ? dayjs(order.in_date).format('DD-MMM-YYYY hh:mm A')
          : '',
      'Rental Duration': order.rental_duration?.toString() || '',
      'Event Name': order.event_name,
      'Event Venue': order.event_venue,
      'Event Address': order.event_address,
      'Billing Mode': order.billing_mode,
      GST: `${order.gst} %`,
      Discount: order.discount?.toString() || '',
      'Discount Type': order.discount_type,
      'Transport Amount': order.eway_amount?.toString() || '',
      'Transport Payment Mode': order.eway_mode,
      'Transport Type': order.eway_type,
      'Deposit Amount': depositAmounts,
      'Deposit Mode': depositModes,
      'Repayment Mode': order.payment_mode,
      'Balance Paid Date':
        order.balance_paid_date && dayjs(order.balance_paid_date).isValid()
          ? dayjs(order.balance_paid_date).format('DD-MMM-YYYY hh:mm A')
          : '',
      'Balance Paid Mode': order.balance_paid_mode,
      'Round Off': order.round_off?.toString() || '',
      Status: order.status,
      Remarks: order.remarks,
    };
  });

  XLSX.utils.sheet_add_json(ws, data, { origin: 0 });

  ws['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 30 },
  ];

  const range = XLSX.utils.decode_range(ws['!ref'] || '');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const productCellRef = XLSX.utils.encode_cell({ r: R, c: 2 });
    const amountCellRef = XLSX.utils.encode_cell({ r: R, c: 3 });
    const quantityCellRef = XLSX.utils.encode_cell({ r: R, c: 4 });
    const depositAmountCellRef = XLSX.utils.encode_cell({ r: R, c: 22 });
    const depositModeCellRef = XLSX.utils.encode_cell({ r: R, c: 23 });

    if (ws[productCellRef]) {
      ws[productCellRef].s = {
        alignment: { wrapText: true, vertical: 'top' },
      };
    }
    if (ws[amountCellRef]) {
      ws[amountCellRef].s = {
        alignment: { wrapText: true, vertical: 'top' },
      };
    }
    if (ws[quantityCellRef]) {
      ws[quantityCellRef].s = {
        alignment: { wrapText: true, vertical: 'top' },
      };
    }
    if (ws[depositAmountCellRef]) {
      ws[depositAmountCellRef].s = {
        alignment: { wrapText: true, vertical: 'top' },
      };
    }
    if (ws[depositModeCellRef]) {
      ws[depositModeCellRef].s = {
        alignment: { wrapText: true, vertical: 'top' },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, 'orders.xlsx');
};

// export const billingUnitOptions = Object.entries(BillingUnit).map(([key, value]) => ({
//   id: key,
//   value,
// }));

export const paymentModeOptions = Object.entries(PaymentMode).map(([key, value]) => ({
  id: key,
  value,
}));

export const repaymentModeOptions = Object.entries(RepaymentMode).map(([key, value]) => ({
  id: key,
  value,
}));

export const transportOptions = Object.entries(TransportType).map(([key, value]) => ({
  id: key,
  value,
}));

export const transformRentalOrderData = (rentalOrders: RentalOrderInfo[]): RentalOrderType[] => {
  return rentalOrders.map((rentalOrder) => {
    if (!rentalOrder.customer) {
      return {
        ...rentalOrder,
        customer: {
          _id: '',
          name: '',
        },
      };
    }
    return {
      ...rentalOrder,
      customer: {
        _id: rentalOrder.customer._id,
        name: `${rentalOrder.customer.name}-${rentalOrder.customer.personal_number}`,
      },
    };
  });
};

// export const getOrderStatus = (order: RentalOrderInfo, balanceAmount: number): OrderStatusType => {
//   const now = new Date();
//   const totalAmount =
//     calculateFinalAmount(order as RentalOrderType) -
//     order.deposits.reduce((total, deposit) => total + deposit.amount, 0);

//   const hasRepair = order.product_details.some((p) => p.order_repair_count > 0);
//   if (hasRepair && order.status !== PaymentStatus.PAID) {
//     return OrderStatusType.MACHINE_REPAIR;
//   }

//   const isNotReturned = order.product_details.some((p) => {
//     if (p.type !== ProductType.RENTAL || !p.out_date) return false;

//     const outDate = new Date(p.out_date);
//     const expectedReturn = new Date(outDate);
//     expectedReturn.setDate(outDate.getDate() + (p.duration || 0));

//     return now > expectedReturn && p.order_quantity > 0;
//   });

//   if (isNotReturned && balanceAmount === 0 && order.status === PaymentStatus.PAID) {
//     return OrderStatusType.MACHINE_NOT_RETURN;
//   }

//   const isMachineWorking = order.product_details.some((p) => {
//     if (p.type !== 'rental' || !p.out_date) return false;

//     const outDate = new Date(p.out_date);
//     const expectedReturn = new Date(outDate);
//     expectedReturn.setDate(outDate.getDate() + (p.duration || 0));

//     return now <= expectedReturn;
//   });

//   if (isMachineWorking) {
//     return OrderStatusType.MACHINE_WORKING;
//   }

//   if (totalAmount > 0 && PaymentStatus.PENDING) {
//     return OrderStatusType.BILL_PENDING;
//   } else if (totalAmount < 0 && PaymentStatus.PENDING && !order.repay_date) {
//     return OrderStatusType.REPAYMENT_PENDING;
//   }

//   if (order.in_date) return OrderStatusType.PAID;
// };

export const getOrderStatus = (
  order: RentalOrderInfo,
  balanceAmount: number = 0
): OrderStatusType => {
  const now = new Date();

  const totalAmount =
    calculateFinalAmount(order as RentalOrderType) -
    order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  console.log(balanceAmount);

  const hasRepair = order.product_details.some((p) => p.order_repair_count > 0);
  if (hasRepair) {
    return OrderStatusType.MACHINE_REPAIR;
  }
  const isMachineWorking = order.product_details.some((p) => {
    if (p.type !== ProductType.RENTAL || !p.out_date) return false;

    const outDate = new Date(p.out_date);
    const expectedReturn = new Date(outDate);
    expectedReturn.setDate(outDate.getDate() + (p.duration || 0));

    if (p.in_date) return now <= new Date(p.in_date);
    return now <= expectedReturn;
  });
  if (isMachineWorking) {
    return OrderStatusType.MACHINE_WORKING;
  }
  const isNotReturned = order.product_details.some((p) => {
    if (p.type !== ProductType.RENTAL) return false;
    const notReturned = !p.in_date;

    return notReturned && p.order_quantity > 0;
  });
  if (isNotReturned) {
    return OrderStatusType.MACHINE_NOT_RETURN;
  }

  // if (totalAmount > 0 && order.status === PaymentStatus.PENDING) {
  //   return OrderStatusType.BILL_PENDING;
  // }

  if (totalAmount < 0 && order.status === PaymentStatus.PENDING) {
    return OrderStatusType.REPAYMENT_PENDING;
  }

  if (order.status === PaymentStatus.PAID) {
    return OrderStatusType.PAID;
  }
  return OrderStatusType.BILL_PENDING;
};

export const getOrderStatusColors = (status: OrderStatusType): { bg: string; text: string } => {
  const statusColors: Record<OrderStatusType, { bg: string; text: string }> = {
    [OrderStatusType.MACHINE_WORKING]: { bg: '#800080', text: '#FFFFFF' },
    [OrderStatusType.MACHINE_NOT_RETURN]: { bg: '#FFFF00', text: '#000000' },
    [OrderStatusType.BILL_PENDING]: { bg: '#0000FF', text: '#FFFFFF' },
    [OrderStatusType.REPAYMENT_PENDING]: { bg: '#FF0000', text: '#FFFFFF' },
    [OrderStatusType.PAID]: { bg: '#008000', text: '#FFFFFF' },
    [OrderStatusType.MACHINE_REPAIR]: { bg: '#000000', text: '#FFFFFF' },
  };

  return statusColors[status] || { bg: '#FFFFFF', text: '#000000' };
};
