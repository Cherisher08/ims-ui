import { useEffect, useState } from "react";
import CustomSelect from "../../styled/CustomSelect";
import CustomCard from "../../styled/CustomCard";
import CustomLineChart from "../../styled/CustomLineChart";
import {
  BillingMode,
  BillingUnit,
  OrderInfoType,
  PaymentMode,
  PaymentStatus,
  RentalOrderInfo,
} from "../../types/order";
import { ProductType } from "../../types/common";
import { useGetRentalOrdersQuery } from "../../services/OrderService";
import { calculateDiscountAmount } from "../../services/utility_functions";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import CustomOrderTimeLine from "../../styled/CustomOrderTimeLine";

dayjs.extend(isoWeek);

const analyzeRentalOrders = (orders: RentalOrderInfo[], filter: string) => {
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

  const [graphData, setGraphData] = useState({
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
    // if (isRentalOrdersQuerySuccess) {
    // setOrders(rentalOrderData);
    setOrders([
      {
        order_id: "RENT-001",
        customer: {
          _id: "c1",
          name: "Suresh Babu",
          personal_number: "12381723",
          office_number: "2313123123",
          gstin: "123333",
          email: "suresh@example.com",
          address: "Erode",
          pincode: "638001",
        },
        billing_mode: BillingMode.RETAIL,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PAID,
        remarks: "Repeat customer",
        round_off: 5,
        payment_mode: PaymentMode.CASH,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-06-05T09:00",
        expected_date: "2025-06-06T09:00",
        in_date: "2025-06-06T09:00",
        product_details: [
          {
            _id: "p5",
            name: "Cooling Fan",
            category: "Utility",
            billing_unit: BillingUnit.DAYS,
            product_unit: { _id: "u1", name: "unit" },
            in_date: "2025-06-06T09:00",
            out_date: "2025-06-05T09:00",
            order_quantity: 10,
            order_repair_count: 0,
            rent_per_unit: 100,
          },
        ],
        event_address: "Railway Station, Erode",
        event_pincode: "638002",
      },
      {
        order_id: "RENT-002",
        customer: {
          _id: "c2",
          name: "Ravi Kannan",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "ravi@example.com",
          address: "Chennai",
          pincode: "600001",
        },
        billing_mode: BillingMode.BUSINESS,
        discount: 5,
        discount_amount: 500,
        status: PaymentStatus.PENDING,
        remarks: "",
        round_off: 0,
        payment_mode: PaymentMode.UPI,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-06-10T18:00",
        expected_date: "2025-06-10T23:00",
        in_date: "2025-06-10T23:00",
        product_details: [
          {
            _id: "p6",
            name: "Stage Light",
            category: "Lighting",
            billing_unit: BillingUnit.SHIFT,
            product_unit: { _id: "u2", name: "set" },
            in_date: "2025-06-10T23:00",
            out_date: "2025-06-10T18:00",
            order_quantity: 5,
            order_repair_count: 0,
            rent_per_unit: 800,
          },
        ],
        event_address: "Hall A, Trade Centre",
        event_pincode: "600002",
      },
      {
        order_id: "RENT-003",
        customer: {
          _id: "c3",
          name: "Meera Raj",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "meera@example.com",
          address: "Madurai",
          pincode: "625001",
        },
        billing_mode: BillingMode.RETAIL,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PAID,
        remarks: "Wedding",
        round_off: 10,
        payment_mode: PaymentMode.CASH,
        gst: 12,
        type: ProductType.RENTAL,
        deposits: [
          {
            amount: 10000,
            date: "2025-06-04T10:00",
            mode: PaymentMode.CASH,
            product: { _id: "p7", name: "Sound Mixer" },
          },
        ],
        out_date: "2025-06-01T10:00",
        expected_date: "2025-06-04T10:00",
        in_date: "2025-06-04T10:00",
        product_details: [
          {
            _id: "p7",
            name: "Sound Mixer",
            category: "Audio",
            billing_unit: BillingUnit.DAYS,
            product_unit: { _id: "u3", name: "unit" },
            in_date: "2025-06-04T10:00",
            out_date: "2025-06-01T10:00",
            order_quantity: 2,
            order_repair_count: 0,
            rent_per_unit: 2000,
          },
          {
            _id: "p7",
            name: "Sound Bar",
            category: "Audio",
            billing_unit: BillingUnit.DAYS,
            product_unit: { _id: "u3", name: "unit" },
            in_date: "2025-06-04T10:00",
            out_date: "2025-06-01T10:00",
            order_quantity: 5,
            order_repair_count: 0,
            rent_per_unit: 1000,
          },
        ],
        event_address: "Meenakshi Grounds",
        event_pincode: "625002",
      },
      {
        order_id: "RENT-004",
        customer: {
          _id: "c4",
          name: "Rahul Sen",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "rahul@example.com",
          address: "Trichy",
          pincode: "620001",
        },
        billing_mode: BillingMode.BUSINESS,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PAID,
        remarks: "",
        round_off: 0,
        payment_mode: PaymentMode.ACCOUNT,
        gst: 5,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-06-01T09:00",
        expected_date: "2025-06-15T09:00",
        in_date: "2025-06-15T09:00",
        product_details: [
          {
            _id: "p8",
            name: "Projector",
            category: "Display",
            billing_unit: BillingUnit.WEEKS,
            product_unit: { _id: "u4", name: "piece" },
            in_date: "2025-06-15T09:00",
            out_date: "2025-06-01T09:00",
            order_quantity: 1,
            order_repair_count: 0,
            rent_per_unit: 7000,
          },
        ],
        event_address: "ABC Convention Hall",
        event_pincode: "620002",
      },
      {
        order_id: "RENT-005",
        customer: {
          _id: "c5",
          name: "Anu Bala",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "anu@example.com",
          address: "Salem",
          pincode: "636001",
        },
        billing_mode: BillingMode.RETAIL,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PAID,
        remarks: "Outdoor",
        round_off: 0,
        payment_mode: PaymentMode.UPI,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-06-01T12:00",
        expected_date: "2025-08-01T12:00",
        in_date: "2025-08-01T12:00",
        product_details: [
          {
            _id: "p10",
            name: "AC Unit",
            category: "Cooling",
            billing_unit: BillingUnit.MONTHS,
            product_unit: { _id: "u5", name: "unit" },
            in_date: "2025-08-01T12:00",
            out_date: "2025-06-01T12:00",
            order_quantity: 2,
            order_repair_count: 0,
            rent_per_unit: 9000,
          },
        ],
        event_address: "Metro Road",
        event_pincode: "636002",
      },
      {
        order_id: "RENT-006",
        customer: {
          _id: "c6",
          name: "Karthik Raja",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "karthik@example.com",
          address: "Karur",
          pincode: "639001",
        },
        billing_mode: BillingMode.RETAIL,
        discount: 2,
        discount_amount: 200,
        status: PaymentStatus.PAID,
        remarks: "",
        round_off: -5,
        payment_mode: PaymentMode.CASH,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-06-20T06:00",
        expected_date: "2025-06-23T06:00",
        in_date: "2025-06-23T06:00",
        product_details: [
          {
            _id: "p11",
            name: "LED Screen",
            category: "Display",
            billing_unit: BillingUnit.DAYS,
            product_unit: { _id: "u6", name: "sqft" },
            in_date: "2025-06-23T06:00",
            out_date: "2025-06-20T06:00",
            order_quantity: 3,
            order_repair_count: 0,
            rent_per_unit: 5000,
          },
        ],
        event_address: "Municipal Grounds",
        event_pincode: "639002",
      },
      {
        order_id: "RENT-006",
        customer: {
          _id: "c7",
          name: "Mani V",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "mani@example.com",
          address: "Vellore",
          pincode: "632001",
        },
        billing_mode: BillingMode.BUSINESS,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PENDING,
        remarks: "",
        round_off: 0,
        payment_mode: PaymentMode.CASH,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-06-10T16:00",
        expected_date: "2025-06-10T22:00",
        in_date: "2025-06-10T22:00",
        product_details: [
          {
            _id: "p12",
            name: "Wireless Mic",
            category: "Audio",
            billing_unit: BillingUnit.SHIFT,
            product_unit: { _id: "u7", name: "unit" },
            in_date: "2025-06-10T22:00",
            out_date: "2025-06-10T16:00",
            order_quantity: 6,
            order_repair_count: 0,
            rent_per_unit: 300,
          },
        ],
        event_address: "Music Hall",
        event_pincode: "632002",
      },
      {
        order_id: "RENT-008",
        customer: {
          _id: "c8",
          name: "Deepa M",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "deepa@example.com",
          address: "Theni",
          pincode: "625531",
        },
        billing_mode: BillingMode.RETAIL,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PAID,
        remarks: "Conference setup",
        round_off: 0,
        payment_mode: PaymentMode.CASH,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [],
        out_date: "2025-07-11T10:00",
        expected_date: "2025-07-13T10:00",
        in_date: "2025-07-13T10:00",
        product_details: [
          {
            _id: "p13",
            name: "Event Table",
            category: "Furniture",
            billing_unit: BillingUnit.DAYS,
            product_unit: { _id: "u8", name: "piece" },
            in_date: "2025-07-13T10:00",
            out_date: "2025-07-11T10:00",
            order_quantity: 20,
            order_repair_count: 0,
            rent_per_unit: 150,
          },
        ],
        event_address: "Collectorate Grounds",
        event_pincode: "625532",
      },
      {
        order_id: "RENT-009",
        customer: {
          _id: "c9",
          name: "Rajesh Kumar",
          personal_number: "9002211345",
          office_number: "9002211345",
          gstin: "Asdasd",
          email: "rajesh@example.com",
          address: "Cuddalore",
          pincode: "607001",
        },
        billing_mode: BillingMode.BUSINESS,
        discount: 0,
        discount_amount: 0,
        status: PaymentStatus.PAID,
        remarks: "",
        round_off: 0,
        payment_mode: PaymentMode.ACCOUNT,
        gst: 18,
        type: ProductType.RENTAL,
        deposits: [
          {
            amount: 80000,
            mode: PaymentMode.ACCOUNT,
            product: {
              _id: "p14",
              name: "Stage ramp",
            },
            date: "2025-06-022T09:00",
          },
        ],
        out_date: "2025-07-01T09:00",
        expected_date: "2025-07-22T09:00",
        in_date: "2025-07-22T09:00",
        product_details: [
          {
            _id: "p14",
            name: "Stage Ramp",
            category: "Structure",
            billing_unit: BillingUnit.WEEKS,
            product_unit: { _id: "u9", name: "ft" },
            in_date: "2025-07-22T09:00",
            out_date: "2025-07-01T09:00",
            order_quantity: 1,
            order_repair_count: 0,
            rent_per_unit: 10000,
          },
          {
            _id: "p14",
            name: "Stage Ramp",
            category: "Structure",
            billing_unit: BillingUnit.WEEKS,
            product_unit: { _id: "u9", name: "ft" },
            in_date: "2025-07-22T09:00",
            out_date: "2025-07-01T09:00",
            order_quantity: 5,
            order_repair_count: 0,
            rent_per_unit: 10000,
          },
        ],
        event_address: "Expo Field",
        event_pincode: "607002",
      },
    ]);
    // }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

  useEffect(() => {
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
      pendingData: resultData.pendingAmountData.map((order) => order.order),
      balanceData: resultData.pendingBalanceData.map((order) => order.order),
      orderTimeLine: resultData.totalProductsOut.map((order) => order.order),
    });
  }, [filter, orders]);

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
