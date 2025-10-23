import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useEffect, useState } from 'react';
import { useGetRentalOrdersQuery } from '../../services/OrderService';
import { calculateDiscountAmount, calculateProductRent } from '../../services/utility_functions';
import CustomCard from '../../styled/CustomCard';
import CustomLineChart from '../../styled/CustomLineChart';
import CustomSelect from '../../styled/CustomSelect';
import AntSwitch from '../../styled/CustomSwitch';
import { DiscountType, OrderStatusType, ProductType } from '../../types/common';
import { BillingMode, OrderInfoType, PaymentStatus, RentalOrderInfo } from '../../types/order';
import { getOrderStatus } from './Orders/utils';
import CustomPieChart from '../../styled/CustomPieChart';
import CustomDatePicker from '../../styled/CustomDatePicker';

export const OrderStatusValues: string[] = Object.values(OrderStatusType);

dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

const addDaysToDate = (dateStr: string, days: number): string => {
  return dayjs(dateStr).add(days, 'day').format('YYYY-MM-DD');
};

type PendingAmount = { x: string; y: number };

type ChartType =
  | 'incoming_pending'
  | 'repayment_pending'
  | 'machines_in'
  | 'machines_out'
  | 'machines_repair'
  | 'machines_overdue'
  | 'order_status_summary';

type DateFilter = { start: string; end: string } | null;

// const getRentalDuration = (outDate: string, inDate: string, unit: BillingUnit): number => {
//   const out = new Date(outDate);
//   const inn = new Date(inDate);
//   const diffMs = inn.getTime() - out.getTime();

//   switch (unit) {
//     case BillingUnit.SHIFT:
//       return 1;
//     case BillingUnit.DAYS:
//       return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
//     case BillingUnit.WEEKS:
//       return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
//     case BillingUnit.MONTHS:
//       return Math.max(
//         1,
//         (inn.getFullYear() - out.getFullYear()) * 12 + (inn.getMonth() - out.getMonth())
//       );
//     default:
//       return 1;
//   }
// };

const calcFinalAmount = (order: OrderInfoType): number => {
  if (order.type === ProductType.RENTAL && order.product_details.length > 0) {
    const total = order.product_details.reduce((sum, prod) => {
      return sum + calculateProductRent(prod);
    }, 0);

    return parseFloat(total.toFixed(2));
  }
  return 0;
};

const groupKeyFormatter = (dateStr: string, filter: string) => {
  const date = dayjs(dateStr);
  switch (filter) {
    // case '1':
    //   return date.format('YYYY-MM-DD');
    // case '2':
    //   return `${date.year()}-W${date.week()}`;
    // case '3':
    //   return date.format('YYYY-MM');
    default:
      return date.format('YYYY-MM-DD');
  }
};

const getValidGroupKeys = (filter: string, filterDates: DateFilter): string[] => {
  const today = dayjs();
  const keys: string[] = [];

  if (filter === '1') {
    // Today
    const cursor = today.clone();
    keys.push(groupKeyFormatter(cursor.format('YYYY-MM-DD'), filter));
  } else if (filter === '2') {
    // Last 7 Days
    const start = today.subtract(6, 'days');
    const end = today;
    let cursor = start.clone();
    while (cursor.isSameOrBefore(end)) {
      keys.push(groupKeyFormatter(cursor.format('YYYY-MM-DD'), filter));
      cursor = cursor.add(1, 'day');
    }
  } else if (filter === '3') {
    // Current month: current month, from 1st to today
    const start = today.startOf('month');
    const end = today;
    let cursor = start.clone();
    while (cursor.isSameOrBefore(end)) {
      keys.push(groupKeyFormatter(cursor.format('YYYY-MM-DD'), filter));
      cursor = cursor.add(1, 'day');
    }
  } else if (filter === '4') {
    // custom: from start to end
    if (filterDates) {
      const start = dayjs(filterDates.start);
      const end = dayjs(filterDates.end);
      let cursor = start.clone();
      while (cursor.isSameOrBefore(end)) {
        keys.push(groupKeyFormatter(cursor.format('YYYY-MM-DD'), filter));
        cursor = cursor.add(1, 'day');
      }
    }
  }

  return keys;
};

