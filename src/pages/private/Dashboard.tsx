import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetRentalOrdersQuery } from '../../services/OrderService';
import { calculateDiscountAmount, calculateProductRent } from '../../services/utility_functions';
import CustomCard from '../../styled/CustomCard';
import CustomLineChart from '../../styled/CustomLineChart';
import CustomSelect from '../../styled/CustomSelect';
import AntSwitch from '../../styled/CustomSwitch';
import { DiscountType, OrderStatusType, ProductType } from '../../types/common';
import { BillingMode, PaymentStatus, RentalOrderInfo, RentalOrderType } from '../../types/order';
import { getOrderStatus, calculateFinalAmount } from './Orders/utils';
import CustomPieChart from '../../styled/CustomPieChart';
import CustomDatePicker from '../../styled/CustomDatePicker';
import BranchSelector from '../../components/BranchSelector';
import { RiFileExcel2Line } from 'react-icons/ri';
import XLSX from 'xlsx-js-style';

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
  chartType: ChartType,
  showPendingAmountsOnly: boolean
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
        const finalAmount = calculateFinalAmount(order as RentalOrderType, false);
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
        const finalAmount = calculateFinalAmount(order as RentalOrderType, false);
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

        if (pendingAmount < 0) {
          if (showPendingAmountsOnly && order.status !== PaymentStatus.PENDING) break;
          groups[groupKey] = (groups[groupKey] || 0) + Math.abs(pendingAmount);
        }
        break;
      }

      case 'machines_in': {
        order.product_details.forEach((p) => {
          if (p.in_date && p.type === ProductType.RENTAL) {
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
          if (p.out_date && p.type === ProductType.RENTAL) {
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
          if (p.out_date && !p.in_date && p.type === ProductType.RENTAL) {
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
        if (validGroupKeys.includes(groupKey)) {
          const currentStatus = getOrderStatus(order);
          groups[currentStatus] = (groups[currentStatus] || 0) + 1;
        }
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
      const finalAmount = calculateFinalAmount(order as RentalOrderType, false);
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
        if (order.status === PaymentStatus.CANCELLED || order.status === PaymentStatus.NO_BILL)
          return; // skip cancelled orders
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
          const productGroupKey = groupKeyFormatter(p.in_date, filter);
          if (validGroupKeys.includes(productGroupKey) && p.type === ProductType.RENTAL) {
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
          const productGroupKey = groupKeyFormatter(p.out_date, filter);
          if (validGroupKeys.includes(productGroupKey) && p.type === ProductType.RENTAL) {
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
          const productGroupKey = groupKeyFormatter(p.in_date, filter);
          if (repairCount > 0 && validGroupKeys.includes(productGroupKey)) {
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
            if (dayjs(expectedInDate).isBefore(dayjs()) && p.type === ProductType.RENTAL) {
              data.push({
                name: p.name,
                amount: p.order_quantity,
              });
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
        const existing = data.find((d) => d.name === currentStatus);
        if (existing) {
          existing.amount += 1;
        } else {
          data.push({ name: currentStatus, amount: 1 });
        }
        break;
      }
      default:
        break;
    }
  });

  return data;
};

const Dashboard = () => {
  const userBranch = useSelector((state: { user: { branch: string } }) => state.user.branch);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(() => {
    const saved = localStorage.getItem('dashboardSelectedBranch');
    return saved || userBranch;
  });

  const branchFilter = selectedBranch ? [`branch:${selectedBranch}`] : [];
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery({
    filter: branchFilter.length > 0 ? branchFilter : undefined,
  });
  const [filter, setFilter] = useState<string>('3');
  const [filterDates, setFilterDates] = useState<{ start: string; end: string } | null>(null);
  const [orders, setOrders] = useState<RentalOrderInfo[]>([]);
  const [showPendingAmountsOnly, setShowPendingAmountsOnly] = useState<boolean>(false);
  const [chartData, setChartData] = useState<PendingAmount[]>([]);
  const [graphFilter, setGraphFilter] = useState<ChartType>('incoming_pending');
  const [paidAmountFilter, setPaidAmountFilter] = useState<'rental' | 'sales' | 'combined'>(
    'combined'
  );
  const detailsData = getDetailsData(orders, graphFilter, filter, filterDates);

  const [activeTab, setActiveTab] = useState<'customer' | 'machine' | 'datewise'>('customer');
  const [tabFromDate, setTabFromDate] = useState<string>(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );
  const [tabToDate, setTabToDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [customerSubTab, setCustomerSubTab] = useState<'pending' | 'paid'>('pending');
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [expandedMachines, setExpandedMachines] = useState<Record<string, boolean>>({});

  const toggleCustomerExpand = (custId: string) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [custId]: !prev[custId],
    }));
  };

  const toggleMachineExpand = (name: string) => {
    setExpandedMachines((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };
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
    billAmount: 0,
    paidAmount: 0,
    paidAmountRental: 0,
    paidAmountSales: 0,
    paidAmountCombined: 0,
    mcIn: 0,
    mcOut: 0,
  });

  useEffect(() => {
    localStorage.setItem('dashboardSelectedBranch', selectedBranch || '');
  }, [selectedBranch]);

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
    let billAmount = 0;
    let paidAmount = 0;
    let paidAmountRental = 0;
    let paidAmountSales = 0;
    let paidAmountCombined = 0;
    let mcIn = 0;
    let mcOut = 0;

    // Calculate balanceAmount and repaymentAmount from filtered orders
    filteredOrders.forEach((order) => {
      const depositSum = order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;

      const finalAmount = calculateFinalAmount(order as RentalOrderType, false);

      const pendingAmount = finalAmount - depositSum;

      // Calculate paid amount if order status is PAID
      if (order.status === PaymentStatus.PAID) {
        paidAmount += finalAmount;
        paidAmountCombined += finalAmount;

        order.product_details.forEach((product) => {
          const productAmount = calculateProductRent(product);

          if (product.type === ProductType.RENTAL) {
            paidAmountRental += productAmount;
          } else if (product.type === ProductType.SALES) {
            paidAmountSales += productAmount;
          }
        });
      }

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
        if (order.status === PaymentStatus.CANCELLED || order.status === PaymentStatus.NO_BILL)
          return; // skip cancelled orders
        if (pendingAmount > 0) balanceAmount += pendingAmount; // total billed regardless of status
        if (pendingAmount < 0) repaymentAmount += Math.abs(pendingAmount);
      }
    });

    orders.forEach((order) => {
      order.deposits.forEach((dep) => {
        const depKey = groupKeyFormatter(dep.date, filter);
        if (validGroupKeys.includes(depKey)) {
          depositAmount += dep.amount;
        }
      });
    });

    // Calculate billAmount (sum of final amounts for filtered orders)
    billAmount = filteredOrders.reduce((sum, o) => {
      return sum + calculateFinalAmount(o as RentalOrderType, false);
    }, 0);

    // Calculate mcIn and mcOut from all orders based on product dates within filter
    orders.forEach((order) => {
      order.product_details.forEach((product) => {
        if (product.in_date) {
          const productGroupKey = groupKeyFormatter(product.in_date, filter);
          if (validGroupKeys.includes(productGroupKey) && product.type === ProductType.RENTAL) {
            mcIn += product.order_quantity;
          }
        }
        if (product.out_date) {
          const productGroupKey = groupKeyFormatter(product.out_date, filter);
          if (validGroupKeys.includes(productGroupKey) && product.type === ProductType.RENTAL) {
            mcOut += product.order_quantity;
          }
        }
      });
    });

    setTotalInfo({
      balanceAmount,
      repaymentAmount,
      depositAmount,
      billAmount,
      paidAmount,
      paidAmountRental,
      paidAmountSales,
      paidAmountCombined,
      mcIn,
      mcOut,
    });
  }, [filter, filterDates, orders, showPendingAmountsOnly]);

  useEffect(() => {
    const pendingData = getChartData(
      orders,
      filter,
      filterDates,
      graphFilter,
      showPendingAmountsOnly
    );
    setChartData(pendingData);
  }, [filter, filterDates, graphFilter, orders, showPendingAmountsOnly]);

  // Tab-based data calculations
  const filteredOrdersForTabs = orders.filter((order) => {
    if (!order.out_date) return false;
    const orderDate = dayjs(order.out_date).format('YYYY-MM-DD');
    return orderDate >= tabFromDate && orderDate <= tabToDate;
  });

  // 1. Customer details tab data
  const customersMap: Record<string, {
    id: string;
    name: string;
    mobile: string;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
    entriesCount: number;
    orders: {
      order_id: string;
      out_date: string;
      bill_amount: number;
      pending_amount: number;
      status: string;
    }[];
  }> = {};

  filteredOrdersForTabs.forEach((order) => {
    if (!order.customer) return;
    const custId = order.customer._id;
    const finalAmount = calculateFinalAmount(order as RentalOrderType, false);
    const depositSum = order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;
    
    // An order is pending if status is PENDING.
    const pendingAmount = order.status === PaymentStatus.PENDING ? Math.max(0, finalAmount - depositSum) : 0;
    const paidAmount = finalAmount - pendingAmount;

    if (!customersMap[custId]) {
      customersMap[custId] = {
        id: custId,
        name: order.customer.name,
        mobile: order.customer.personal_number || '',
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        entriesCount: 0,
        orders: [],
      };
    }

    const custData = customersMap[custId];
    custData.totalAmount += finalAmount;
    custData.totalPaid += paidAmount;
    custData.totalPending += pendingAmount;
    custData.entriesCount += 1;
    custData.orders.push({
      order_id: order.order_id,
      out_date: order.out_date,
      bill_amount: finalAmount,
      pending_amount: pendingAmount,
      status: order.status,
    });
  });

  const customersList = Object.values(customersMap);
  const pendingCustomers = customersList.filter(c => c.totalPending > 0);
  const paidCustomers = customersList.filter(c => c.totalPending === 0);

  // 2. Machine details consolidated tab data
  const machineMap: Record<string, {
    name: string;
    totalQuantity: number;
    totalRent: number;
    entriesCount: number;
    orders: {
      order_id: string;
      out_date: string;
      quantity: number;
      duration: number;
      rent_per_unit: number;
      total_rent: number;
    }[];
  }> = {};

  filteredOrdersForTabs.forEach((order) => {
    order.product_details.forEach((p) => {
      if (p.type !== ProductType.RENTAL) return;
      const totalRent = calculateProductRent(p);
      const machineName = p.name;

      if (!machineMap[machineName]) {
        machineMap[machineName] = {
          name: machineName,
          totalQuantity: 0,
          totalRent: 0,
          entriesCount: 0,
          orders: [],
        };
      }

      const machData = machineMap[machineName];
      machData.totalQuantity += p.order_quantity;
      machData.totalRent += totalRent;
      machData.entriesCount += 1;
      machData.orders.push({
        order_id: order.order_id,
        out_date: order.out_date,
        quantity: p.order_quantity,
        duration: p.duration,
        rent_per_unit: p.rent_per_unit,
        total_rent: totalRent,
      });
    });
  });

  const machineList = Object.values(machineMap);

  // 3. Date wise details tab data
  const dateWiseMap: Record<string, {
    dateStr: string;
    orderIds: string[];
    customerIds: Set<string>;
    productsCount: number;
    totalRentalAmount: number;
  }> = {};

  filteredOrdersForTabs.forEach((order) => {
    if (!order.out_date) return;
    const dateKey = dayjs(order.out_date).format('YYYY-MM-DD');

    if (!dateWiseMap[dateKey]) {
      dateWiseMap[dateKey] = {
        dateStr: dateKey,
        orderIds: [],
        customerIds: new Set(),
        productsCount: 0,
        totalRentalAmount: 0,
      };
    }

    const dateData = dateWiseMap[dateKey];
    dateData.orderIds.push(order.order_id);
    if (order.customer) {
      dateData.customerIds.add(order.customer._id);
    }

    order.product_details.forEach((p) => {
      if (p.type !== ProductType.RENTAL) return;
      dateData.productsCount += p.order_quantity;
      dateData.totalRentalAmount += calculateProductRent(p);
    });
  });

  const dateWiseList = Object.values(dateWiseMap).sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  const handleExportTabExcel = () => {
    if (activeTab === 'customer') {
      const customersToExport = customerSubTab === 'pending' ? pendingCustomers : paidCustomers;
      const exportData: any[] = [];
      customersToExport.forEach((c) => {
        c.orders.forEach((o: any) => {
          exportData.push({
            'Customer Name': c.name,
            'Mobile Number': c.mobile,
            'Number of Entries': c.entriesCount,
            'Net Customer Dues': c.totalPending,
            'Order ID': o.order_id,
            'Order Out Date': dayjs(o.out_date).format('DD-MMM-YYYY hh:mm A'),
            'Bill Amount': o.bill_amount,
            'Pending Dues': o.pending_amount,
            'Order Status': o.status,
          });
        });
      });

      if (exportData.length === 0) {
        alert('No customer data available to export');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, `Customer_${customerSubTab}`);
      XLSX.writeFile(wb, `Customer_Details_${customerSubTab}_${dayjs().format('YYYYMMDD')}.xlsx`);
    } else if (activeTab === 'machine') {
      const exportData: any[] = [];
      machineList.forEach((m) => {
        m.orders.forEach((o) => {
          exportData.push({
            'Machine Name': m.name,
            'Consolidated Entries': m.entriesCount,
            'Total Quantity Rented': m.totalQuantity,
            'Total Machine Revenue': m.totalRent,
            'Order ID': o.order_id,
            'Order Out Date': dayjs(o.out_date).format('DD-MMM-YYYY hh:mm A'),
            'Order Quantity': o.quantity,
            'Order Duration': o.duration,
            'Rent Per Unit': o.rent_per_unit,
            'Order Total Rent': o.total_rent,
          });
        });
      });

      if (exportData.length === 0) {
        alert('No machine data available to export');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Machine Details');
      XLSX.writeFile(wb, `Machine_Details_${dayjs().format('YYYYMMDD')}.xlsx`);
    } else if (activeTab === 'datewise') {
      const exportData = dateWiseList.map((d) => ({
        'Date': dayjs(d.dateStr).format('DD-MMM-YYYY'),
        'Number of Orders': d.orderIds.length,
        'Order IDs': d.orderIds.join(', '),
        'Number of Customers': d.customerIds.size,
        'Number of Products': d.productsCount,
        'Total Rental Amount': d.totalRentalAmount,
      }));

      if (exportData.length === 0) {
        alert('No date-wise data available to export');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Date Wise Details');
      XLSX.writeFile(wb, `Date_Wise_Details_${dayjs().format('YYYYMMDD')}.xlsx`);
    }
  };

  const handleExportExcel = () => {
    let exportDetailsData: Record<string, string | number>[] = [];
    if ('pending' in detailsData) {
      exportDetailsData = [
        ...detailsData.pending.map((d) => ({
          Customer: d.name,
          Amount: d.amount,
          Status: 'Pending',
        })),
        ...detailsData.paid.map((d) => ({
          Customer: d.name,
          Amount: d.amount,
          Status: 'Paid',
        })),
      ];
    } else {
      exportDetailsData = detailsData.map((d) => ({
        'Product (or) Status': d.name,
        Nos: d.amount,
      }));
    }

    if (exportDetailsData.length === 0) {
      alert('No data available to export');
      return;
    }

    const tabTitles: Record<ChartType, string> = {
      incoming_pending: 'Balance Amount',
      repayment_pending: 'Repayment Amount',
      machines_in: 'Machines In',
      machines_out: 'Machines Out',
      machines_repair: 'Machines Repair',
      machines_overdue: 'Machines Overdue',
      order_status_summary: 'Order Status Summary',
    };
    const tabTitle = tabTitles[graphFilter] || 'Details';

    const wb = XLSX.utils.book_new();
    const wsDetails = XLSX.utils.json_to_sheet(exportDetailsData);
    XLSX.utils.book_append_sheet(wb, wsDetails, tabTitle.substring(0, 31));

    XLSX.writeFile(wb, `${tabTitle.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  return (
    <div className="h-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="w-full flex justify-between mb-3">
        <p className="text-primary font-bold">Overview</p>
        <div className="flex gap-4 items-end">
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
            label="Date Filter"
            onChange={(val) => setFilter(val)}
            className="w-[8rem]"
            options={filterOptions}
            value={filter}
          />
          <BranchSelector selectedBranch={selectedBranch} onChange={setSelectedBranch} />
          <div className="flex pb-2 gap-2 h-fit">
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
            title="Bill Amount"
            className="grow"
            value={`₹${totalInfo.billAmount.toFixed(2)}`}
          />
          <CustomCard
            title="Paid Amount"
            className="grow"
            value={`₹${(paidAmountFilter === 'rental'
              ? totalInfo.paidAmountRental
              : paidAmountFilter === 'sales'
                ? totalInfo.paidAmountSales
                : totalInfo.paidAmountCombined
            ).toFixed(2)}`}
            dropdownOptions={[
              { value: 'combined', label: 'Combined' },
              { value: 'rental', label: 'Rental' },
              { value: 'sales', label: 'Sales' },
            ]}
            selectedDropdownValue={paidAmountFilter}
            onDropdownChange={(value) =>
              setPaidAmountFilter(value as 'rental' | 'sales' | 'combined')
            }
          />
          <CustomCard title="Machine Out" className="grow" value={`${totalInfo.mcOut}`} />
          <CustomCard title="Machine In" className="grow" value={`${totalInfo.mcIn}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[75%_auto] w-full gap-3 pb-4">
          <div className="flex flex-col bg-gray-50 rounded-xl gap-1 px-3 max-h-[26rem] py-2 h-full">
            <ul className="flex flex-row text-sm gap-3">
              <li
                className={`cursor-pointer ${graphFilter == 'incoming_pending' ? 'text-black' : 'text-gray-500'
                  }`}
                onClick={() => setGraphFilter('incoming_pending')}
              >
                Balance Amount
              </li>
              <li
                className={`cursor-pointer ${graphFilter == 'repayment_pending' ? 'text-black' : 'text-gray-500'
                  }`}
                onClick={() => setGraphFilter('repayment_pending')}
              >
                Repayment Amount
              </li>
              <li
                className={`cursor-pointer ${graphFilter == 'machines_in' ? 'text-black' : 'text-gray-500'
                  }`}
                onClick={() => setGraphFilter('machines_in')}
              >
                Machines In
              </li>
              <li
                className={`cursor-pointer ${graphFilter == 'machines_out' ? 'text-black' : 'text-gray-500'
                  }`}
                onClick={() => setGraphFilter('machines_out')}
              >
                Machines Out
              </li>
              <li
                className={`cursor-pointer ${graphFilter == 'machines_repair' ? 'text-black' : 'text-gray-500'
                  }`}
                onClick={() => setGraphFilter('machines_repair')}
              >
                Machines Repair
              </li>
              <li
                className={`cursor-pointer ${graphFilter == 'machines_overdue' ? 'text-black' : 'text-gray-500'
                  }`}
                onClick={() => setGraphFilter('machines_overdue')}
              >
                Machines Overdue
              </li>
              <li
                className={`cursor-pointer ${graphFilter == 'order_status_summary' ? 'text-black' : 'text-gray-500'
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
            <div className="flex justify-between items-center w-full mb-2">
              <p className="text-lg font-semibold">Details</p>
              <div
                className="cursor-pointer bg-blue-100 hover:bg-blue-200 p-2 rounded-md transition-colors flex items-center justify-center"
                onClick={handleExportExcel}
                title="Export Data"
              >
                <RiFileExcel2Line
                  size={20}
                  className="text-blue-700"
                />
              </div>
            </div>
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
                    <span>Product (or) Status</span>
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

        {/* New Tabbed Section */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-4 mt-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 pb-2 border-b border-gray-200">
            <div className="flex gap-4">
              <h2 className="text-lg font-bold text-primary">Detailed Analytics</h2>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white text-sm">
                <button
                  className={`px-3 py-1 font-semibold transition-colors ${
                    activeTab === 'customer' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('customer')}
                >
                  Customer Details
                </button>
                <button
                  className={`px-3 py-1 font-semibold transition-colors ${
                    activeTab === 'machine' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('machine')}
                >
                  Machine Details
                </button>
                <button
                  className={`px-3 py-1 font-semibold transition-colors ${
                    activeTab === 'datewise' ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('datewise')}
                >
                  Date Wise Details
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
              <CustomDatePicker
                label="From"
                value={tabFromDate}
                onChange={(date) => setTabFromDate(date)}
                wrapperClass="flex-row items-center"
                format="YYYY-MM-DD"
              />
              <CustomDatePicker
                label="To"
                value={tabToDate}
                onChange={(date) => setTabToDate(date)}
                wrapperClass="flex-row items-center"
                format="YYYY-MM-DD"
              />
              <div
                className="cursor-pointer bg-blue-100 hover:bg-blue-200 p-2 rounded-md transition-colors flex items-center justify-center h-fit self-end mb-1"
                onClick={handleExportTabExcel}
                title="Export Tab Data"
              >
                <RiFileExcel2Line size={20} className="text-blue-700" />
              </div>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="w-full">
            {activeTab === 'customer' && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 text-sm">
                  <button
                    className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${
                      customerSubTab === 'pending'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setCustomerSubTab('pending')}
                  >
                    Pending Amount ({pendingCustomers.length})
                  </button>
                  <button
                    className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${
                      customerSubTab === 'paid'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setCustomerSubTab('paid')}
                  >
                    Paid Amount ({paidCustomers.length})
                  </button>
                </div>

                <div className="overflow-auto max-h-[30rem] border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm text-center border-collapse bg-white table-fixed">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-200 text-gray-700 font-bold border-b border-gray-300">
                        <th className="p-2 text-left w-[12%]">Action</th>
                        <th className="p-2 text-left w-[38%]">Customer Name</th>
                        <th className="p-2 w-[20%]">Mobile Number</th>
                        <th className="p-2 w-[15%]">No. of Entries</th>
                        <th className="p-2 text-right w-[15%]">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customerSubTab === 'pending' ? pendingCustomers : paidCustomers).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-gray-400 italic py-4">No customers found</td>
                        </tr>
                      ) : (
                        (customerSubTab === 'pending' ? pendingCustomers : paidCustomers).map((cust) => {
                          const isExpanded = !!expandedCustomers[cust.id];
                          return (
                            <React.Fragment key={cust.id}>
                              <tr className="border-b border-gray-200 hover:bg-gray-50 font-medium">
                                <td className="p-2 text-left">
                                  <button
                                    onClick={() => toggleCustomerExpand(cust.id)}
                                    className="text-primary hover:bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-300 transition-colors font-semibold"
                                  >
                                    {isExpanded ? 'Hide' : 'Show'}
                                  </button>
                                </td>
                                <td className="p-2 text-left font-semibold text-gray-800">{cust.name}</td>
                                <td className="p-2 text-gray-600">{cust.mobile || '-'}</td>
                                <td className="p-2 text-gray-600">{cust.entriesCount}</td>
                                <td className="p-2 text-right font-semibold text-primary">
                                  ₹{cust.totalAmount.toFixed(2)}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={5} className="bg-gray-50 p-3 border-b border-gray-200">
                                    <div className="flex flex-col gap-2">
                                      <h4 className="font-bold text-xs text-gray-600 text-left">Order Details</h4>
                                      <table className="w-full text-xs text-center border-collapse bg-white border border-gray-200 rounded-lg">
                                        <thead>
                                          <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                                            <th className="p-2 text-left">Order ID</th>
                                            <th className="p-2">Order Out Date</th>
                                            <th className="p-2 text-right">Bill Amount</th>
                                            {customerSubTab === 'pending' && <th className="p-2 text-right">Pending Amount</th>}
                                            <th className="p-2">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {cust.orders.map((ord, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                              <td className="p-2 text-left font-semibold">{ord.order_id}</td>
                                              <td className="p-2 text-gray-600">
                                                {dayjs(ord.out_date).format('DD-MMM-YYYY hh:mm A')}
                                              </td>
                                              <td className="p-2 text-right">₹{ord.bill_amount.toFixed(2)}</td>
                                              {customerSubTab === 'pending' && (
                                                <td className="p-2 text-right text-red-600 font-medium">
                                                  ₹{ord.pending_amount.toFixed(2)}
                                                </td>
                                              )}
                                              <td className="p-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                  ord.status === PaymentStatus.PAID
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                  {ord.status}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'machine' && (
              <div className="overflow-auto max-h-[30rem] border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm text-center border-collapse bg-white table-fixed">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-200 text-gray-700 font-bold border-b border-gray-300">
                      <th className="p-2 text-left w-[12%]">Action</th>
                      <th className="p-2 text-left w-[38%]">Machine Name</th>
                      <th className="p-2 w-[20%]">Total Entries</th>
                      <th className="p-2 w-[15%]">Total Qty Rented</th>
                      <th className="p-2 text-right w-[15%]">Total Rental Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 italic py-4">No machine details found</td>
                      </tr>
                    ) : (
                      machineList.map((mach) => {
                        const isExpanded = !!expandedMachines[mach.name];
                        return (
                          <React.Fragment key={mach.name}>
                            <tr className="border-b border-gray-200 hover:bg-gray-50 font-medium">
                              <td className="p-2 text-left">
                                <button
                                  onClick={() => toggleMachineExpand(mach.name)}
                                  className="text-primary hover:bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-300 transition-colors font-semibold"
                                >
                                  {isExpanded ? 'Hide' : 'Show'}
                                </button>
                              </td>
                              <td className="p-2 text-left font-semibold text-gray-800">{mach.name}</td>
                              <td className="p-2 text-gray-600">{mach.entriesCount}</td>
                              <td className="p-2 text-gray-600">{mach.totalQuantity}</td>
                              <td className="p-2 text-right font-semibold text-primary">
                                ₹{mach.totalRent.toFixed(2)}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="bg-gray-50 p-3 border-b border-gray-200">
                                  <div className="flex flex-col gap-2">
                                    <h4 className="font-bold text-xs text-gray-600 text-left">Order Details</h4>
                                    <table className="w-full text-xs text-center border-collapse bg-white border border-gray-200 rounded-lg">
                                      <thead>
                                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                                          <th className="p-2 text-left">Order ID</th>
                                          <th className="p-2">Order Out Date</th>
                                          <th className="p-2">Quantity</th>
                                          <th className="p-2">Duration</th>
                                          <th className="p-2 text-right">Rent per Unit</th>
                                          <th className="p-2 text-right">Total Rent</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {mach.orders.map((ord, idx) => (
                                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-2 text-left font-semibold">{ord.order_id}</td>
                                            <td className="p-2 text-gray-600">
                                              {dayjs(ord.out_date).format('DD-MMM-YYYY hh:mm A')}
                                            </td>
                                            <td className="p-2 text-gray-600">{ord.quantity}</td>
                                            <td className="p-2 text-gray-600">{ord.duration}</td>
                                            <td className="p-2 text-right">₹{ord.rent_per_unit.toFixed(2)}</td>
                                            <td className="p-2 text-right font-semibold text-primary">₹{ord.total_rent.toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'datewise' && (
              <div className="overflow-auto max-h-[30rem] border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm text-center border-collapse bg-white">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-200 text-gray-700 font-bold border-b border-gray-300">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2">Number of Orders</th>
                      <th className="p-2 text-left">Order IDs</th>
                      <th className="p-2">Number of Customers</th>
                      <th className="p-2">Number of Products</th>
                      <th className="p-2 text-right">Total Rental Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateWiseList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-400 italic py-4">No date-wise details found</td>
                      </tr>
                    ) : (
                      dateWiseList.map((dw, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2 text-left font-semibold">
                            {dayjs(dw.dateStr).format('DD-MMM-YYYY')}
                          </td>
                          <td className="p-2 text-gray-600">{dw.orderIds.length}</td>
                          <td className="p-2 text-left text-xs text-gray-500 max-w-[200px] truncate" title={dw.orderIds.join(', ')}>
                            {dw.orderIds.join(', ')}
                          </td>
                          <td className="p-2 text-gray-600">{dw.customerIds.size}</td>
                          <td className="p-2 text-gray-600">{dw.productsCount}</td>
                          <td className="p-2 text-right font-semibold text-primary">
                            ₹{dw.totalRentalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
