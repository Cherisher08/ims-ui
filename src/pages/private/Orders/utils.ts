import { ValueFormatterParams, ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DiscountType, Product, ProductType } from '../../../types/common';
import {
  BillingMode,
  DepositType,
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

import * as XLSX from 'xlsx';

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

export const getDefaultProduct = (out_date: string, in_date: string) => {
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
  const discountAmount =
    orderInfo.discount_type === DiscountType.PERCENT
      ? calculateDiscountAmount(orderInfo.discount || 0, finalAmount)
      : orderInfo.discount || 0;
  const gstAmount = calculateDiscountAmount(orderInfo.gst || 0, finalAmount - discountAmount);
  return parseFloat(
    (finalAmount - discountAmount + gstAmount + roundOff + ewayBillAmount).toFixed(2)
  );
};

export const exportOrderToExcel = (orders: RentalOrderType[]) => {
  const ws = XLSX.utils.aoa_to_sheet([]);

  let currentRow = 0;

  orders.forEach((order) => {
    const mainDetails = [
      {
        Order_ID: order.order_id,
        Customer: order.customer?.name,
        Out_Date: dayjs(order.out_date).format('DD-MMM-YYYY hh:mm A') || '',
        In_Date:
          order.in_date && dayjs(order.in_date).isValid()
            ? dayjs(order.in_date).format('DD-MMM-YYYY hh:mm A')
            : '',
        Rental_Duration: order.rental_duration.toString() || '',
        Event_Name: order.event_name,
        Event_Address: order.event_address,
        Event_Venue: order.event_venue,
        Billing_Mode: order.billing_mode,
        GST: `${order.gst} %`,
        Discount: order.discount.toString() || '',
        Discount_Type: order.discount_type,
        Transport_Payment_Mode: order.eway_mode,
        Transport_Type: order.eway_type,
        Repayment_Mode: order.payment_mode,
        Balance_Paid_Date:
          order.balance_paid_date && dayjs(order.balance_paid_date).isValid()
            ? dayjs(order.balance_paid_date).format('DD-MMM-YYYY hh:mm A')
            : '',
        Balance_Paid_Mode: order.balance_paid_mode,
        Remarks: order.remarks,
        Deposit_Amount:
          order.deposits.reduce((total, deposit) => total + deposit.amount, 0).toString() || '',
        'Amount (Before Taxes)': calculateTotalAmount(order).toString(),
        Transport_Amount: order.eway_amount.toString() || '',
        Round_Off: order.round_off.toString() || '',
        'Balance Amount': Math.max(
          0,
          calculateFinalAmount(order) -
            order.deposits.reduce((total, deposit) => total + deposit.amount, 0)
        ).toFixed(2),
        'Amount (After Taxes)': calculateFinalAmount(order).toString(),
        Status: order.status,
      },
    ];

    XLSX.utils.sheet_add_json(ws, mainDetails, { origin: currentRow });
    currentRow += mainDetails.length;

    currentRow++;
    ws['!cols'] = [
      { wch: 20 }, //Order_ID
      { wch: 20 }, // Customer
      { wch: 20 }, //Out_Date
      { wch: 20 }, //In_Date
      { wch: 15 }, //Rental_Duration
      { wch: 20 }, //Event_Name
      { wch: 20 }, //Event_Address
      { wch: 20 }, //Event_Venue
      { wch: 15 }, //Billing_Mode
      { wch: 15 }, //GST
      { wch: 10 }, //Discount
      { wch: 15 }, //Discount_Type
      { wch: 25 }, //Transport_Payment_Mode
      { wch: 15 }, //Transport_Type
      { wch: 18 }, //Repayment_Mode
      { wch: 20 }, //Balance_Paid_Date
      { wch: 20 }, //Balance_Paid_Mode
      { wch: 20 }, //Remarks
      { wch: 15 }, //Deposit_Amount
      { wch: 20 }, //Amount (Before Taxes)
      { wch: 20 }, //Transport_Amount
      { wch: 10 }, //Round_Off
      { wch: 25 }, //Total Amount (After Taxes)
      { wch: 20 }, //Balance_Amount
      { wch: 15 }, //Status
    ];

    currentRow++;
    XLSX.utils.sheet_add_aoa(ws, [['Product Details']], { origin: currentRow });
    currentRow++;

    XLSX.utils.sheet_add_json(
      ws,
      order.product_details.map((p: ProductDetails) => ({
        // Product_Code: p.product_code,
        Product_Name: p.name,
        Billing_Unit: 'days',
        Out_Date: dayjs(p.out_date).format('DD-MMM-YYYY hh:mm A'),
        In_Date:
          p.in_date && dayjs(p.in_date).isValid()
            ? dayjs(p.in_date).format('DD-MMM-YYYY hh:mm A')
            : '',
        Duration: p.duration.toString(),
        Quantity: p.order_quantity.toString(),
        Order_Repair_Count: p.order_repair_count.toString(),
        Rent_Per_Unit: p.rent_per_unit.toString(),
        Final_Amount: (p.rent_per_unit * p.order_quantity * p.duration).toString(),
        Damage: p.damage || '-',
      })),
      { origin: currentRow }
    );

    currentRow += order.product_details.length;

    if (order.deposits.length > 0) {
      currentRow += 2;
      XLSX.utils.sheet_add_aoa(ws, [['Deposit Details']], { origin: currentRow });
      currentRow++;
      XLSX.utils.sheet_add_json(
        ws,
        order.deposits.map((d: DepositType) => ({
          Amount: d.amount.toString(),
          Date: dayjs(d.date).format('DD-MMM-YYYY hh:mm A'),
          Product: d.product?.name,
          Mode: d.mode,
        })),
        { origin: currentRow }
      );
      currentRow += order.deposits.length;
    } else {
      currentRow++;
    }

    currentRow += 2;
  });

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