const getChartData = (
  orders: RentalOrderInfo[],
  filter: string,
  filterDates: DateFilter,
  chartType: ChartType
) => {
  const groups: Record<string, number> = {};

  const validGroupKeys = getValidGroupKeys(filter, filterDates);

  orders.forEach((order) => {
    switch (chartType) {
      case 'incoming_pending': {
        const dateToGroupBy = order.in_date || addDaysToDate(order.out_date, order.rental_duration);
        const groupKey = groupKeyFormatter(dateToGroupBy, filter);
        if (!validGroupKeys.includes(groupKey)) break;
        const depositTotal = order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;
        const finalAmount = calcFinalAmount(order);
        const roundOff = order.round_off || 0;
        const discountAmount =
          order.discount_type === DiscountType.PERCENT
            ? calculateDiscountAmount(order.discount || 0, finalAmount)
            : order.discount || 0;
        const gstAmount =
          order.billing_mode === BillingMode.B2B
            ? 0
            : calculateDiscountAmount(order.gst, finalAmount);

        const pendingAmount =
          finalAmount -
          order.balance_paid -
          depositTotal -
          discountAmount +
          gstAmount +
          roundOff +
          order.eway_amount;

        if (pendingAmount > 0) {
          groups[groupKey] = (groups[groupKey] || 0) + pendingAmount;
        }
        break;
      }

      case 'repayment_pending': {
        const dateToGroupBy = order.in_date || addDaysToDate(order.out_date, order.rental_duration);
        const groupKey = groupKeyFormatter(dateToGroupBy, filter);
        if (!validGroupKeys.includes(groupKey)) break;
        const depositTotal = order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;
        const finalAmount = calcFinalAmount(order);
        const roundOff = order.round_off || 0;
        const discountAmount =
          order.discount_type === DiscountType.PERCENT
            ? calculateDiscountAmount(order.discount || 0, finalAmount)
            : order.discount || 0;
        const gstAmount =
          order.billing_mode === BillingMode.B2B
            ? 0
            : calculateDiscountAmount(order.gst, finalAmount);

        const pendingAmount =
          finalAmount - depositTotal - discountAmount + gstAmount + roundOff + order.eway_amount;

        if (pendingAmount < 0 && order.status === PaymentStatus.PENDING) {
          groups[groupKey] = (groups[groupKey] || 0) + Math.abs(pendingAmount);
        }
        break;
      }

      case 'machines_in': {
        order.product_details.forEach((p) => {
          if (p.in_date) {
            const productGroupKey = groupKeyFormatter(p.in_date, filter);
            if (validGroupKeys.includes(productGroupKey)) {
              groups[productGroupKey] = (groups[productGroupKey] || 0) + p.order_quantity;
            }
          }
        });
        break;
      }

      case 'machines_out': {
        order.product_details.forEach((p) => {
          if (p.out_date) {
            const productGroupKey = groupKeyFormatter(p.out_date, filter);
            if (validGroupKeys.includes(productGroupKey)) {
              groups[productGroupKey] = (groups[productGroupKey] || 0) + p.order_quantity;
            }
          }
        });
        break;
      }

      case 'machines_repair': {
        const dateToGroupBy = order.in_date || addDaysToDate(order.out_date, order.rental_duration);
        const groupKey = groupKeyFormatter(dateToGroupBy, filter);
        if (!validGroupKeys.includes(groupKey)) break;
        order.product_details.forEach((p) => {
          const repairCount = p.order_repair_count || 0;
          if (repairCount > 0) {
            groups[groupKey] = (groups[groupKey] || 0) + repairCount;
          }
        });
        break;
      }

      case 'machines_overdue': {
        order.product_details.forEach((p) => {
          if (p.out_date && !p.in_date) {
            const expectedInDate = addDaysToDate(p.out_date, order.rental_duration);
            if (dayjs(expectedInDate).isBefore(dayjs())) {
              const productGroupKey = groupKeyFormatter(expectedInDate, filter);
              if (validGroupKeys.includes(productGroupKey)) {
                groups[productGroupKey] = (groups[productGroupKey] || 0) + p.order_quantity;
              }
            }
          }
        });
        break;
      }

      case 'order_status_summary': {
        const dateToGroupBy = order.out_date;
        const groupKey = groupKeyFormatter(dateToGroupBy, filter);
        if (!validGroupKeys.includes(groupKey)) break;
        const currentStatus = getOrderStatus(order);
        groups[currentStatus] = (groups[currentStatus] || 0) + 1;
        break;
      }

      default:
        break;
    }
  });

  const validGroupKeysForChart =
    chartType === 'order_status_summary' ? OrderStatusValues : validGroupKeys;

  // guarantee that even group keys with zero are shown on the chart
  const chartData = validGroupKeysForChart.map((key) => ({
    x: key,
    y: groups[key] || 0,
  }));

  return chartData;
};

