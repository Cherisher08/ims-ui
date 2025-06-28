import { Chip, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import CustomButton from "../../../styled/CustomButton";
import CustomInput from "../../../styled/CustomInput";
import CustomSelect, {
  CustomSelectOptionProps,
} from "../../../styled/CustomSelect";
import AntSwitch from "../../../styled/CustomSwitch";
import CustomDatePicker from "../../../styled/CustomDatePicker";
import {
  BillingMode,
  BillingUnit,
  DepositType,
  OrderInfoType,
  OrderSummaryType,
  OrderType,
  PaymentMode,
  PaymentStatus,
  ProductDetails,
} from "../../../types/order";
import { ContactInfoType } from "../../../types/contact";
import DepositModal from "./DepositModal";
import CustomTable from "../../../styled/CustomTable";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import {
  DiscountType,
  Product,
  ProductType,
  Unit,
} from "../../../types/common";
import AddProductModal from "./AddProductModal";

const formatContacts = (
  contacts: ContactInfoType[]
): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact.id ?? "",
    value: contact.name,
  }));

// const colDefs: ColDef<Partial<OrderInfoType>>[] = [
//   {
//     headerName: "NO.",
//     flex: 1,
//     maxWidth: 70,
//     headerClass: "ag-header-wrap text-start",
//     cellRenderer: (_: ICellRendererParams, index: number) => {
//       <p>{index + 1}</p>;
//     },
//   },
//   {
//     field: "product",
//     headerName: "PRODUCT",
//     flex: 1,
//     headerClass: "ag-header-wrap",
//     cellRenderer: (params: ICellRendererParams) => {
//       const data = params.data;
//       return (
//         <div className="flex flex-col">
//           <p>{data.product.name}</p>
//           <p>{data.product.category}</p>
//         </div>
//       );
//     },
//   },
//   {
//     field: "repair_count",
//     headerName: "REPAIR COUNT",
//     flex: 1,
//     maxWidth: 120,
//     headerClass: "ag-header-wrap",
//     cellRenderer: (params: ICellRendererParams) => {
//       const data = params.data;
//       return (
//         <div className="flex gap-2 flex-wrap">
//           {data.repair_count} <span>Unit(s)</span>
//         </div>
//       );
//     },
//   },
//   {
//     field: "quantity",
//     headerName: "QUANTITY",
//     flex: 1,
//     maxWidth: 110,
//     headerClass: "ag-header-wrap",
//     cellRenderer: (params: ICellRendererParams) => {
//       const data = params.data;
//       return (
//         <div className="flex gap-2 flex-wrap">
//           {data.quantity} <span>Unit(s)</span>
//         </div>
//       );
//     },
//   },
//   {
//     field: "rent_per_price",
//     headerName: "RENT PER PRICE",
//     flex: 1,
//     maxWidth: 120,
//     headerClass: "ag-header-wrap",
//     cellRenderer: (params: ICellRendererParams) => {
//       const data = params.data;
//       return <p>₹ {data.unit_price}</p>;
//     },
//   },
//   {
//     field: "final_amount",
//     headerName: "FINAL AMOUNT",
//     flex: 1,
//     maxWidth: 180,
//     headerClass: "ag-header-wrap",
//     cellRenderer: (params: ICellRendererParams) => {
//       const data = params.data;
//       return <p>₹ {data.final_amount}</p>;
//     },
//   },
// ];

