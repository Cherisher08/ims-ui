import { useEffect, useState } from "react";
import CustomSelect from "../../styled/CustomSelect";
import CustomCard from "../../styled/CustomCard";
import CustomLineChart from "../../styled/CustomLineChart";
import {
  BillingMode,
  BillingUnit,
  OrderInfoType,
  RentalOrderInfo,
} from "../../types/order";
import { ProductType } from "../../types/common";
import { useGetRentalOrdersQuery } from "../../services/OrderService";
import { calculateDiscountAmount } from "../../services/utility_functions";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import CustomOrderTimeLine from "../../styled/CustomOrderTimeLine";

dayjs.extend(isoWeek);

type PendingAmount = { date: string; price: number };

export interface OrderTimeline {
  count: number;
  date: string;
}

type ResultData = {
  pendingAmountData: {
    order: PendingAmount;
    pendingAmount: number;
  }[];
  pendingBalanceData: {
    order: PendingAmount;
    balanceAmount: number;
  }[];
  totalProductsOut: {
    order: OrderTimeline;
    productsOutCount: number;
  }[];
  totalReturnedProducts: {
    order: RentalOrderInfo;
    returnedProductsCount: number;
  }[];
};

interface GraphData {
  pendingData: PendingAmount[];
  balanceData: PendingAmount[];
  orderTimeLine: OrderTimeline[];
}

const analyzeRentalOrders = (
  orders: RentalOrderInfo[],
  filter: string
): ResultData => {
  const today = new Date();

  let startTime: Date;
  let endTime: Date;

  switch (filter) {
    case "1":
      startTime = dayjs().startOf("day").toDate();
      endTime = dayjs().endOf("day").toDate();
      break;

    case "2":
      startTime = dayjs().startOf("isoWeek").toDate();
      endTime = dayjs().endOf("isoWeek").toDate();
      break;

    case "3":
      startTime = dayjs().startOf("month").toDate();
      endTime = dayjs().endOf("month").toDate();
      break;
  }

  const pendingAmountData: {
    order: { price: number; date: string };
    pendingAmount: number;
  }[] = [];
  const pendingBalanceData: {
    order: {
      price: number;
      date: string;
    };
    balanceAmount: number;
  }[] = [];
  const totalProductsOut: {
    order: {
      count: number;
      date: string;
    };
    productsOutCount: number;
  }[] = [];
  const totalReturnedProducts: {
    order: RentalOrderInfo;
    returnedProductsCount: number;
  }[] = [];

  const filteredOrders = orders.filter((order) => {
    const outDate = new Date(order.out_date);
    return outDate >= startTime && outDate <= endTime;
  });

  filteredOrders.forEach((order) => {
    const depositTotal =
      order.deposits.reduce((sum, d) => sum + d.amount, 0) || 0;
    const finalAmount = calcFinalAmount(order);
    const roundOff = order.round_off || 0;
    const discountAmount = order.discount_amount || 0;
    const gstAmount =
      order.billing_mode === BillingMode.BUSINESS
        ? 0
        : calculateDiscountAmount(order.gst, finalAmount);

    const pendingAmount = parseFloat(
      (
        finalAmount -
        depositTotal -
        discountAmount +
        gstAmount +
        roundOff
      ).toFixed(2)
    );

    if (pendingAmount > 0) {
      pendingAmountData.push({
        order: {
          price: pendingAmount,
          date: order.in_date,
        },
        pendingAmount,
      });
    } else if (pendingAmount < 0) {
      const formattedOrder: { price: number; date: string } = {
        price: Math.abs(pendingAmount),
        date: order.in_date,
      };
      pendingBalanceData.push({
        order: formattedOrder,
        balanceAmount: pendingAmount,
      });
    }

    const productOutCount = order.product_details.reduce((sum, p) => {
      if (p.in_date && new Date(p.in_date) > today) {
        return sum + (p.order_quantity || 0);
      }
      return sum;
    }, 0);

    if (productOutCount > 0) {
      totalProductsOut.push({
        order: {
          count: productOutCount,
          date: order.out_date,
        },
        productsOutCount: productOutCount,
      });
    }

    const returnedCount = order.product_details.reduce((sum, p) => {
      if (p.in_date && new Date(p.in_date) < today) {
        return sum + (p.order_quantity || 0);
      }
      return sum;
    }, 0);

    if (returnedCount > 0) {
      totalReturnedProducts.push({
        order,
        returnedProductsCount: returnedCount,
      });
    }
  });

  return {
    pendingAmountData,
    pendingBalanceData,
    totalProductsOut,
    totalReturnedProducts,
  };
};

const getRentalDuration = (
  outDate: string,
  inDate: string,
  unit: BillingUnit
): number => {
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
        (inn.getFullYear() - out.getFullYear()) * 12 +
          (inn.getMonth() - out.getMonth())
      );
    default:
      return 1;
  }
};

const calcFinalAmount = (order: OrderInfoType): number => {
  if (order.type === ProductType.RENTAL && order.product_details) {
    const total = order.product_details.reduce((sum, prod) => {
      const duration = getRentalDuration(
        prod.out_date,
        prod.in_date,
        prod.billing_unit
      );
      const quantity = prod.order_quantity - prod.order_repair_count;
      return sum + prod.rent_per_unit * quantity * duration;
    }, 0);

    return parseFloat(total.toFixed(2));
  }
  return 0;
};