const getDetailsData = (
  orders: RentalOrderInfo[],
  chartType: ChartType,
  filter: string,
  filterDates: DateFilter
):
  | {
      pending: { name: string; amount: number }[];
      paid: { name: string; amount: number }[];
    }
  | { name: string; amount: number }[] => {
  const validGroupKeys = getValidGroupKeys(filter, filterDates);
  if (chartType === 'incoming_pending' || chartType === 'repayment_pending') {
    const pending: { name: string; amount: number }[] = [];
    const paid: { name: string; amount: number }[] = [];

    orders.forEach((order) => {
      const dateToGroupBy = order.in_date || addDaysToDate(order.out_date, order.rental_duration);
      const groupKey = groupKeyFormatter(dateToGroupBy, filter);

      // ignore if this group is outside the current date range
      if (!validGroupKeys.includes(groupKey)) return;
      const depositTotal = order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;
      const finalAmount = calcFinalAmount(order);
      const roundOff = order.round_off || 0;
      const discountAmount =
        order.discount_type === DiscountType.PERCENT
          ? calculateDiscountAmount(order.discount || 0, finalAmount)
          : order.discount || 0;
      const gstAmount =
        order.billing_mode === BillingMode.B2B
          ? 0
          : calculateDiscountAmount(order.gst, finalAmount);

      const pendingAmount = finalAmount - depositTotal - discountAmount + gstAmount + roundOff;

      if (order.status === PaymentStatus.PENDING) {
        if (chartType === 'incoming_pending' && pendingAmount > 0) {
          pending.push({
            name: order.customer ? order.customer.name : '',
            amount: Math.abs(pendingAmount),
          });
        } else if (chartType === 'repayment_pending' && pendingAmount < 0) {
          pending.push({
            name: order.customer ? order.customer.name : '',
            amount: Math.abs(pendingAmount),
          });
        }
      } else {
        // paid section
        if (chartType === 'incoming_pending' && pendingAmount > 0) {
          paid.push({
            name: order.customer ? order.customer.name : '',
            amount: Math.abs(pendingAmount),
          });
        } else if (chartType === 'repayment_pending' && pendingAmount < 0) {
          paid.push({
            name: order.customer ? order.customer.name : '',
            amount: Math.abs(pendingAmount),
          });
        }
      }
    });

    return { pending, paid };
  }

  // for machine types
  const data: { name: string; amount: number }[] = [];

  orders.forEach((order) => {
    switch (chartType) {
      case 'machines_in': {
        order.product_details.forEach((p) => {
          if (p.in_date) {
            data.push({
              name: p.name,
              amount: p.order_quantity,
            });
          }
        });
        break;
      }
      case 'machines_out': {
        order.product_details.forEach((p) => {
          if (p.out_date) {
            data.push({
              name: p.name,
              amount: p.order_quantity,
            });
          }
        });
        break;
      }
      case 'machines_repair': {
        order.product_details.forEach((p) => {
          const repairCount = p.order_repair_count || 0;
          if (repairCount > 0) {
            data.push({
              name: p.name,
              amount: repairCount,
            });
          }
        });
        break;
      }
      case 'machines_overdue': {
        order.product_details.forEach((p) => {
          if (p.out_date && !p.in_date) {
            const expectedInDate = addDaysToDate(p.out_date, order.rental_duration);
            if (dayjs(expectedInDate).isBefore(dayjs())) {
              data.push({
                name: p.name,
                amount: p.order_quantity,
              });
            }
          }
        });
        break;
      }
      default:
        break;
    }
  });

  return data;
};

