import { Box, Chip, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  OrderInfo,
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
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../../../services/ApiService";
import { useGetContactsQuery } from "../../../services/ContactService";
import {
  useCreateRentalOrderMutation,
  useGetRentalOrderByIdQuery,
  useGetRentalOrdersQuery,
  useUpdateRentalOrderMutation,
} from "../../../services/OrderService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../constants/constants";
import { useNavigate, useParams } from "react-router-dom";
import {
  calculateDiscountAmount,
  calculateProductRent,
} from "../../../services/utility_functions";

type ErrorType = {
  customer: boolean;
  event_address: boolean;
  event_pincode: boolean;
  remarks: boolean;
};

const initialErrorState = {
  customer: false,
  event_address: false,
  event_pincode: false,
  remarks: false,
};

const formatContacts = (
  contacts: ContactInfoType[]
): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact._id ?? "",
    value: contact.name,
  }));

const getNewOrderId = (orders: OrderInfo[]) => {
  let orderId = "RO-0001";
  const suffixes = orders.map((order) => {
    const match = order.order_id.match(/RO-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });

  const maxSuffix = Math.max(...suffixes);
  orderId = `RO-${String(maxSuffix + 1).padStart(4, "0")}`;
  return orderId;
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
    filter: "agTextColumnFilter",
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
    filter: "agNumberColumnFilter",
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
    filter: "agNumberColumnFilter",
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
    filter: "agNumberColumnFilter",
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
    filter: "agNumberColumnFilter",
    cellRenderer: (params: ICellRendererParams) => {
      const data = params.data as ProductDetails;
      return <p>₹ {calculateProductRent(data)}</p>;
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
  order_id: "",
  discount: 0,
  discount_amount: 0,
  gst: 10,
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
  const navigate = useNavigate();
  const { rentalId } = useParams();
  const [error, setErrors] = useState<ErrorType>(initialErrorState);

  const isAllOrdersAllowed: boolean = false;
  const { data: productsData, isSuccess: isProductsQuerySuccess } =
    useGetProductsQuery();
  const { data: contactsData, isSuccess: isContactsQuerySuccess } =
    useGetContactsQuery();
  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();
  const {
    data: existingRentalOrder,
    isSuccess: isRentalOrderQueryByIdSuccess,
  } = useGetRentalOrderByIdQuery(rentalId!, {
    skip: !rentalId,
  });
  const [updateProductData, { isSuccess: isUpdateProductSuccess }] =
    useUpdateProductMutation();
  const [
    createRentalOrder,
    {
      isSuccess: isRentalOrderCreateSuccess,
      isError: isRentalOrderCreateError,
    },
  ] = useCreateRentalOrderMutation();
  const [
    updateRentalOrder,
    {
      isSuccess: isRentalOrderUpdateSuccess,
      isError: isRentalOrderUpdateError,
    },
  ] = useUpdateRentalOrderMutation();

  const [orderInfo, setOrderInfo] =
    useState<RentalOrderInfo>(initialRentalProduct);

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
    in_date: dayjs().format("YYYY-MM-DDTHH:mm"),
    order_quantity: 0,
    order_repair_count: 0,
    out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
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

  const calculateTotalAmount = useCallback(() => {
    if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
      const total = orderInfo.product_details.reduce((sum, prod) => {
        return sum + calculateProductRent(prod);
      }, 0);

      return parseFloat(total.toFixed(2));
    }
    return 0;
  }, [orderInfo.product_details, orderInfo.type]);

  const calculateFinalAmount = useCallback(() => {
    const totalDeposit = depositData.reduce(
      (total, deposit) => total + deposit.amount,
      0
    );
    const finalAmount = calculateTotalAmount();
    const roundOff = orderInfo.round_off || 0;
    const discountAmount = calculateDiscountAmount(
      orderInfo.discount || 0,
      finalAmount
    );
    const gstAmount = calculateDiscountAmount(orderInfo.gst || 0, finalAmount);
    return parseFloat(
      (
        finalAmount -
        totalDeposit -
        discountAmount +
        gstAmount +
        roundOff
      ).toFixed(2)
    );
  }, [
    calculateTotalAmount,
    depositData,
    orderInfo.discount,
    orderInfo.gst,
    orderInfo.round_off,
  ]);

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
        in_date: dayjs().format("YYYY-MM-DDTHH:mm"),
        order_quantity: 0,
        order_repair_count: 0,
        out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
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

  const validateEventDetails = () => {
    const newErrors = initialErrorState;

    newErrors.customer = !orderInfo.customer._id;
    newErrors.event_address =
      !orderInfo.event_address || orderInfo.event_address.length > 100;
    newErrors.event_pincode = !/^\d{6}$/.test(orderInfo.event_pincode || "");

    if (orderInfo.remarks) {
      newErrors.remarks = orderInfo.remarks.length > 30;
    }
    setErrors(newErrors);
    return newErrors;
  };

  const createNewOrder = () => {
    orderInfo.deposits = depositData;
    const validationResult = validateEventDetails();

    const hasAnyError = Object.values(validationResult).some(
      (val) => val === true
    );
    console.log(hasAnyError);
    if (hasAnyError) return;

    if (rentalId) {
      updateRentalOrder(orderInfo);
      if (existingRentalOrder) {
        orderInfo.product_details.forEach((updatedProductDetail) => {
          const previousProductDetail =
            existingRentalOrder.product_details.find(
              (prev) => prev._id === updatedProductDetail._id
            );

          const previousQuantity = previousProductDetail?.order_quantity ?? 0;
          const previousRepair = previousProductDetail?.order_repair_count ?? 0;

          const quantityDelta =
            updatedProductDetail.order_quantity - previousQuantity;
          const repairDelta =
            updatedProductDetail.order_repair_count - previousRepair;

          // find the product in inventory
          const currentProduct = {
            ...products.find(
              (product) => product._id === updatedProductDetail._id
            )!,
          };

          // apply the delta
          currentProduct.available_stock -= quantityDelta;
          currentProduct.repair_count += repairDelta;

          updateProductData(currentProduct);
        });
      }
    } else {
      createRentalOrder(orderInfo);
      orderInfo.product_details.forEach((product_detail) => {
        const currentProduct = products.find(
          (product) => product._id === product_detail._id
        )!;
        currentProduct.available_stock -= product_detail.order_quantity;
        currentProduct.repair_count += product_detail.order_repair_count;
        updateProductData(currentProduct);
      });
      setOrderInfo(initialRentalProduct);
    }
  };

  useEffect(() => {
    if (isRentalOrderCreateSuccess && isUpdateProductSuccess) {
      toast.success("Rental Order Created Successfully", {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
      navigate("/orders");
    }
    if (isRentalOrderCreateError) {
      toast.error("Rental Order was not Created Successfully", {
        toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
      });
      navigate("/orders");
    }
  }, [
    isRentalOrderCreateError,
    isRentalOrderCreateSuccess,
    isUpdateProductSuccess,
    navigate,
  ]);

  useEffect(() => {
    if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
      const total_amount = calculateTotalAmount();

      // recalculate the discount_amount using the stored percentage
      const amount = parseFloat(
        ((orderInfo.discount / 100) * total_amount).toFixed(2)
      );

      setOrderInfo((prev) => ({
        ...prev,
        discount_amount: amount,
      }));
    }
  }, [
    orderInfo.product_details,
    orderInfo.type,
    orderInfo.discount,
    calculateTotalAmount,
  ]);

  useEffect(() => {
    if (isRentalOrderUpdateSuccess && isUpdateProductSuccess) {
      toast.success("Rental Order Updated Successfully", {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
      navigate("/orders");
    }
    if (isRentalOrderUpdateError) {
      toast.error(
        "Rental Order was not Updated Successfully. Please Try Again",
        {
          toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
        }
      );
      navigate("/orders");
    }
  }, [
    isRentalOrderUpdateError,
    isRentalOrderUpdateSuccess,
    isUpdateProductSuccess,
    navigate,
  ]);

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

  useEffect(() => {
    if (rentalId) {
      if (isRentalOrderQueryByIdSuccess) {
        setOrderInfo(existingRentalOrder);
        setDepositData(existingRentalOrder.deposits);
      }
    } else if (isRentalOrdersQuerySuccess) {
      const orderId = getNewOrderId(rentalOrders);
      handleValueChange("order_id", orderId);
    } else {
      handleValueChange("order_id", "RO-0001");
    }
  }, [
    existingRentalOrder,
    isRentalOrderQueryByIdSuccess,
    isRentalOrdersQuerySuccess,
    rentalId,
    rentalOrders,
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
          <p className="text-sm text-primary whitespace-nowrap mt-3">
            <InfoOutlinedIcon fontSize="small" className="text-blue-800" /> Add
            at least one product to proceed.
          </p>
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
      <div className="max-w-full overflow-x-hidden flex flex-col sm gap-2 max-h-full">
        {orderInfo.type === ProductType.RENTAL && (
          <>
            <div className="max-w-full flex flex-wrap justify-between items-start">
              <div className="flex max-lg:flex-wrap gap-3">
                <CustomInput
                  onChange={() => {}}
                  label="Order Id"
                  placeholder="Enter Order Id"
                  value={orderInfo?.order_id ?? ""}
                  disabled
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

              <div className="flex items-center gap-2 py-4 min-[1169px]:py-0">
                <p>Retail</p>
                <AntSwitch
                  checked={orderInfo.billing_mode === BillingMode.BUSINESS}
                  onChange={(e) => {
                    handleValueChange(
                      "billing_mode",
                      e.target.checked
                        ? BillingMode.BUSINESS
                        : BillingMode.RETAIL
                    );
                    handleValueChange("gst", e.target.checked ? 0 : 10);
                  }}
                />
                <p>Business</p>
              </div>
            </div>
          </>
        )}

        {/* === Customer + Rental Data === */}
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(20rem,_1fr))] gap-2  w-full">
          <CustomSelect
            label="Customer"
            labelClass="min-w-[5rem]"
            wrapperClass="min-w-[15rem] max-w-[20rem]"
            error={error.customer}
            helperText="Please select customer"
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
            <>
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
                onChange={(value) => handleValueChange("expected_date", value)}
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
            </>
          )}
        </div>
        {/* ===Event Data === */}
        <div className="grid grid-cols-1 md:grid-cols-2 justify-between">
          <div className="flex flex-col">
            <CustomInput
              wrapperClass="w-[30rem] max-w-full"
              labelClass="w-[5rem]"
              error={error.event_address}
              helperText="Address is required"
              value={orderInfo?.event_address ?? ""}
              onChange={(value) => handleValueChange("event_address", value)}
              label="Event Address"
              placeholder="Enter Event Address"
              multiline
              minRows={5}
            />
            <CustomInput
              wrapperClass="w-[30rem] max-w-full"
              labelClass="w-[5rem]"
              error={error.event_pincode}
              helperText="Pincode is required eg.600001"
              value={orderInfo?.event_pincode ?? ""}
              onChange={(value) => handleValueChange("event_pincode", value)}
              label="Event Pincode"
              placeholder="Enter Event Pincode"
            />
            <CustomInput
              value={orderInfo?.remarks ?? ""}
              onChange={(value) => handleValueChange("remarks", value)}
              label="Remarks"
              error={error.remarks}
              helperText="Remarks must be less than 30 length"
              wrapperClass="w-[30rem] max-w-full"
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
                      {orderInfo.billing_mode === BillingMode.RETAIL && (
                        <p>GST</p>
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
                      <p>₹ {calculateTotalAmount()}</p>
                      {orderInfo.billing_mode === BillingMode.RETAIL && (
                        <div className="flex justify-end gap-1">
                          <input
                            className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                            type="number"
                            value={orderInfo.gst}
                            onChange={(e) => {
                              if (
                                orderInfo.type === ProductType.RENTAL &&
                                orderInfo.product_details
                              ) {
                                const percent = parseFloat(
                                  parseFloat(e.target.value).toFixed(0)
                                );
                                setOrderInfo((prev) => ({
                                  ...prev,
                                  gst: percent,
                                }));
                              }
                            }}
                          />
                          <span className="w-2">%</span>
                        </div>
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
                              const percent = parseFloat(
                                parseFloat(e.target.value).toFixed(2)
                              );
                              const total_amount = calculateTotalAmount();
                              const discount_amount = parseFloat(
                                (total_amount * percent * 0.01).toFixed(2)
                              );
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
                              const amount = parseFloat(
                                parseFloat(e.target.value).toFixed(2)
                              );
                              const total_amount = calculateTotalAmount();
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
                              round_off: parseFloat(
                                parseFloat(e.target.value).toFixed(2)
                              ),
                            }))
                          }
                        />{" "}
                        ₹
                      </div>
                    </div>
                  </div>
                  {orderInfo.billing_mode === BillingMode.BUSINESS && (
                    <span className="text-[10px] w-full text-right text-gray-500">
                      GST and all other taxes included.
                    </span>
                  )}
                  <div className="grid grid-cols-2 border-t border-t-gray-200">
                    <div className="flex flex-col gap-1 font-semibold pb-2">
                      <p>{calculateFinalAmount() > 0 ? "Balance" : "Refund"}</p>
                      <p>Mode</p>
                    </div>
                    <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                      <p className="font-semibold text-black">
                        ₹ {Math.abs(calculateFinalAmount())}
                      </p>
                      <select
                        className="w-fit outline-none"
                        onChange={(e) =>
                          handleValueChange("payment_mode", e.target.value)
                        }
                        value={orderInfo.payment_mode}
                      >
                        {Object.entries(PaymentMode).map(([id, key]) => (
                          <option key={id} value={key.toLowerCase()}>
                            {key.toUpperCase()}
                          </option>
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
                    if (rentalId) {
                      navigate("/orders");
                    } else {
                      setDepositData([]);
                      setOrderInfo(initialRentalProduct);
                    }
                  }}
                  variant="outlined"
                />
                <CustomButton
                  label={rentalId ? "Update Order" : "Create Order"}
                  onClick={createNewOrder}
                />
              </div>
            </div>
          )}
      </div>

      <AddProductModal
        addProductOpen={addProductOpen}
        addProductToOrder={addProductToOrder}
        products={products.filter((prod) => {
          if (prod.available_stock <= 0) {
            return false;
          }
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
          productData={orderInfo.product_details}
          depositData={depositData}
          setDepositData={setDepositData}
        />
      )}
    </div>
  );
};

export default NewOrder;
