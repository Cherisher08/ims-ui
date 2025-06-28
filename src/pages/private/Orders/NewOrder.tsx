import { Tab, Tabs } from "@mui/material";
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
} from "../../../types/order";
import { ContactInfoType } from "../../../types/contact";
import DepositModal from "./DepositModal";
import CustomTable from "../../../styled/CustomTable";
import type { ColDef, ICellRendererParams } from "ag-grid-community";

const formatContacts = (
  contacts: ContactInfoType[]
): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact.id ?? "",
    value: contact.name,
  }));

const colDefs: ColDef<any> = [
  {
    field: "No.",
    headerName: "NO.",
    flex: 1,
    maxWidth: 70,
    headerClass: "ag-header-wrap text-start",
    cellRender: (_: ICellRendererParams, index: number) => {
      <p>{index + 1}</p>;
    },
  },
  {
    field: "product",
    headerName: "PRODUCT",
    flex: 1,
    headerClass: "ag-header-wrap",
  },
  {
    field: "repair_count",
    headerName: "REPAIR COUNT",
    flex: 1,
    maxWidth: 120,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data;
      return (
        <div className="flex gap-2 flex-wrap">
          {data.repair_count} <span>Unit(s)</span>
        </div>
      );
    },
  },
  {
    field: "quantity",
    headerName: "QUANTITY",
    flex: 1,
    maxWidth: 110,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data;
      return (
        <div className="flex gap-2 flex-wrap">
          {data.quantity} <span>Unit(s)</span>
        </div>
      );
    },
  },
  {
    field: "unitPrice",
    headerName: "UNIT PRICE",
    flex: 1,
    maxWidth: 120,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data;
      return <p>₹ {data.unitPrice}</p>;
    },
  },
  {
    field: "finalAmount",
    headerName: "FINAL AMOUNT",
    flex: 1,
    maxWidth: 180,
    headerClass: "ag-header-wrap",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data;
      return <p>₹ {data.finalAmount}</p>;
    },
  },
];

const paymentStatusOptions = Object.entries(PaymentStatus).map(
  ([key, value]) => ({
    id: key,
    value,
  })
);

const billingUnitOptions = Object.values(BillingUnit).map((unit) => ({
  id: unit,
  value: unit,
}));

const NewOrder = () => {
  const [orderInfo, setOrderInfo] = useState<Partial<OrderInfoType>>({
    type: OrderType.RENTAL,
    billingMode: BillingMode.BUSINESS,
    status: PaymentStatus.PENDING,
    paymentMode: PaymentMode.CASH,
  });

  const [contacts] = useState<ContactInfoType[]>([
    // ... your contact data (same as before)
  ]);

  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [productData, setProductData] = useState([]);
  const [depositData, setDepositData] = useState<DepositType[]>([
    {
      amount: 0,
      date: "",
      mode: PaymentMode.CASH,
      product: 0,
    },
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

  const handleAddProduct = () => {
    // Handle add product logic here
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
            <CustomButton label="Add product" onClick={handleAddProduct} />
          </div>
        )}
      </div>

      {/* === Order Info Form === */}
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex justify-between items-center">
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
                  (opt) => opt.id === orderInfo?.status
                ) ?? paymentStatusOptions[0]
              }
              onChange={(selected) =>
                handleValueChange("status", selected.id as PaymentStatus)
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
            // className="w-[12rem]"
            options={formatContacts(contacts)}
            value={orderInfo.customer}
            onChange={(selected) => handleValueChange("customer", selected)}
          />

          {OrderType.RENTAL === orderInfo.type && (
            <div className="w-full flex gap-2">
              <CustomDatePicker
                label="Out Date"
                value={orderInfo.outDate ?? ""}
                className="w-fit"
                wrapperClass="w-[13rem]"
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
        <div className="flex justify-between">
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
              wrapperClass="w-[20rem]"
              labelClass="w-[5rem]"
              value={orderInfo?.eventPincode ?? ""}
              onChange={(value) => handleValueChange("eventPincode", value)}
              label="Event Pincode"
              placeholder="Enter Event Pincode"
            />
          </div>
          <CustomInput
            value={orderInfo?.remarks ?? ""}
            onChange={(value) => handleValueChange("remarks", value)}
            label="Remarks"
            wrapperClass="w-[30rem]"
            placeholder="Enter remarks"
            multiline
            minRows={6}
          />
        </div>

        {/* === Products List === */}

        {/* === Order Summary === */}
        {/* {productData.length > 0 && ( */}
        <div className="w-full flex flex-col px-3">
          <p className="text-xl font-semibold">Order Summary</p>
          <CustomTable
            rowData={productData}
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
        {/* )} */}
      </div>

      <DepositModal
        depositOpen={depositOpen}
        setDepositOpen={(value: boolean) => setDepositOpen(value)}
        depositData={depositData}
        setDepositData={setDepositData}
      />
    </div>
  );
};

export default NewOrder;