const Dashboard = () => {
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();
  const [filter, setFilter] = useState<string>('3');
  const [filterDates, setFilterDates] = useState<{ start: string; end: string } | null>(null);
  const [orders, setOrders] = useState<RentalOrderInfo[]>([]);
  const [showPendingAmountsOnly, setShowPendingAmountsOnly] = useState<boolean>(false);
  const [chartData, setChartData] = useState<PendingAmount[]>([]);
  const [graphFilter, setGraphFilter] = useState<ChartType>('incoming_pending');
  const detailsData = getDetailsData(orders, graphFilter, filter, filterDates);
  const filterOptions = [
    { id: '1', value: 'Today' },
    { id: '2', value: 'Last 7 Days' },
    { id: '3', value: 'Current Month' },
    { id: '4', value: 'Custom' },
  ];
  const isPriceData = ['incoming_pending', 'repayment_pending'].includes(graphFilter);

  const [totalInfo, setTotalInfo] = useState({
    balanceAmount: 0,
    repaymentAmount: 0,
    depositAmount: 0,
    receivedAmount: 0,
    mcIn: 0,
    mcOut: 0,
  });

  useEffect(() => {
    if (isRentalOrdersQuerySuccess) {
      setOrders(rentalOrderData);
    }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

  useEffect(() => {
    const validGroupKeys = getValidGroupKeys(filter, filterDates);

    const filteredOrders = orders.filter((order) => {
      const dateToGroupBy = order.in_date || addDaysToDate(order.out_date, order.rental_duration);
      const orderGroupKey = groupKeyFormatter(dateToGroupBy, filter);
      return validGroupKeys.includes(orderGroupKey);
    });

    let balanceAmount = 0;
    let repaymentAmount = 0;
    let depositAmount = 0;
    let receivedAmount = 0;
    let mcIn = 0;
    let mcOut = 0;

    // Calculate balanceAmount and repaymentAmount from filtered orders
    filteredOrders.forEach((order) => {
      const depositSum = order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;

      const finalAmount = calcFinalAmount(order);
      const roundOff = order.round_off || 0;
      const discountAmount =
        order.discount_type === DiscountType.PERCENT
          ? calculateDiscountAmount(order.discount || 0, finalAmount)
          : order.discount || 0;
      const gstAmount =
        order.billing_mode === BillingMode.B2B
          ? 0
          : calculateDiscountAmount(order.gst, finalAmount);

      const pendingAmount =
        finalAmount - order.balance_paid - depositSum - discountAmount + gstAmount + roundOff;

      if (showPendingAmountsOnly) {
        if (order.status === PaymentStatus.PENDING) {
          if (pendingAmount > 0) {
            balanceAmount += pendingAmount;
          }
          if (pendingAmount < 0) {
            repaymentAmount += Math.abs(pendingAmount);
          }
        }
      } else {
        if (pendingAmount > 0) balanceAmount += pendingAmount; // total billed regardless of status
        if (pendingAmount < 0) repaymentAmount += Math.abs(pendingAmount);
      }
    });

    // Calculate depositAmount and receivedAmount based on deposit dates and balance paid dates within filter
    orders.forEach((order) => {
      order.deposits.forEach((dep) => {
        const depKey = groupKeyFormatter(dep.date, filter);
        if (validGroupKeys.includes(depKey)) {
          depositAmount += dep.amount;
          receivedAmount += dep.amount;
        }
      });
      const balKey = groupKeyFormatter(order.balance_paid_date, filter);
      if (validGroupKeys.includes(balKey)) {
        receivedAmount += order.balance_paid;
      }
    });

    // Calculate mcIn and mcOut from all orders based on product dates within filter
    orders.forEach((order) => {
      order.product_details.forEach((product) => {
        if (product.in_date) {
          const productGroupKey = groupKeyFormatter(product.in_date, filter);
          if (validGroupKeys.includes(productGroupKey)) {
            mcIn += product.order_quantity;
          }
        }
        if (product.out_date) {
          const productGroupKey = groupKeyFormatter(product.out_date, filter);
          if (validGroupKeys.includes(productGroupKey)) {
            mcOut += product.order_quantity;
          }
        }
      });
    });

    setTotalInfo({
      balanceAmount,
      repaymentAmount,
      depositAmount,
      receivedAmount,
      mcIn,
      mcOut,
    });
  }, [filter, filterDates, orders, showPendingAmountsOnly]);

  useEffect(() => {
    const pendingData = getChartData(orders, filter, filterDates, graphFilter);
    setChartData(pendingData);
  }, [filter, filterDates, graphFilter, orders]);

  return (
    <div className="h-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="w-full flex justify-between items-start mb-3">
        <p className="text-primary font-bold">Overview</p>
        <div className="flex gap-4">
          {filter === '4' && (
            <>
              <CustomDatePicker
                label={'Start Date'}
                value={filterDates ? filterDates.start : ''}
                onChange={(startDate) => {
                  setFilterDates({ start: startDate, end: filterDates ? filterDates.end : '' });
                }}
                wrapperClass="flex-row items-center"
                format="YYYY-MM-DD"
              />
              <CustomDatePicker
                label={'End Date'}
                value={filterDates ? filterDates.end : ''}
                onChange={(endDate) => {
                  setFilterDates({ start: filterDates ? filterDates.start : '', end: endDate });
                }}
                wrapperClass="flex-row items-center"
                format="YYYY-MM-DD"
              />
            </>
          )}
          <CustomSelect
            label=""
            onChange={(val) => setFilter(val)}
            className="w-[8rem]"
            options={filterOptions}
            value={filter}
          />
          <div className="flex pt-2 gap-2">
            <p>All</p>
            <AntSwitch
              checked={showPendingAmountsOnly}
              onChange={(e) => {
                setShowPendingAmountsOnly(e.target.checked);
              }}
            />
            <p>Pending</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] items-center justify-center gap-4">
          <CustomCard
            title="Balance Amount"
            className="grow"
            value={`₹${totalInfo.balanceAmount.toFixed(2)}`}
          />
          <CustomCard
            title="Repayment Amount"
            className="grow"
            value={`₹${totalInfo.repaymentAmount.toFixed(2)}`}
          />
          <CustomCard
            title="Deposited Amount"
            className="grow"
            value={`₹${totalInfo.depositAmount.toFixed(2)}`}
          />
          <CustomCard
            title="Received Amount"
            className="grow"
            value={`₹${totalInfo.receivedAmount.toFixed(2)}`}
          />
          <CustomCard title="Machine Out" className="grow" value={`${totalInfo.mcOut}`} />
          <CustomCard title="Machine In" className="grow" value={`${totalInfo.mcIn}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[75%_auto] w-full gap-3 pb-4">
          <div className="flex flex-col bg-gray-50 rounded-xl gap-1 px-3 max-h-[26rem] py-2 h-full">
            <ul className="flex flex-row text-sm gap-3">
              <li
                className={`cursor-pointer ${
                  graphFilter == 'incoming_pending' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('incoming_pending')}
              >
                Balance Pending
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 'repayment_pending' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('repayment_pending')}
              >
                Return Pending
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 'machines_in' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('machines_in')}
              >
                Machines In
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 'machines_out' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('machines_out')}
              >
                Machines Out
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 'machines_repair' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('machines_repair')}
              >
                Machines Repair
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 'machines_overdue' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('machines_overdue')}
              >
                Machines Overdue
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 'order_status_summary' ? 'text-black' : 'text-gray-500'
                }`}
                onClick={() => setGraphFilter('order_status_summary')}
              >
                Order Status Summary
              </li>
            </ul>
            {graphFilter === 'order_status_summary' ? (
              <CustomPieChart chartData={chartData} title="" />
            ) : (
              <CustomLineChart chartData={chartData} title="" isYPrice={isPriceData} />
            )}
          </div>
          <div className="rounded-xl p-4 bg-gray-50 flex flex-col gap-1 max-h-[26rem] overflow-y-auto">
            <p className="text-lg font-semibold">Details</p>
            <ul className="flex flex-col gap-3 px-4 h-full overflow-y-auto">
              {'pending' in detailsData ? (
                <>
                  <li key={'table-header'} className="flex justify-between text-sm">
                    <span>Customer</span>
                    <span>Amount</span>
                  </li>
                  <h3 className="font-bold mt-2">Pending</h3>
                  {detailsData.pending.length === 0 && (
                    <li className="text-gray-400 italic">No pending</li>
                  )}
                  {detailsData.pending.map(
                    (record: { name: string; amount: number }, index: number) => (
                      <li key={'pending-' + index} className="flex justify-between text-sm">
                        <span>{record.name}</span>
                        <span>{`₹${record.amount.toFixed(2)}`}</span>
                      </li>
                    )
                  )}

                  <h3 className="font-bold mt-4">Paid</h3>
                  {detailsData.paid.length === 0 && (
                    <li className="text-gray-400 italic">No paid</li>
                  )}
                  {detailsData.paid.map(
                    (record: { name: string; amount: number }, index: number) => (
                      <li key={'paid-' + index} className="flex justify-between text-sm">
                        <span>{record.name}</span>
                        <span>{`₹${record.amount.toFixed(2)}`}</span>
                      </li>
                    )
                  )}
                </>
              ) : (
                <>
                  <li key={'table-header'} className="flex justify-between text-sm">
                    <span>Product</span>
                    <span>Nos</span>
                  </li>
                  {Array.isArray(detailsData) && detailsData.length === 0 && (
                    <li className="text-gray-400 italic">No data available</li>
                  )}
                  {Array.isArray(detailsData) &&
                    detailsData.map((record, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{record.name}</span>
                        <span>{record.amount}</span>
                      </li>
                    ))}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