const colDefs: ColDef<ProductDetails>[] = [
  {
    headerName: "NO.",
    flex: 1,
    maxWidth: 70,
    headerClass: "ag-header-wrap text-start",
    cellRenderer: (params: ICellRendererParams) => {
      const rowIndex = params.node?.rowIndex ?? 0;
      return <p>{rowIndex + 1}</p>;
    },
  },
  {
    field: "name",
    headerName: "PRODUCT",
    flex: 1,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data as ProductDetails;
      return (
        <div className="flex flex-col">
          <p>{data.name}</p>
          <p className="text-xs text-gray-500">{data.category}</p>
        </div>
      );
    },
  },
  {
    field: "order_repair_count",
    headerName: "REPAIR COUNT",
    flex: 1,
    maxWidth: 120,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data as ProductDetails;
      return (
        <div className="flex gap-2 flex-wrap">
          {data.order_repair_count} <span>Unit(s)</span>
        </div>
      );
    },
  },
  {
    field: "order_quantity",
    headerName: "QUANTITY",
    flex: 1,
    maxWidth: 110,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data as ProductDetails;
      return (
        <div className="flex gap-2 flex-wrap">
          {data.order_quantity} <span>Unit(s)</span>
        </div>
      );
    },
  },
  {
    field: "rent_per_unit",
    headerName: "RENT PER UNIT",
    flex: 1,
    maxWidth: 120,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data as ProductDetails;
      return <p>₹ {data?.rent_per_unit}</p>;
    },
  },
  {
    headerName: "FINAL AMOUNT",
    flex: 1,
    maxWidth: 180,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data as ProductDetails;
      return (
        <p>
          ₹ {(data.order_quantity - data.order_quantity) * data.rent_per_unit}
        </p>
      );
    },
  },
];

const paymentStatusOptions = Object.entries(PaymentStatus).map(
  ([key, value]) => ({
    id: key,
    value,
  })
);

