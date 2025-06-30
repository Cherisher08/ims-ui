import { useEffect, useState } from "react";
import CustomSelect from "../../styled/CustomSelect";
import CustomCard from "../../styled/CustomCard";
import CustomLineChart from "../../styled/CustomLineChart";
import {
  BillingMode,
  OrderInfoType,
  PaymentStatus,
  RentalOrderInfo,
} from "../../types/order";
import { ProductType } from "../../types/common";
import { useGetRentalOrdersQuery } from "../../services/OrderService";
import { calculateDiscountAmount } from "../../services/utility_functions";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { isPending } from "@reduxjs/toolkit";
dayjs.extend(weekOfYear);

type PendingAmount = { date: string; price: number };

const groupKeyFormatter = (dateStr: string, filter: string) => {
  const date = dayjs(dateStr);
  switch (filter) {
    case "1":
      return date.format("YYYY-MM-DD");
    case "2":
      return `${date.year()}-W${date.week()}`;
    case "3":
      return date.format("YYYY-MM");
    default:
      return date.format("YYYY-MM-DD");
  }
};

const calcFinalAmount = (order: OrderInfoType) => {
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

const pendingGroupedData = (
  orders: RentalOrderInfo[],
  filter: string,
  isPending: boolean
) => {
  const groups: Record<string, number> = {};

  orders
    .filter((order) => order.status === PaymentStatus.PENDING)
    .forEach((order) => {
      const groupKey = groupKeyFormatter(order.in_date, filter);

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

      if (isPending) {
        if (pendingAmount < 0) {
          groups[groupKey] = (groups[groupKey] || 0) + Math.abs(pendingAmount);
        }
      } else {
        if (pendingAmount > 0) {
          groups[groupKey] = (groups[groupKey] || 0) + pendingAmount;
        }
      }
    });

  const chartData = Object.entries(groups).map(([date, price]) => ({
    date,
    price,
  }));

  return chartData;
};

const Dashboard = () => {
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();
  const [filter, setFilter] = useState<string>("1");
  const [orders, setOrders] = useState<RentalOrderInfo[]>([]);
  const [chartData, setChartData] = useState<PendingAmount[]>([]);
  const [graphFilter, setGraphFilter] = useState<number>(1);
  const filterOptions = [
    { id: "1", value: "daily" },
    { id: "2", value: "weekly" },
    { id: "3", value: "monthly" },
  ];

  const [pendingOrderAmount, setPendingOrderAmount] = useState<number>(0);

  useEffect(() => {
    const amount = orders
      .filter((order) => order.status === PaymentStatus.PENDING)
      .reduce((sum, order) => {
        const deposit =
          order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0) || 0;
        const finalAmount = calcFinalAmount(order);
        const roundOff = order.round_off || 0;
        const discountAmount = order.discount_amount || 0;
        const gstAmount =
          order.billing_mode === BillingMode.BUSINESS
            ? 0
            : calculateDiscountAmount(order.gst, finalAmount);

        const pendingAmount =
          finalAmount - deposit - discountAmount + gstAmount + roundOff;
        if (pendingAmount < 0) return sum + 0;
        return sum + pendingAmount;
      }, 0);
    setPendingOrderAmount(amount);
    const pendingData = pendingGroupedData(orders, filter, true);
    setChartData(pendingData);
  }, [filter, orders]);

  useEffect(() => {
    if (isRentalOrdersQuerySuccess) {
      setOrders(rentalOrderData);
    }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

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
            value={pendingOrderAmount}
            // change={-11.2}
          />
          <CustomCard
            title="Products"
            className="grow"
            value={30}
            change={11.2}
          />
          <CustomCard
            title="Products In"
            className="grow"
            value={30}
            change={-11.2}
          />
          <CustomCard
            title="Products In"
            className="grow"
            value={30}
            change={11.2}
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
            <CustomLineChart chartData={chartData} title="" />
          </div>
          <div className="rounded-xl p-4 bg-gray-50 flex flex-col gap-1 max-h-[26rem] overflow-y-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