const Dashboard = () => {
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();
  const [filter, setFilter] = useState<string>("3");
  const [orders, setOrders] = useState<RentalOrderInfo[]>([]);
  const [totalInfo, setTotalInfo] = useState({
    pendingAmount: 0,
    balanceAmount: 0,
    mcIn: 0,
    mcOut: 0,
  });

  const [graphData, setGraphData] = useState<GraphData>({
    pendingData: [],
    balanceData: [],
    orderTimeLine: [],
  });
  const [graphFilter, setGraphFilter] = useState<number>(1);
  const filterOptions = [
    { id: "1", value: "daily" },
    { id: "2", value: "weekly" },
    { id: "3", value: "monthly" },
  ];

  useEffect(() => {
    if (isRentalOrdersQuerySuccess) {
      setOrders(rentalOrderData);
    }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

  useEffect(() => {
    if (isRentalOrdersQuerySuccess && orders.length > 0) {
      const resultData = analyzeRentalOrders(orders, filter);
      const totalPendingAmount = resultData.pendingAmountData.reduce(
        (total, value) => total + value.pendingAmount,
        0
      );
      const totalBalanceAmount = resultData.pendingBalanceData.reduce(
        (total, value) => total + value.balanceAmount,
        0
      );
      const totalProductsOut = resultData.totalProductsOut.reduce(
        (total, value) => total + value.productsOutCount,
        0
      );
      const totalProductsIn = resultData.totalReturnedProducts.reduce(
        (total, value) => total + value.returnedProductsCount,
        0
      );

      setTotalInfo({
        pendingAmount: totalPendingAmount,
        balanceAmount: Math.abs(totalBalanceAmount),
        mcOut: totalProductsOut,
        mcIn: totalProductsIn,
      });

      setGraphData({
        pendingData:
          resultData.pendingAmountData.length > 0
            ? resultData.pendingAmountData.map((orderData) => orderData.order)
            : [],
        balanceData: resultData.pendingBalanceData.map(
          (orderData) => orderData.order
        ),
        orderTimeLine: resultData.totalProductsOut.map(
          (orderData) => orderData.order
        ),
      });
    }
  }, [filter, isRentalOrdersQuerySuccess, orders]);

  return (
    <div className="h-auto w-full overflow-y-auto">
      {/* Header */}
      <div className="w-full flex justify-between">
        <p className="text-primary font-bold">Overview</p>
        <div>
          <CustomSelect
            label=""
            onChange={(val) => setFilter(val)}
            className="w-[8rem]"
            options={filterOptions}
            value={filter}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(13rem,_1fr))] items-center justify-center gap-4">
          <CustomCard
            title="Total Amount Pending"
            className="grow"
            value={totalInfo.pendingAmount}
          />
          <CustomCard
            title="Total Balance Amount"
            className="grow"
            value={totalInfo.balanceAmount}
          />
          <CustomCard
            title="Machine Out"
            className="grow"
            value={totalInfo.mcOut}
          />
          <CustomCard
            title="Machine In"
            className="grow"
            value={totalInfo.mcIn}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[75%_auto] w-full gap-3 pb-4">
          <div className="flex flex-col bg-gray-50 rounded-xl gap-1 px-3 max-h-[26rem] py-2 h-full">
            <ul className="flex flex-row text-sm gap-3">
              <li
                className={`cursor-pointer ${
                  graphFilter == 1 ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setGraphFilter(1)}
              >
                Balance Pending
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 2 ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setGraphFilter(2)}
              >
                Return Pending
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 3 ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setGraphFilter(3)}
              >
                Order Timeline
              </li>
            </ul>
            {graphFilter === 1 && (
              <CustomLineChart chartData={graphData.pendingData} title="" />
            )}
            {graphFilter === 2 && (
              <CustomLineChart chartData={graphData.balanceData} title="" />
            )}
            {graphFilter === 3 && (
              <CustomOrderTimeLine orders={graphData.orderTimeLine} title="" />
            )}
          </div>
          {/* <div className="rounded-xl p-4 bg-gray-50 flex flex-col gap-1 max-h-[26rem] overflow-y-auto">
            <p className="text-lg font-semibold">Title</p>
            <ul className="flex flex-col gap-3 px-4 h-full overflow-y-auto">
              {[
                { name: "hari", amount: 1000 },
                { name: "bob", amount: 6000 },
                { name: "raj", amount: 3000 },
                { name: "alice", amount: 600 },
                { name: "kumar", amount: 4500 },
                { name: "ram", amount: 1800 },
                { name: "karan", amount: 200 },
                { name: "alice", amount: 600 },
                { name: "raj", amount: 3000 },
                { name: "alice", amount: 600 },
                { name: "kumar", amount: 4500 },
                { name: "ram", amount: 1800 },
                { name: "karan", amount: 200 },
                { name: "alice", amount: 600 },
                { name: "bob", amount: 6000 },
                { name: "ram", amount: 1800 },
                { name: "jai", amount: 500 },
              ].map((record, index) => (
                <li key={index} className="flex justify-between">
                  <p>{record.name}</p>
                  <p>{record.amount}</p>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