const NewOrder = () => {
  const [orderInfo, setOrderInfo] = useState<Partial<OrderInfoType>>({
    type: OrderType.RENTAL,
    billingMode: BillingMode.BUSINESS,
    status: PaymentStatus.PENDING,
    paymentMode: PaymentMode.CASH,
    outDate: dayjs().format("YYYY-MM-DDTHH:mm"),
    expectedDate: dayjs().format("YYYY-MM-DDTHH:mm"),
    inDate: dayjs().format("YYYY-MM-DDTHH:mm"),
  });

  const [contacts, setContacts] = useState<ContactInfoType[]>([
    {
      id: "c1",
      name: "Rahul Mehra",
      personalNumber: "9876543210",
      officeNumber: "02212345678",
      gstin: "27AABCU9603R1ZV",
      email: "rahul.mehra@example.com",
      address: "501, Rose Residency, Andheri West, Mumbai",
      pincode: "400058",
      companyName: "Mehra Enterprises",
      addressProof: "Aadhar Card",
    },
    {
      id: "c2",
      name: "Anita Sharma",
      personalNumber: "9123456789",
      officeNumber: "01122446688",
      gstin: "07AAACB2233M1Z2",
      email: "anita.sharma@example.in",
      address: "Flat 9B, Green Heights, Dwarka, New Delhi",
      pincode: "110075",
      companyName: "Sharma Logistics",
      addressProof: "Electricity Bill",
    },
    {
      id: "c3",
      name: "Vikram Reddy",
      personalNumber: "9988776655",
      officeNumber: "04023456789",
      gstin: "36AACCV1234B1Z9",
      email: "vikram.reddy@reddygroup.com",
      address: "Plot No. 22, Banjara Hills, Hyderabad",
      pincode: "500034",
      companyName: "Reddy Group",
      addressProof: "Passport",
    },
    {
      id: "c4",
      name: "Priya Verma",
      personalNumber: "9090909090",
      officeNumber: "03398765432",
      gstin: "19AAACP4065N1ZR",
      email: "priya.verma@pvsolutions.com",
      address: "23/4 Lake Gardens, Kolkata",
      pincode: "700045",
      companyName: "PV Solutions",
      addressProof: "Driving License",
    },
    {
      id: "c5",
      name: "Karan Joshi",
      personalNumber: "9811122233",
      officeNumber: "07933445566",
      gstin: "24AAECS1111F1Z6",
      email: "karan.joshi@techworld.io",
      address: "5th Floor, Silicon Tower, Ahmedabad",
      pincode: "380015",
      companyName: "TechWorld Innovations",
      addressProof: "Rent Agreement",
    },
  ]);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([
    {
      _id: "p1",
      name: "Cordless Drill",
      created_at: "2024-12-01T10:15:00Z",
      quantity: 50,
      available_stock: 45,
      repair_count: 2,
      product_code: "CDR-101",
      category: { _id: "c1", name: "TOOLS" },
      price: 2500,
      type: ProductType.SALES,
      purchase_date: "2024-11-15",
      unit: { _id: "u1", name: "PCS" },
      rent_per_unit: 0,
      discount: 10,
      discount_type: DiscountType.PERCENT,
      created_by: "admin",
    },
    {
      _id: "p2",
      name: "Welding Machine",
      created_at: "2025-01-10T08:45:00Z",
      quantity: 20,
      available_stock: 18,
      repair_count: 1,
      product_code: "WLD-203",
      category: { _id: "c2", name: "EQUIPMENT" },
      price: 12000,
      type: ProductType.RENTAL,
      purchase_date: "2024-12-20",
      unit: { _id: "u1", name: "PCS" },
      rent_per_unit: 300,
      discount: 500,
      discount_type: DiscountType.RUPEES,
      created_by: "manager1",
    },
    {
      _id: "p3",
      name: "Hammer",
      created_at: "2025-02-15T09:30:00Z",
      quantity: 100,
      available_stock: 90,
      repair_count: 0,
      product_code: "HAM-002",
      category: { _id: "c1", name: "TOOLS" },
      price: 150,
      type: ProductType.SALES,
      purchase_date: "2025-01-10",
      unit: { _id: "u1", name: "PCS" },
      rent_per_unit: 0,
      discount: 0,
      discount_type: DiscountType.RUPEES,
      created_by: "admin",
    },
    {
      _id: "p4",
      name: "Concrete Mixer",
      created_at: "2025-03-05T13:00:00Z",
      quantity: 10,
      available_stock: 7,
      repair_count: 2,
      product_code: "CMX-401",
      category: { _id: "c4", name: "MACHINERY" },
      price: 55000,
      type: ProductType.RENTAL,
      purchase_date: "2025-02-15",
      unit: { _id: "u2", name: "SET" },
      rent_per_unit: 1200,
      discount: 1000,
      discount_type: DiscountType.RUPEES,
      created_by: "supervisor1",
    },
    {
      _id: "p5",
      name: "Safety Helmet",
      created_at: "2025-04-01T12:00:00Z",
      quantity: 200,
      available_stock: 195,
      repair_count: 0,
      product_code: "SHL-010",
      category: { _id: "c3", name: "SAFETY" },
      price: 250,
      type: ProductType.SALES,
      purchase_date: "2025-03-01",
      unit: { _id: "u1", name: "PCS" },
      rent_per_unit: 0,
      discount: 5,
      discount_type: DiscountType.PERCENT,
      created_by: "admin",
    },
  ]);

  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [depositData, setDepositData] = useState<Partial<DepositType>[]>([
    {
      date: dayjs().format("YYYY-MM-DDTHH:mm"),
      mode: PaymentMode.CASH,
    },
  ]);

  const [units, setUnits] = useState<Unit[]>([
    { _id: "u1", name: "kg" },
    { _id: "u2", name: "g" },
    { _id: "u3", name: "l" },
    { _id: "u4", name: "ml" },
    { _id: "u5", name: "m" },
  ]);

  useEffect(() => {
    console.log("Order Info Updated:", orderInfo);
  }, [orderInfo]);

  const handleValueChange = (key: string, value: any) => {
    setOrderInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const selectedOrderType = orderInfo.type ?? OrderType.RENTAL;

  const addProductToOrder = (product: ProductDetails) => {
    if (orderInfo.type === OrderType.RENTAL) {
      const products = orderInfo.productDetails || [];
      const newProducts = [...products, product];
      setOrderInfo({
        ...orderInfo,
        productDetails: newProducts,
      });
    }
  };

  const removeOrderProduct = (id: string) => {
    if (orderInfo.type === OrderType.RENTAL) {
      const filteredProducts = (orderInfo.productDetails || []).filter(
        (prod) => prod._id !== id
      );

      setOrderInfo({
        ...orderInfo,
        productDetails: filteredProducts,
      });
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* === Top Tabs and Add Button === */}
      <div className="w-full flex justify-between mb-4">
        <Tabs
          value={selectedOrderType}
          onChange={(_, value) => handleValueChange("type", value)}
          sx={{ "& .MuiTabs-indicator": { display: "none" } }}
        >
          {Object.values(OrderType).map((type) => (
            <Tab
              key={type}
              label={type.charAt(0) + type.slice(1).toLowerCase()}
              value={type}
              sx={{
                backgroundColor: selectedOrderType === type ? "#002f53" : "",
                color: selectedOrderType === type ? "#ffffff !important" : "",
                fontWeight: selectedOrderType === type ? "bold" : "normal",
              }}
            />
          ))}
        </Tabs>

        {selectedOrderType !== OrderType.SERVICE && (
          <div className="flex gap-3">
            <CustomButton
              label="Deposits"
              onClick={() => setDepositOpen(true)}
            />
            <CustomButton
              label="Add product"
              onClick={() => setAddProductOpen(true)}
            />
          </div>
        )}
      </div>

      {/* === Order Info Form === */}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-nowrap gap-3">
            <CustomInput
              onChange={(value) => handleValueChange("orderId", value)}
              label="Order Id"
              placeholder="Enter Order Id"
              value={orderInfo?.orderId ?? ""}
              className="min-w-[15rem] max-w-[35rem]"
            />

            <CustomSelect
              label="Payment Status"
              className="w-[15rem]"
              labelClass="w-fit"
              options={paymentStatusOptions}
              value={
                paymentStatusOptions.find(
                  (paymentStatus) => orderInfo.status === paymentStatus.value
                )?.id ?? ""
              }
              onChange={(id) =>
                handleValueChange(
                  "status",
                  paymentStatusOptions.find((option) => option.id === id)?.value
                )
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <p>Retail</p>
            <AntSwitch
              checked={orderInfo.billingMode === BillingMode.BUSINESS}
              onChange={(e) =>
                handleValueChange(
                  "billingMode",
                  e.target.checked ? BillingMode.BUSINESS : BillingMode.RETAIL
                )
              }
            />
            <p>Business</p>
          </div>
        </div>

        {/* === Customer + Rental Dates === */}
        <div className="grid grid-cols-1 sm:grid-cols-[22%_auto] gap-3">
          <CustomSelect
            label="Customer"
            options={formatContacts(contacts)}
            value={
              formatContacts(contacts).find(
                (option) => option.id === orderInfo.customer?.id
              )?.id ?? ""
            }
            onChange={(id) =>
              handleValueChange(
                "customer",
                contacts.find((option) => option.id === id)
              )
            }
          />

          {OrderType.RENTAL === orderInfo.type && (
            <div className="w-full flex gap-2">
              <CustomDatePicker
                label="Out Date"
                value={orderInfo.outDate ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
                labelClass="w-fit"
                onChange={(value) => handleValueChange("outDate", value)}
                placeholder="Enter Out Date"
              />

              <CustomDatePicker
                label="Expected Date"
                value={orderInfo.expectedDate ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
                onChange={(value) => handleValueChange("expectedDate", value)}
                placeholder="Enter Expected Date"
              />

              <CustomDatePicker
                label="In Date"
                value={orderInfo.inDate ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
                onChange={(value) => handleValueChange("inDate", value)}
                placeholder="Enter In Date"
              />
            </div>
          )}
        </div>
        {/* ===Event Data === */}
        <div className="grid grid-cols-2 justify-between">
          <div className="flex flex-col">
            <CustomInput
              wrapperClass="w-[30rem]"
              labelClass="w-[5rem]"
              value={orderInfo?.eventAddress ?? ""}
              onChange={(value) => handleValueChange("eventAddress", value)}
              label="Event Address"
              placeholder="Enter Event Address"
              multiline
              minRows={5}
            />
            <CustomInput
              wrapperClass="w-[30rem]"
              labelClass="w-[5rem]"
              value={orderInfo?.eventPincode ?? ""}
              onChange={(value) => handleValueChange("eventPincode", value)}
              label="Event Pincode"
              placeholder="Enter Event Pincode"
            />
            <CustomInput
              value={orderInfo?.remarks ?? ""}
              onChange={(value) => handleValueChange("remarks", value)}
              label="Remarks"
              wrapperClass="w-[30rem]"
              placeholder="Enter remarks"
              multiline
              minRows={3}
            />
          </div>
          <div className="grid grid-cols-[auto_1fr] items-start gap-3">
            <p className="w-full text-right px-2 pt-1">Products</p>

            <div className="flex flex-wrap gap-2 border border-[#ced4da] content-start rounded-md p-2 w-full h-[9.3rem] overflow-y-auto">
              {orderInfo.type === OrderType.RENTAL &&
                orderInfo.productDetails?.map((product) => (
                  <Chip
                    key={product._id}
                    label={product.name}
                    onClick={() => console.log(1)}
                    onDelete={() => removeOrderProduct(product._id)}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* === Order Summary === */}
        {orderInfo.type === OrderType.RENTAL &&
          orderInfo.productDetails &&
          orderInfo.productDetails.length > 0 && (
            <div className="w-full flex flex-col px-3">
              <p className="text-xl font-semibold">Order Summary</p>
              <CustomTable
                rowData={orderInfo.productDetails ?? []}
                colDefs={colDefs}
                pagination={false}
                isLoading={false}
              />
              <div className="flex justify-end w-full">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 border-b border-b-gray-200">
                    <div className="flex flex-col gap-1 text-gray-500 pb-2">
                      <p>Deposit</p>
                      <p>Total Amount</p>
                      <p>GST (10%)</p>
                      <p>Round Off</p>
                      <p>Discount</p>
                      <p>Discount Amount</p>
                    </div>
                    <div className="flex flex-col gap-1 text-gray-500 text-end pb-2">
                      <p>₹ 10000</p>
                      <p>₹ 2000</p>
                      <p>₹ 10</p>
                      <p>₹ 10</p>
                      <p>5%</p>
                      <p>₹ 120</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="flex flex-col gap-1 font-semibold pb-2">
                      <p>Refund</p>
                      <p>Mode</p>
                    </div>
                    <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                      <p className="font-semibold text-black">₹ 10000</p>
                      <select
                        className="w-fit outline-none"
                        onChange={(e) =>
                          handleValueChange("payment_mode", e.target.value)
                        }
                      >
                        {Object.keys(PaymentMode).map((mode) => (
                          <option>{mode}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 my-3 justify-end">
                <CustomButton
                  label="Cancel"
                  onClick={() => {}}
                  variant="outlined"
                />
                <CustomButton label="Create Order" onClick={() => {}} />
              </div>
            </div>
          )}
      </div>

      <AddProductModal
        addProductOpen={addProductOpen}
        addProductToOrder={addProductToOrder}
        products={products}
        units={units}
        setAddProductOpen={(value: boolean) => setAddProductOpen(value)}
      />

      {/* <DepositModal
        depositOpen={depositOpen}
        setDepositOpen={(value: boolean) => setDepositOpen(value)}
        depositData={depositData}
        setDepositData={setDepositData}
      /> */}
    </div>
  );
};

export default NewOrder;
