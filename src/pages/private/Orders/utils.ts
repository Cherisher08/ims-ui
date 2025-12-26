import {
  IDateFilterParams,
  ValueFormatterParams,
  ValueGetterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DiscountType, OrderStatusType, Product, ProductType } from '../../../types/common';
import {
  BillingMode,
  BillingUnit,
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

import XLSX from 'xlsx-js-style';

import { calculateDiscountAmount, calculateProductRent } from '../../../services/utility_functions';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

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
  const month = now.getMonth() + 1;
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

export const getSplitOrderId = (orderId: string, orders: OrderInfo[]): string => {
  const relatedOrders = orders.map((o) => o.order_id).filter((id) => id.startsWith(orderId));

  const existingSuffixes = relatedOrders
    .map((id) => {
      const match = id.match(/\/([A-Z])$/);
      return match ? match[1] : null;
    })
    .filter(Boolean) as string[];

  if (existingSuffixes.length === 0) {
    return `${orderId}/A`;
  }

  const nextCharCode = Math.max(...existingSuffixes.map((ch) => ch.charCodeAt(0))) + 1;

  const nextSuffix = String.fromCharCode(nextCharCode);
  return `${orderId}/${nextSuffix}`;
};

export const isValidOrder = (order: RentalOrderInfo): boolean => {
  if (
    order.eway_amount === 0 &&
    order.deposits.length === 0 &&
    order.product_details.length === 0
  ) {
    return false;
  }
  return true;
};

export const getLatestInvoiceId = (orders: OrderInfo[]): string => {
  const invoiceIds = orders
    .map((order) => order.invoice_id)
    .filter((id): id is string => Boolean(id) && id.startsWith('INV/'));

  if (invoiceIds.length === 0) {
    const fy = new Date().getFullYear();
    return `INV/${fy}/0001`;
  }

  let latestNum = 0;
  let latestFy = new Date().getFullYear();

  invoiceIds.forEach((id) => {
    const parts = id.split('/');
    const fy = parts[1];
    const num = parseInt(parts[2], 10);

    if (!isNaN(num) && num > latestNum) {
      latestNum = num;
      latestFy = parseInt(fy, 10);
    }
  });

  const nextNum = (latestNum + 1).toString().padStart(4, '0');

  return `INV/${latestFy}/${nextNum}`;
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
    invoice_id: '',
    invoice_date: null,
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

export const getDuration = (
  out_date: string,
  in_date: string,
  billing_unit: BillingUnit = BillingUnit.DAYS
) => {
  let duration = 0;
  if (!out_date || !in_date) return duration;

  const start = dayjs(out_date).second(0).millisecond(0);
  const end = dayjs(in_date).second(0).millisecond(0);

  switch (billing_unit) {
    case BillingUnit.SHIFT: {
      const hoursDiff = end.diff(start, 'hour');
      duration = Math.ceil(hoursDiff / 8) || 0;
      break;
    }
    case BillingUnit.DAYS:
      duration = end.diff(start, 'day') || 0;
      break;
    case BillingUnit.WEEKS:
      duration = end.diff(start, 'week') || 0;
      break;
    case BillingUnit.MONTHS:
      duration = end.diff(start, 'month') || 0;
      break;
    default:
      duration = 1;
  }

  return duration + 1;
};

export const getDefaultProduct = (out_date: string, in_date?: string) => {
  const inDate = in_date || '';
  const outDate = out_date || utcString();
  const duration = inDate ? getDuration(outDate, inDate) : 1;
  return {
    _id: '',
    name: '',
    type: ProductType.RENTAL,
    category: '',
    billing_unit: BillingUnit.DAYS,
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

export const getRentalDuration = (outDate: string, inDate: string, unit: BillingUnit): number => {
  const out = new Date(outDate);
  const inn = new Date(inDate);
  const diffMs = inn.getTime() - out.getTime();

  switch (unit) {
    case BillingUnit.SHIFT:
      return 1;
    case BillingUnit.DAYS:
      return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    case BillingUnit.WEEKS:
      return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
    case BillingUnit.MONTHS:
      return Math.max(
        1,
        (inn.getFullYear() - out.getFullYear()) * 12 + (inn.getMonth() - out.getMonth())
      );
    default:
      return 1;
  }
};

export const calculateFinalAmount = (
  orderInfo: RentalOrderType,
  isBalancePaidIncluded: boolean = true
) => {
  const finalAmount = calculateTotalAmount(orderInfo);
  const roundOff = orderInfo.round_off || 0;
  const ewayBillAmount = orderInfo.eway_amount || 0;
  const balance_paid = isBalancePaidIncluded ? orderInfo.balance_paid || 0 : 0;
  const discountAmount =
    orderInfo.discount_type === DiscountType.PERCENT
      ? calculateDiscountAmount(orderInfo.discount || 0, finalAmount)
      : orderInfo.discount || 0;
  const gstAmount = calculateDiscountAmount(orderInfo.gst || 0, finalAmount - discountAmount);
  const damageExpenses = orderInfo.damage_expenses || 0;
  return parseFloat(
    (
      finalAmount -
      discountAmount -
      balance_paid +
      gstAmount +
      roundOff +
      ewayBillAmount +
      damageExpenses
    ).toFixed(2)
  );
};

export const exportOrderToExcel = (orders: RentalOrderType[] | RentalOrderInfo[]) => {
  const ws = XLSX.utils.aoa_to_sheet([]);

  const data: Record<string, string | number>[] = [];

  let totalDeposit = 0;
  let totalBeforeTax = 0;
  let totalAfterTax = 0;
  let totalBalance = 0;
  let totalRepayment = 0;

  orders.forEach((order) => {
    const products = order.product_details;
    const deposits = order.deposits;
    const maxRows = Math.max(products.length || 1, deposits.length || 1);

    for (let i = 0; i < maxRows; i++) {
      const balanceAmount = Math.max(
        0,
        calculateFinalAmount(order as RentalOrderType) -
          order.deposits.reduce((total, deposit) => total + deposit.amount, 0)
      );
      const repaymentAmount = Math.abs(
        Math.min(
          0,
          calculateFinalAmount(order as RentalOrderType) -
            order.deposits.reduce((total, deposit) => total + deposit.amount, 0)
        )
      );

      const customerDetails = () => {
        if (!order.customer) {
          return { name: '', phone: '' };
        }
        // Check if order is instance of RentalOrderInfo (has personal_number)
        if ('personal_number' in order.customer) {
          return {
            name: order.customer.name || '',
            phone: order.customer.personal_number || '',
          };
        } else {
          // RentalOrderType: name is "name-phone"
          const parts = (order.customer.name || '').split('-');
          const phone = parts.pop() || ''; // last part is phone
          const name = parts.join('-') || ''; // rest is name
          return {
            name,
            phone,
          };
        }
      };

      data.push({
        'Order ID': order.order_id,
        Customer: customerDetails().name,
        'Customer Number': customerDetails().phone,
        'Balance Amount': balanceAmount,
        'Order Out Date': order.out_date ? dayjs(order.out_date).format('DD-MMM-YYYY hh:mm A') : '',
        'Order In Date':
          order.in_date && dayjs(order.in_date).isValid()
            ? dayjs(order.in_date).format('DD-MMM-YYYY hh:mm A')
            : '',
        Month: dayjs(order.out_date).format('MMMM'),
        'Rental Duration': order.rental_duration?.toString() || '',
        'Deposit Amount': i < deposits.length ? deposits[i].amount : '',
        'Deposit Mode': i < deposits.length ? deposits[i].mode.toString() : '',
        Products: i < products.length ? products[i].name : '',
        'Product Type': i < products.length ? products[i].type.toString() : '',
        'Product Amounts':
          i < products.length
            ? products[i].rent_per_unit * products[i].order_quantity * products[i].duration
            : '',
        'Order Quantity': i < products.length ? products[i].order_quantity.toString() : '',
        'Amount (Before Taxes)': calculateTotalAmount(order as RentalOrderType),
        'Amount (After Taxes)': calculateFinalAmount(order as RentalOrderType, false),
        'Repayment Amount': repaymentAmount,
        'Repayment Mode': order.payment_mode,
        GST: `${order.gst} %`,
        Discount: order.discount?.toString() || '',
        'Discount Type': order.discount_type,
        'Transport Amount': order.eway_amount || '',
        'Transport Payment Mode': order.eway_mode,
        'Transport Type': order.eway_type,
        'Round Off': order.round_off || '',
        'Balance Paid Date':
          order.balance_paid_date && dayjs(order.balance_paid_date).isValid()
            ? dayjs(order.balance_paid_date).format('DD-MMM-YYYY hh:mm A')
            : '',
        'Balance Paid Mode': order.balance_paid_mode,
        'Event Name': order.event_name,
        'Event Venue': order.event_venue,
        'Event Address': order.event_address,
        'Billing Mode': order.billing_mode,
        Status: getOrderStatus(order as RentalOrderInfo),
        Remarks: order.remarks,
      });

      // Accumulate totals
      if (i < deposits.length) {
        totalDeposit += deposits[i].amount;
      }
      if (i === 0) {
        totalBeforeTax += calculateTotalAmount(order as RentalOrderType);
        totalAfterTax += calculateFinalAmount(order as RentalOrderType, false);
        totalBalance += balanceAmount;
        totalRepayment += repaymentAmount;
      }
    }
  });

  // Add summary row with a blank line before it
  data.push({}); // blank line

  const summaryRowIndex = data.length; // index of summary row after push

  data.push({
    'Order ID': 'Order Summary',
    'Deposit Amount': `₹${totalDeposit.toFixed(2)}`,
    'Amount (Before Taxes)': `₹${totalBeforeTax.toFixed(2)}`,
    'Amount (After Taxes)': `₹${totalAfterTax.toFixed(2)}`,
    'Balance Amount': `₹${totalBalance.toFixed(2)}`,
    'Repayment Amount': `₹${totalRepayment.toFixed(2)}`,
  });

  XLSX.utils.sheet_add_json(ws, data, { origin: 0 });

  // Bold the entire summary row and add thick top and bottom borders
  const summaryRange = XLSX.utils.decode_range(ws['!ref'] || '');
  for (let C = summaryRange.s.c; C <= summaryRange.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: summaryRowIndex + 1, c: C });
    if (!ws[cellRef]) {
      ws[cellRef] = { t: 's', v: '' }; // create empty cell if not exists
    }

    ws[cellRef].s = ws[cellRef].s || {};
    ws[cellRef].s.font = { bold: true };
    ws[cellRef].s.border = {
      top: { style: 'thick' },
      bottom: { style: 'thick' },
    };
  }

  // // Set center alignment for merged Order ID cells
  // merges.forEach((merge) => {
  //   const cellRef = XLSX.utils.encode_cell(merge.s);
  //   if (ws[cellRef]) {
  //     ws[cellRef].s = {
  //       alignment: { horizontal: 'center', vertical: 'center' },
  //     };
  //   }
  // });

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
    const productCellRef = XLSX.utils.encode_cell({ r: R, c: 8 });
    const amountCellRef = XLSX.utils.encode_cell({ r: R, c: 9 });
    const quantityCellRef = XLSX.utils.encode_cell({ r: R, c: 10 });
    const depositAmountCellRef = XLSX.utils.encode_cell({ r: R, c: 6 });
    const depositModeCellRef = XLSX.utils.encode_cell({ r: R, c: 7 });

    if (ws[productCellRef]) {
      ws[productCellRef].s = ws[productCellRef].s || {};
      ws[productCellRef].s.alignment = { wrapText: true, vertical: 'top' };
    }
    if (ws[amountCellRef]) {
      ws[amountCellRef].s = ws[amountCellRef].s || {};
      ws[amountCellRef].s.alignment = { wrapText: true, vertical: 'top' };
    }
    if (ws[quantityCellRef]) {
      ws[quantityCellRef].s = ws[quantityCellRef].s || {};
      ws[quantityCellRef].s.alignment = { wrapText: true, vertical: 'top' };
    }
    if (ws[depositAmountCellRef]) {
      ws[depositAmountCellRef].s = ws[depositAmountCellRef].s || {};
      ws[depositAmountCellRef].s.alignment = { wrapText: true, vertical: 'top' };
    }
    if (ws[depositModeCellRef]) {
      ws[depositModeCellRef].s = ws[depositModeCellRef].s || {};
      ws[depositModeCellRef].s.alignment = { wrapText: true, vertical: 'top' };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, `orders_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
};

export const billingUnitOptions = Object.entries(BillingUnit).map(([key, value]) => ({
  id: key,
  value,
}));

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
        name: `${rentalOrder.customer.name}-${rentalOrder.customer.personal_number}${
          rentalOrder.customer.office_number ? `-${rentalOrder.customer.office_number}` : ''
        }`,
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

export const getOrderStatus = (order: RentalOrderInfo): OrderStatusType => {
  const now = new Date();
  if (order.status === PaymentStatus.CANCELLED) {
    return OrderStatusType.CANCELLED;
  }

  if (order.status === PaymentStatus.NO_BILL) {
    return OrderStatusType.NO_BILL;
  }

  const totalAmount =
    calculateFinalAmount(order as RentalOrderType) -
    order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  const hasRepair = order.product_details.some((p) => p.order_repair_count > 0);

  if (hasRepair && order.status !== PaymentStatus.PAID) {
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
    [OrderStatusType.CANCELLED]: { bg: '#FF9900', text: '#FFFFFF' },
    [OrderStatusType.NO_BILL]: { bg: '#FF00FF', text: '#FFFFFF' },
  };

  return statusColors[status] || { bg: '#FFFFFF', text: '#000000' };
};

export function extractOrder(
  oldOrder: RentalOrderInfo,
  newOrder: RentalOrderInfo
): RentalOrderInfo {
  const updatedOrder: RentalOrderInfo = JSON.parse(JSON.stringify(oldOrder));

  updatedOrder.product_details = updatedOrder.product_details.map((prod) => {
    const extractedProd = newOrder.product_details.find((p) => p._id === prod._id);
    if (extractedProd) {
      const remainingQty = (prod.order_quantity || 0) - (extractedProd.order_quantity || 0);
      return {
        ...prod,
        order_quantity: remainingQty > 0 ? remainingQty : 0,
      };
    }
    return prod;
  });

  updatedOrder.product_details = updatedOrder.product_details.filter((p) => p.order_quantity > 0);

  if (newOrder.deposits?.length) {
    updatedOrder.deposits = updatedOrder.deposits
      .map((dep) => {
        const newDep = newOrder.deposits.find((d) => d._id === dep._id);
        if (newDep) {
          if (newDep.amount >= dep.amount) {
            return null;
          }
          const remainingDep = dep.amount - newDep.amount;

          return {
            ...dep,
            amount: remainingDep > 0 ? remainingDep : 0,
          };
        }

        return dep;
      })
      .filter((dep): dep is NonNullable<typeof dep> => dep !== null && dep.amount > 0);
  }

  updatedOrder.eway_amount = (oldOrder.eway_amount || 0) - (newOrder.eway_amount || 0);
  if (updatedOrder.eway_amount <= 0) {
    updatedOrder.eway_amount = 0;
    updatedOrder.eway_mode = PaymentMode.NULL;
    updatedOrder.eway_type = TransportType.NULL;
  }

  updatedOrder.balance_paid = (oldOrder.balance_paid || 0) - (newOrder.balance_paid || 0);
  if (updatedOrder.balance_paid <= 0) {
    updatedOrder.balance_paid = 0;
    updatedOrder.balance_paid_mode = PaymentMode.NULL;
    updatedOrder.balance_paid_date = '';
  }

  return updatedOrder;
}

export const getAvailableStockQuantity = (
  currentProductStock: number,
  product: ProductDetails,
  newOrderInfo: RentalOrderInfo,
  existingRentalOrder?: RentalOrderInfo
) => {
  const oldStock =
    existingRentalOrder?.product_details.find((p) => p._id === product._id)?.order_quantity || 0;

  let newQuantity = 0;
  if (existingRentalOrder) {
    if (
      existingRentalOrder.status !== PaymentStatus.NO_BILL &&
      newOrderInfo.status === PaymentStatus.NO_BILL
    ) {
      if (product.type === ProductType.RENTAL && product.in_date) {
        newQuantity = currentProductStock + oldStock;
      } else if (product.type === ProductType.RENTAL && !product.in_date) {
        newQuantity = currentProductStock + oldStock - product.order_quantity;
      } else {
        newQuantity = currentProductStock;
      }
    } else if (
      existingRentalOrder.status === PaymentStatus.PENDING &&
      newOrderInfo.status === PaymentStatus.PENDING
    ) {
      newQuantity = currentProductStock + oldStock - product.order_quantity;
    } else if (
      existingRentalOrder.status === PaymentStatus.PENDING &&
      (newOrderInfo.status === PaymentStatus.PAID ||
        newOrderInfo.status === PaymentStatus.CANCELLED) &&
      product.type === ProductType.RENTAL
    ) {
      newQuantity = currentProductStock + oldStock;
    } else if (
      (existingRentalOrder.status === PaymentStatus.PAID ||
        existingRentalOrder.status === PaymentStatus.CANCELLED) &&
      newOrderInfo.status === PaymentStatus.PENDING
    ) {
      newQuantity = currentProductStock - product.order_quantity;
    } else {
      newQuantity = currentProductStock;
    }
  } else if (newOrderInfo.status === PaymentStatus.PAID && product.type === ProductType.RENTAL) {
    newQuantity = currentProductStock;
  } else newQuantity = currentProductStock - product.order_quantity;

  return newQuantity;
};

export const exportInvoiceToExcel = (orders: RentalOrderType[] | RentalOrderInfo[]) => {
  const ws = XLSX.utils.aoa_to_sheet([]);

  const data: Record<string, string | number>[] = [];

  const getCustomerDetails = (order: RentalOrderType | RentalOrderInfo) => {
    if (!order.customer) return { name: '', phone: '', gst: '' };
    if ('personal_number' in order.customer) {
      const custObj = order.customer as unknown as Record<string, unknown>;
      const gstVal =
        typeof custObj['gst_number'] === 'string'
          ? (custObj['gst_number'] as string)
          : typeof custObj['gst_no'] === 'string'
          ? (custObj['gst_no'] as string)
          : '';
      return {
        name: order.customer.name || '',
        phone: order.customer.personal_number || '',
        gst: gstVal,
      };
    }
    const parts = (order.customer.name || '').split('-');
    const phone = parts.pop() || '';
    const name = parts.join('-') || '';
    return { name, phone, gst: '' };
  };

  orders.forEach((order) => {
    const cust = getCustomerDetails(order as RentalOrderType);

    const totalBeforeTax = calculateTotalAmount(order as RentalOrderType);
    const discountAmount =
      order.discount_type === DiscountType.PERCENT
        ? calculateDiscountAmount(order.discount || 0, totalBeforeTax)
        : order.discount || 0;
    const gstCost = calculateDiscountAmount(order.gst || 0, totalBeforeTax - discountAmount);
    const amountAfterTax = calculateFinalAmount(order as RentalOrderType, false);

    data.push({
      'Invoice no': order.invoice_id || '',
      Month: order.invoice_date
        ? dayjs(order.invoice_date).format('MMMM')
        : order.in_date
        ? dayjs(order.in_date).format('MMMM')
        : '',
      'Invoice Date': order.invoice_date
        ? dayjs(order.invoice_date).format('DD-MMM-YYYY hh:mm A')
        : order.in_date
        ? dayjs(order.in_date).format('DD-MMM-YYYY hh:mm A')
        : '',
      Customer: cust.name,
      'Phone number': cust.phone,
      'Event name': order.event_name || '',
      'Bill Amount': totalBeforeTax,
      'Gst no': cust.gst || '',
      'Gst cost': gstCost,
      'Transport Amount': order.eway_amount || 0,
      'Discount Amount': discountAmount,
      'Amount after tax': amountAfterTax,
    });
  });

  XLSX.utils.sheet_add_json(ws, data, { origin: 0 });

  ws['!cols'] = [
    { wch: 20 }, // Invoice no
    { wch: 15 }, // Month
    { wch: 20 }, // Bill Date
    { wch: 30 }, // Customer
    { wch: 18 }, // Phone number
    { wch: 25 }, // Event name
    { wch: 15 }, // Bill Amount
    { wch: 18 }, // Gst no
    { wch: 15 }, // Gst cost
    { wch: 18 }, // Amount after tax
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
  XLSX.writeFile(wb, `invoices_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
};

export const parseDateFromString = (dateStr: string | null): Date | null => {
  const parsedDate = dayjs(dateStr);
  return parsedDate.isValid() ? parsedDate.toDate() : null;
};

export const dateFilterParams: IDateFilterParams = {
  isValidDate: (targetCellValue: Date) => {
    return dayjs(targetCellValue).isValid();
  },
  comparator: (filterLocalDateAtMidnight: Date, cellValue: Date) => {
    const cellDate = dayjs(cellValue).startOf('day');
    const filterDate = dayjs(filterLocalDateAtMidnight).startOf('day');
    if (cellDate.isBefore(filterDate)) {
      return -1;
    } else if (cellDate.isAfter(filterDate)) {
      return 1;
    }
    return 0;
  },
};
