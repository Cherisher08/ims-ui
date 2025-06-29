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
import AddProductModal from "./modals/AddProductModal";
import UpdateProductModal from "./modals/UpdateProductModal";

const formatContacts = (
  contacts: ContactInfoType[]
): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact.id ?? "",
    value: contact.name,
  }));

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
        <div className="flex flex-col p-0">
          <p className="h-[2rem] text-start align-top">{data.name}</p>
          <span className="text-xs text-gray-500">{data.category}</span>
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
      console.log(data);
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
          ₹{" "}
          {(data.order_quantity - data.order_repair_count) * data.rent_per_unit}
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
  const sampleOutPutData = {
    type: "rental",
    billingMode: "Retail",
    status: "pending",
    paymentMode: "cash",
    out_date: "2025-06-29T12:59",
    expectedDate: "2025-06-29T12:59",
    in_date: "2025-06-29T12:59",
    orderId: "asdasda",
    customer: {
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
    eventAddress: "asdasd",
    eventPincode: "asd123",
    remarks: "123123",
    productDetails: [
      {
        _id: "p2",
        name: "Welding Machine",
        category: "EQUIPMENT",
        billing_unit: "days",
        product_unit: {
          _id: "u2",
          name: "g",
        },
        in_date: "+0530-06-29T12:54",
        order_quantity: 123,
        order_repair_count: 0,
        out_date: "+0530-06-29T12:54",
        rent_per_unit: 100,
      },
      {
        _id: "p5",
        name: "Safety Helmet",
        category: "SAFETY",
        billing_unit: "days",
        product_unit: {
          _id: "u2",
          name: "g",
        },
        in_date: "+0530-06-29T12:54",
        order_quantity: 12012,
        order_repair_count: 0,
        out_date: "+0530-06-29T12:54",
        rent_per_unit: 2000,
      },
    ],
    deposit: [
      {
        amount: 2113,
        date: "2025-06-29T12:59",
        product: {
          _id: "p2",
          name: "Welding Machine",
          category: "EQUIPMENT",
          billing_unit: "days",
          product_unit: {
            _id: "u2",
            name: "g",
          },
          in_date: "+0530-06-29T12:54",
          order_quantity: 123,
          order_repair_count: 0,
          out_date: "+0530-06-29T12:54",
          rent_per_unit: 100,
        },
        mode: "gpay",
      },
      {
        amount: 123,
        date: "2025-06-29T13:02",
        mode: "cash",
        product: {
          _id: "p2",
          name: "Welding Machine",
          category: "EQUIPMENT",
          billing_unit: "days",
          product_unit: {
            _id: "u2",
            name: "g",
          },
          in_date: "+0530-06-29T12:54",
          order_quantity: 123,
          order_repair_count: 0,
          out_date: "+0530-06-29T12:54",
          rent_per_unit: 209,
        },
      },
      {
        amount: 12312,
        date: "2025-06-29T13:02",
        mode: "gpay",
        product: {
          _id: "p5",
          name: "Safety Helmet",
          category: "SAFETY",
          billing_unit: "days",
          product_unit: {
            _id: "u2",
            name: "g",
          },
          in_date: "+0530-06-29T12:54",
          order_quantity: 12012,
          order_repair_count: 0,
          out_date: "+0530-06-29T12:54",
          rent_per_unit: 200,
        },
      },
    ],
  };

  const [orderInfo, setOrderInfo] = useState<Partial<OrderInfoType>>({
    type: ProductType.RENTAL,
    billing_mode: BillingMode.RETAIL,
    status: PaymentStatus.PENDING,
    payment_mode: PaymentMode.CASH,
    out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
    expected_date: dayjs().format("YYYY-MM-DDTHH:mm"),
    in_date: dayjs().format("YYYY-MM-DDTHH:mm"),
    round_off: 0,
  });

  const [contacts, setContacts] = useState<ContactInfoType[]>([
    {
      _id: "c1",
      name: "Rahul Mehra",
      personal_number: "9876543210",
      office_number: "02212345678",
      gstin: "27AABCU9603R1ZV",
      email: "rahul.mehra@example.com",
      address: "501, Rose Residency, Andheri West, Mumbai",
      pincode: "400058",
      company_name: "Mehra Enterprises",
      address_proof: "Aadhar Card",
    },
    {
      _id: "c2",
      name: "Anita Sharma",
      personal_number: "9123456789",
      office_number: "01122446688",
      gstin: "07AAACB2233M1Z2",
      email: "anita.sharma@example.in",
      address: "Flat 9B, Green Heights, Dwarka, New Delhi",
      pincode: "110075",
      company_name: "Sharma Logistics",
      address_proof: "Electricity Bill",
    },
    {
      _id: "c3",
      name: "Vikram Reddy",
      personal_number: "9988776655",
      office_number: "04023456789",
      gstin: "36AACCV1234B1Z9",
      email: "vikram.reddy@reddygroup.com",
      address: "Plot No. 22, Banjara Hills, Hyderabad",
      pincode: "500034",
      company_name: "Reddy Group",
      address_proof: "Passport",
    },
    {
      _id: "c4",
      name: "Priya Verma",
      personal_number: "9090909090",
      office_number: "03398765432",
      gstin: "19AAACP4065N1ZR",
      email: "priya.verma@pvsolutions.com",
      address: "23/4 Lake Gardens, Kolkata",
      pincode: "700045",
      company_name: "PV Solutions",
      address_proof: "Driving License",
    },
    {
      _id: "c5",
      name: "Karan Joshi",
      personal_number: "9811122233",
      office_number: "07933445566",
      gstin: "24AAECS1111F1Z6",
      email: "karan.joshi@techworld.io",
      address: "5th Floor, Silicon Tower, Ahmedabad",
      pincode: "380015",
      company_name: "TechWorld Innovations",
      address_proof: "Rent Agreement",
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
      rent_per_unit: 200,
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
      rent_per_unit: 1000,
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
      rent_per_unit: 100,
      discount: 5,
      discount_type: DiscountType.PERCENT,
      created_by: "admin",
    },
  ]);

  const [updateProductOpen, setUpdateProductOpen] = useState<boolean>(false);
  const [updateProduct, setUpdateProduct] = useState<ProductDetails>({
    _id: "",
    name: "",
    category: "",
    billing_unit: BillingUnit.DAYS,
    product_unit: {
      _id: "",
      name: "",
    },
    in_date: dayjs().format("YYY-MM-DDTHH:mm"),
    order_quantity: 0,
    order_repair_count: 0,
    out_date: dayjs().format("YYY-MM-DDTHH:mm"),
    rent_per_unit: 0,
  });

  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [depositData, setDepositData] = useState<DepositType[]>([
    {
      amount: 0,
      date: dayjs().format("YYYY-MM-DDTHH:mm"),
      product: null,
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

  const calcTotal = () => {
    const totalDeposit = depositData.reduce(
      (total, deposit) => total + deposit.amount,
      0
    );
    const finalAmount = calcFinalAmount();
    const roundOff = orderInfo.round_off || 0;
    const discountAmount = orderInfo.discount_amount || 0;
    return finalAmount - totalDeposit - discountAmount + roundOff;
  };

  const calcFinalAmount = () => {
    if (orderInfo.type === OrderType.RENTAL && orderInfo.product_details) {
      return orderInfo.product_details.reduce(
        (total, prod) =>
          total +
          prod.rent_per_unit * (prod.order_quantity - prod.order_repair_count),
        0
      );
    }
    return 0;
  };

  const addProductToOrder = (product: ProductDetails) => {
    if (orderInfo.type === ProductType.RENTAL) {
      const products = orderInfo.product_details || [];

      const alreadyAdded = products.some((p) => p._id === product._id);

      if (!alreadyAdded) {
        const newProducts = [...products, product];
        setOrderInfo({
          ...orderInfo,
          product_details: newProducts,
        });
      }
    }
  };

  const updateProductToOrder = () => {
    if (orderInfo.type === OrderType.RENTAL) {
      const products = orderInfo.product_details || [];
      const newProducts = products.map((prod) =>
        prod._id === updateProduct._id ? updateProduct : prod
      );
      setOrderInfo({
        ...orderInfo,
        product_details: newProducts,
      });
      setUpdateProduct({
        _id: "",
        name: "",
        category: "",
        billing_unit: BillingUnit.DAYS,
        product_unit: {
          _id: "",
          name: "",
        },
        in_date: dayjs().format("YYY-MM-DDTHH:mm"),
        order_quantity: 0,
        order_repair_count: 0,
        out_date: dayjs().format("YYY-MM-DDTHH:mm"),
        rent_per_unit: 0,
      });
    }
  };

  const removeOrderProduct = (id: string) => {
    if (orderInfo.type === ProductType.RENTAL) {
      const filteredProducts = (orderInfo.product_details || []).filter(
        (prod) => prod._id !== id
      );

      setOrderInfo({
        ...orderInfo,
        product_details: filteredProducts,
      });
    }
  };

  const createNewOrder = () => {
    if (orderInfo.type === OrderType.RENTAL) {
      console.log(orderInfo, depositData);
      orderInfo.deposit = depositData;
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* === Top Tabs and Add Button === */}
      <div className="w-full flex justify-between mb-4">
        <Tabs
          value={orderInfo.type}
          onChange={(_, value) => handleValueChange("type", value)}
          sx={{ "& .MuiTabs-indicator": { display: "none" } }}
        >
          {Object.values(ProductType).map((type) => (
            <Tab
              key={type}
              label={type.charAt(0) + type.slice(1).toLowerCase()}
              value={type}
              sx={{
                backgroundColor: orderInfo.type === type ? "#002f53" : "",
                color: orderInfo.type === type ? "#ffffff !important" : "",
                fontWeight: orderInfo.type === type ? "bold" : "normal",
              }}
            />
          ))}
        </Tabs>

        <div className="flex gap-3">
          {orderInfo.type === OrderType.RENTAL &&
            orderInfo.product_details &&
            orderInfo?.product_details?.length > 0 && (
              <CustomButton
                label="Deposits"
                onClick={() => setDepositOpen(true)}
              />
            )}
          {orderInfo.type !== OrderType.SERVICE && (
            <CustomButton
              label="Add product"
              onClick={() => setAddProductOpen(true)}
            />
          )}
        </div>
      </div>

      {/* === Order Info Form === */}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-nowrap gap-3">
            <CustomInput
              onChange={(value) => handleValueChange("order_id", value)}
              label="Order Id"
              placeholder="Enter Order Id"
              value={orderInfo?.order_id ?? ""}
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
              checked={orderInfo.billing_mode === BillingMode.BUSINESS}
              onChange={(e) =>
                handleValueChange(
                  "billing_mode",
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

          {ProductType.RENTAL === orderInfo.type && (
            <div className="w-full flex gap-2">
              <CustomDatePicker
                label="Out Date"
                value={orderInfo.out_date ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
                labelClass="w-fit"
                onChange={(value) => handleValueChange("out_date", value)}
                placeholder="Enter Out Date"
              />

              <CustomDatePicker
                label="Expected Date"
                value={orderInfo.expected_date ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
                onChange={(value) => handleValueChange("expectedDate", value)}
                placeholder="Enter Expected Date"
              />

              <CustomDatePicker
                label="In Date"
                value={orderInfo.in_date ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
                onChange={(value) => handleValueChange("in_date", value)}
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
              value={orderInfo?.event_address ?? ""}
              onChange={(value) => handleValueChange("event_address", value)}
              label="Event Address"
              placeholder="Enter Event Address"
              multiline
              minRows={5}
            />
            <CustomInput
              wrapperClass="w-[30rem]"
              labelClass="w-[5rem]"
              value={orderInfo?.event_pincode ?? ""}
              onChange={(value) => handleValueChange("event_pincode", value)}
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
              {orderInfo.type === ProductType.RENTAL &&
                orderInfo.product_details?.map((product) => (
                  <Chip
                    key={product._id}
                    label={product.name}
                    onClick={() => {
                      setUpdateProductOpen(true);
                      setUpdateProduct(product);
                    }}
                    onDelete={() => removeOrderProduct(product._id)}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* === Order Summary === */}
        {orderInfo.type === ProductType.RENTAL &&
          orderInfo.product_details &&
          orderInfo.product_details.length > 0 && (
            <div className="w-full flex flex-col px-3">
              <p className="text-xl font-semibold">Order Summary</p>
              <CustomTable
                rowData={orderInfo.product_details ?? []}
                colDefs={colDefs}
                pagination={false}
                isLoading={false}
                rowHeight={60}
              />
              <div className="flex justify-end w-full">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 text-gray-500">
                      <p>Deposit</p>
                      <p>Total Amount</p>
                      {orderInfo.billingMode === BillingMode.BUSINESS && (
                        <p>GST (10%)</p>
                      )}
                      <p>Discount</p>
                      <p>Discount Amount</p>
                      <p>Round Off</p>
                    </div>
                    <div className="flex flex-col gap-1 text-gray-500 text-end">
                      <p>
                        ₹{" "}
                        {depositData.reduce(
                          (total, deposit) => total + deposit.amount,
                          0
                        )}
                      </p>
                      <p>₹ {calcFinalAmount()}</p>
                      {orderInfo.billingMode === BillingMode.BUSINESS && (
                        <p>
                          ₹{" "}
                          {depositData.reduce(
                            (total, deposit) => total + deposit.amount,
                            0
                          )}
                        </p>
                      )}
                      <div className="flex justify-end gap-1">
                        <input
                          className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                          type="number"
                          value={orderInfo.discount}
                          onChange={(e) => {
                            if (
                              orderInfo.type === OrderType.RENTAL &&
                              orderInfo.product_details
                            ) {
                              const percent = parseInt(e.target.value);
                              const total_amount = calcFinalAmount();
                              const discount_amount =
                                total_amount * percent * 0.001;
                              setOrderInfo((prev) => ({
                                ...prev,
                                discount: percent,
                                discount_amount: discount_amount,
                              }));
                            }
                          }}
                        />
                        <span className="w-2">%</span>
                      </div>
                      <p>
                        <input
                          className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                          type="number"
                          value={orderInfo.discount_amount}
                          onChange={(e) => {
                            if (
                              orderInfo.type === OrderType.RENTAL &&
                              orderInfo.product_details
                            ) {
                              const amount = parseInt(e.target.value);
                              const total_amount = calcFinalAmount();
                              const percent = parseFloat(
                                ((amount / total_amount) * 100).toFixed(2)
                              );
                              setOrderInfo((prev) => ({
                                ...prev,
                                discount: percent,
                                discount_amount: amount,
                              }));
                            }
                          }}
                        />{" "}
                        ₹
                      </p>
                      <div>
                        <input
                          className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                          type="number"
                          value={orderInfo.round_off}
                          onChange={(e) =>
                            setOrderInfo((prev) => ({
                              ...prev,
                              round_off: parseInt(e.target.value),
                            }))
                          }
                        />{" "}
                        ₹
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] w-full text-right text-gray-500">
                    All taxes included.
                  </span>
                  <div className="grid grid-cols-2 border-t border-t-gray-200">
                    <div className="flex flex-col gap-1 font-semibold pb-2">
                      <p>{calcTotal() > 0 ? "Balance" : "Refund"}</p>
                      <p>Mode</p>
                    </div>
                    <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                      <p className="font-semibold text-black">
                        ₹ {calcTotal()}
                      </p>
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
                  onClick={() => {
                    setDepositData([]);
                    setOrderInfo({
                      type: OrderType.RENTAL,
                      billingMode: BillingMode.RETAIL,
                      status: PaymentStatus.PENDING,
                      paymentMode: PaymentMode.CASH,
                      out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
                      expected_date: dayjs().format("YYYY-MM-DDTHH:mm"),
                      in_date: dayjs().format("YYYY-MM-DDTHH:mm"),
                    });
                  }}
                  variant="outlined"
                />
                <CustomButton label="Create Order" onClick={createNewOrder} />
              </div>
            </div>
          )}
      </div>

      <AddProductModal
        addProductOpen={addProductOpen}
        addProductToOrder={addProductToOrder}
        products={products.filter((prod) => {
          if (
            orderInfo.type === OrderType.RENTAL &&
            orderInfo.product_details
          ) {
            return orderInfo.product_details.every(
              (detail) => detail._id !== prod._id
            );
          } else {
            return true;
          }
        })}
        units={units}
        setAddProductOpen={(value: boolean) => setAddProductOpen(value)}
      />

      <UpdateProductModal
        updateProduct={updateProduct}
        updateProductOpen={updateProductOpen}
        updateProductToOrder={updateProductToOrder}
        products={products.filter((prod) => prod._id === updateProduct?._id)}
        units={units}
        setUpdateProduct={setUpdateProduct}
        setUpdateProductOpen={(value: boolean) => setUpdateProductOpen(value)}
      />

      {orderInfo.type === OrderType.RENTAL && orderInfo.product_details && (
        <DepositModal
          depositOpen={depositOpen}
          setDepositOpen={(value: boolean) => setDepositOpen(value)}
          products={orderInfo.product_details}
          depositData={depositData}
          setDepositData={setDepositData}
        />
      )}
    </div>
  );
};

export default NewOrder;
