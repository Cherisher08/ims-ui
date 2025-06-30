import { Box, Chip, Tab, Tabs } from "@mui/material";
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
  PaymentMode,
  PaymentStatus,
  ProductDetails,
  RentalOrderInfo,
} from "../../../types/order";
import { ContactInfoType, initialContactType } from "../../../types/contact";
import DepositModal from "./DepositModal";
import CustomTable from "../../../styled/CustomTable";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { Product, ProductType } from "../../../types/common";
import AddProductModal from "./modals/AddProductModal";
import UpdateProductModal from "./modals/UpdateProductModal";
import { useGetProductsQuery } from "../../../services/ApiService";
import { useGetContactsQuery } from "../../../services/ContactService";

const formatContacts = (
  contacts: ContactInfoType[]
): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact._id ?? "",
    value: contact.name,
  }));

const calculateDiscountAmount = (
  discountPercent: number,
  finalAmount: number
) => {
  return +((discountPercent / 100.0) * finalAmount).toFixed(2);
};

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
      console.log("Quantity Data", data);
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

const initialRentalProduct: RentalOrderInfo = {
  _id: "",
  order_id: "",
  discount: 0,
  discount_amount: 0,
  remarks: "",
  type: ProductType.RENTAL,
  billing_mode: BillingMode.RETAIL,
  status: PaymentStatus.PENDING,
  payment_mode: PaymentMode.CASH,
  out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
  expected_date: dayjs().format("YYYY-MM-DDTHH:mm"),
  in_date: dayjs().format("YYYY-MM-DDTHH:mm"),
  round_off: 0,
  customer: initialContactType,
  event_address: "",
  event_pincode: "",
  product_details: [],
  deposits: [],
};

const NewOrder = () => {
  const isAllOrdersAllowed: boolean = false;
  const { data: productsData, isSuccess: isProductsQuerySuccess } =
    useGetProductsQuery();
  const { data: contactsData, isSuccess: isContactsQuerySuccess } =
    useGetContactsQuery();

  const [orderInfo, setOrderInfo] =
    useState<RentalOrderInfo>(initialRentalProduct);
  console.log("orderInfo: ", orderInfo);

  const [contacts, setContacts] = useState<ContactInfoType[]>([]);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);

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
    const discountAmount = calculateDiscountAmount(
      orderInfo.discount || 0,
      finalAmount
    );
    return finalAmount - totalDeposit - discountAmount + roundOff;
  };

  const calcFinalAmount = () => {
    if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
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
    if (orderInfo.type === ProductType.RENTAL) {
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
    if (orderInfo.type === ProductType.RENTAL) {
      console.log(orderInfo, depositData);
      orderInfo.deposits = depositData;
    }
  };

  useEffect(() => {
    if (isProductsQuerySuccess) {
      setProducts(productsData);
    }
    if (isContactsQuerySuccess) {
      setContacts(contactsData);
    }
  }, [
    contactsData,
    isContactsQuerySuccess,
    isProductsQuerySuccess,
    productsData,
  ]);

  return (
    <div className="w-full flex flex-col h-full">
      {/* === Top Tabs and Add Button === */}
      <div className="w-full flex justify-between mb-4">
        {isAllOrdersAllowed ? (
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
        ) : (
          <Box className="font-primary text-2xl font-bold w-full">
            Rental Order
          </Box>
        )}

        <div className="flex gap-3">
          {orderInfo.type === ProductType.RENTAL &&
            orderInfo.product_details &&
            orderInfo?.product_details?.length > 0 && (
              <CustomButton
                label="Deposits"
                onClick={() => setDepositOpen(true)}
              />
            )}
          <CustomButton
            label="Add product"
            onClick={() => setAddProductOpen(true)}
          />
        </div>
      </div>

      {/* === Order Info Form === */}
      <div className="w-full flex flex-col gap-2 overflow-y-scroll max-h-full">
        {orderInfo.type === ProductType.RENTAL && (
          <>
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
                      (paymentStatus) =>
                        orderInfo.status === paymentStatus.value
                    )?.id ?? ""
                  }
                  onChange={(id) =>
                    handleValueChange(
                      "status",
                      paymentStatusOptions.find((option) => option.id === id)
                        ?.value
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
                      e.target.checked
                        ? BillingMode.BUSINESS
                        : BillingMode.RETAIL
                    )
                  }
                />
                <p>Business</p>
              </div>
            </div>
          </>
        )}

        {/* === Customer + Rental Data === */}
        <div className="grid grid-cols-1 sm:grid-cols-[20%_auto] gap-2">
          <CustomSelect
            label="Customer"
            options={formatContacts(contacts)}
            value={
              formatContacts(contacts).find(
                (option) => option.id === orderInfo.customer?._id
              )?.id ?? ""
            }
            onChange={(id) =>
              handleValueChange(
                "customer",
                contacts.find((option) => option._id === id)
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
                      {orderInfo.billing_mode === BillingMode.BUSINESS && (
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
                      {orderInfo.billing_mode === BillingMode.BUSINESS && (
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
                              orderInfo.type === ProductType.RENTAL &&
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
                              orderInfo.type === ProductType.RENTAL &&
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
                    setOrderInfo(initialRentalProduct);
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
            orderInfo.type === ProductType.RENTAL &&
            orderInfo.product_details
          ) {
            return orderInfo.product_details.every(
              (detail) => detail._id !== prod._id
            );
          } else {
            return true;
          }
        })}
        setAddProductOpen={(value: boolean) => setAddProductOpen(value)}
      />

      <UpdateProductModal
        updateProduct={updateProduct}
        updateProductOpen={updateProductOpen}
        updateProductToOrder={updateProductToOrder}
        products={products.filter((prod) => prod._id === updateProduct?._id)}
        setUpdateProduct={setUpdateProduct}
        setUpdateProductOpen={(value: boolean) => setUpdateProductOpen(value)}
      />

      {orderInfo.type === ProductType.RENTAL && orderInfo.product_details && (
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
