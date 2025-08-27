import { Box, Chip, Tab, Tabs } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  useLazyGetExpiredRentalOrdersQuery,
  useUpdateRentalOrderMutation,
} from "../../../services/OrderService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../constants/constants";
import { useNavigate, useParams } from "react-router-dom";
import {
  calculateDiscountAmount,
  calculateProductRent,
} from "../../../services/utility_functions";
import { useDispatch } from "react-redux";
import { setExpiredRentalOrders } from "../../../store/OrdersSlice";
import { getNewOrderId } from "../Summary/utils";

const formatContacts = (
  contacts: ContactInfoType[]
): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact._id ?? "",
    value: contact.name,
  }));

type ErrorType = {
  inDate: boolean;
  expectedDate: boolean;
};

const getCurrentFY = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month < 4 ? year - 1 : year;
  const endYear = startYear + 1;
  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
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
    minWidth: 200,
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
    minWidth: 120,
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
    minWidth: 120,
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
    minWidth: 120,
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
    minWidth: 120,
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
  billing_mode: BillingMode.B2C,
  status: PaymentStatus.PENDING,
  payment_mode: PaymentMode.CASH,
  out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
  expected_date: dayjs().add(10, "day").format("YYYY-MM-DDTHH:mm"),
  in_date: "",
  round_off: 0,
  customer: initialContactType,
  event_address: "",
  product_details: [],
  deposits: [],
  eway_amount: 0,
  eway_mode: PaymentMode.CASH,
  event_name: "",
  event_venue: "",
};

const NewOrder = () => {
  const navigate = useNavigate();
  const { rentalId } = useParams();
  const dispatch = useDispatch();

  const [triggerGetRentalOrder] = useLazyGetExpiredRentalOrdersQuery();
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

  const [createOrderDisabled, setCreateOrderDisabled] = useState<boolean>(true);
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
    duration: 1,
    rent_per_unit: 0,
    product_code: "",
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

  const [errors, setErrors] = useState<ErrorType>({
    expectedDate: false,
    inDate: false,
  });

  useEffect(() => {
    const hasErrors = Object.values(errors).find((error) => error === true);
    if (
      !orderInfo.customer._id ||
      orderInfo.product_details.length == 0 ||
      hasErrors
    ) {
      setCreateOrderDisabled(true);
    } else {
      setCreateOrderDisabled(false);
    }
  }, [errors, orderInfo]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (key: string, value: any) => {
    setOrderInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const calculateTotalAmount = useMemo(() => {
    if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
      let total = 0;
      if (orderInfo.billing_mode === BillingMode.B2C) {
        total = orderInfo.product_details.reduce((sum, prod) => {
          const rent_per_unit = calculateProductRent(prod);
          const exclusiveAmount = rent_per_unit / (1 + orderInfo.gst / 100);
          return sum + exclusiveAmount;
        }, 0);
      } else {
        total = orderInfo.product_details.reduce((sum, prod) => {
          return sum + calculateProductRent(prod);
        }, 0);
      }

      return parseFloat(total.toFixed(2));
    }
    return 0;
  }, [
    orderInfo.type,
    orderInfo.product_details,
    orderInfo.billing_mode,
    orderInfo.gst,
  ]);

  const calculateFinalAmount = useCallback(() => {
    const finalAmount = calculateTotalAmount;
    const roundOff = orderInfo.round_off || 0;
    const discountAmount = calculateDiscountAmount(
      orderInfo.discount || 0,
      finalAmount
    );
    const gstAmount = calculateDiscountAmount(
      orderInfo.gst || 0,
      finalAmount - discountAmount
    );
    return parseFloat(
      (finalAmount - discountAmount + gstAmount + roundOff).toFixed(2)
    );
  }, [
    calculateTotalAmount,
    orderInfo.discount,
    orderInfo.gst,
    orderInfo.round_off,
  ]);

  const calculateRentAfterGST = (rent: number, gst: number) => {
    if (orderInfo.billing_mode === BillingMode.B2C) {
      const exclusiveAmount = rent / (1 + gst / 100);
      return Math.round(exclusiveAmount * 100) / 100;
    } else {
      return rent;
    }
  };

  const addProductToOrder = (product: ProductDetails) => {
    if (orderInfo.type === ProductType.RENTAL) {
      const products = orderInfo.product_details || [];

      const alreadyAdded = products.some((p) => p._id === product._id);
      if (alreadyAdded) return;

      const newProducts = [...products, product];

      setOrderInfo({
        ...orderInfo,
        product_details: newProducts,
      });
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
        duration: 1,
        out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
        rent_per_unit: 0,
        product_code: "",
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

  const createNewOrder = async () => {
    const newOrderInfo = { ...orderInfo, deposits: depositData };
    if (rentalId) {
      updateRentalOrder(newOrderInfo);
      if (existingRentalOrder) {
        newOrderInfo.product_details.forEach((updatedProductDetail) => {
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
      try {
        // 1️⃣ Create the rental order and wait for it to succeed
        const orderResponse = await createRentalOrder(newOrderInfo).unwrap();
        console.log("✅ Order created successfully", orderResponse);

        // 2️⃣ Once order is created, update product stocks
        const results = await Promise.allSettled(
          newOrderInfo.product_details.map((product_detail) => {
            const currentProduct = products.find(
              (product) => product._id === product_detail._id
            );

            if (!currentProduct) {
              console.warn(
                `⚠️ Product ${product_detail._id} not found, skipping`
              );
              return Promise.resolve();
            }

            return updateProductData({
              ...currentProduct,
              available_stock:
                currentProduct.available_stock - product_detail.order_quantity,
              repair_count:
                currentProduct.repair_count + product_detail.order_repair_count,
            }).unwrap();
          })
        );

        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            console.log(
              `✅ Product ${newOrderInfo.product_details[idx]._id} updated successfully`
            );
          } else {
            console.error(
              `❌ Product ${newOrderInfo.product_details[idx]._id} update failed:`,
              result.reason
            );
          }
        });

        // 3️⃣ Finally, reset your form or order state
        setOrderInfo(initialRentalProduct);
      } catch (error) {
        console.error("❌ Failed to create rental order:", error);
        // optionally show user a toast or message
      }
    }
  };

  useEffect(() => {
    if (!rentalId) {
      setOrderInfo(initialRentalProduct);
      setDepositData([]);
    }
  }, [rentalId]);

  useEffect(() => {
    if (isRentalOrderCreateSuccess) {
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
    if (isRentalOrderUpdateSuccess) {
      toast.success("Rental Order Updated Successfully", {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
      const fetchExpiredOrders = async () => {
        const result = await triggerGetRentalOrder();
        if ("error" in result && result.error) {
          const error = result.error;

          if ("status" in error && error.status === 404) {
            dispatch(setExpiredRentalOrders([]));
          }
        } else if ("data" in result && result.data) {
          dispatch(setExpiredRentalOrders(result.data));
        }
      };

      fetchExpiredOrders();
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
    dispatch,
    isRentalOrderUpdateError,
    isRentalOrderUpdateSuccess,
    isUpdateProductSuccess,
    navigate,
    triggerGetRentalOrder,
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
      handleValueChange("order_id", `INV/${getCurrentFY()}/0001`);
    }
  }, [
    existingRentalOrder,
    isRentalOrderQueryByIdSuccess,
    isRentalOrdersQuerySuccess,
    rentalId,
    rentalOrders,
  ]);

  useEffect(() => {
    if (orderInfo && orderInfo.product_details.length > 0) {
      setOrderInfo((prev) => {
        const updatedProducts = prev.product_details.map((product) => ({
          ...product,
          rent_per_unit: product.rent_per_unit,
        }));
        return {
          ...prev,
          product_details: updatedProducts,
        };
      });
    }
  }, [orderInfo.gst, orderInfo.billing_mode]); // Dont add orderInfo Hereeeeee

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
        </div>
      </div>

      {/* === Order Info Form === */}
      <div className="max-w-full flex flex-col sm gap-2 max-h-full">
        {orderInfo.type === ProductType.RENTAL && (
          <>
            <div className="max-w-full flex flex-wrap justify-between items-start mr-4">
              <div className="flex max-lg:flex-wrap gap-14">
                <CustomInput
                  onChange={() => {}}
                  label="Order Id"
                  placeholder="Enter Order Id"
                  value={orderInfo?.order_id ?? ""}
                  disabled
                  className="min-w-[15.5rem] max-w-[35rem]"
                />

                <CustomSelect
                  label="Payment Status"
                  className="w-[15.5rem]"
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
                <p>B2C</p>
                <AntSwitch
                  checked={orderInfo.billing_mode === BillingMode.B2B}
                  onChange={(e) => {
                    handleValueChange(
                      "billing_mode",
                      e.target.checked ? BillingMode.B2B : BillingMode.B2C
                    );
                    handleValueChange("gst", e.target.checked ? 0 : 10);
                  }}
                />
                <p>B2B</p>
              </div>
            </div>
          </>
        )}

        {/* === Customer + Rental Data === */}
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(20rem,_1fr))] gap-2  w-full">
          <CustomSelect
            label="Customer"
            labelClass="min-w-[5rem]"
            wrapperClass="min-w-[16rem] max-w-[20rem]"
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
                error={errors.expectedDate}
                helperText="Expected date should be after Out Date"
                wrapperClass="w-[13rem]"
                onChange={(value) => {
                  if (dayjs(value).isBefore(dayjs(orderInfo.out_date))) {
                    setErrors((prev) => ({
                      ...prev,
                      expectedDate: true,
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      expectedDate: false,
                    }));
                  }
                  handleValueChange("expected_date", value);
                }}
                placeholder="Enter Expected Date"
              />

              <CustomDatePicker
                label="In Date"
                value={orderInfo.in_date ?? ""}
                error={errors.inDate}
                helperText="In Date must be after Out Date"
                className="w-fit"
                wrapperClass="w-[13rem]"
                onChange={(value) => {
                  if (dayjs(value).isBefore(dayjs(orderInfo.out_date))) {
                    setErrors((prev) => ({
                      ...prev,
                      inDate: true,
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      inDate: false,
                    }));
                  }
                  handleValueChange("in_date", value);
                }}
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
              value={orderInfo?.event_name ?? ""}
              onChange={(value) => handleValueChange("event_name", value)}
              label="Event Name"
              placeholder="Enter Event Name"
            />
            <CustomInput
              wrapperClass="w-[30rem] max-w-full"
              labelClass="w-[5rem]"
              value={orderInfo?.event_venue ?? ""}
              onChange={(value) => handleValueChange("event_venue", value)}
              label="Event Venue"
              placeholder="Enter Event Venue"
            />
            <CustomInput
              wrapperClass="w-[30rem] max-w-full"
              labelClass="w-[5rem]"
              value={orderInfo?.event_address ?? ""}
              onChange={(value) => handleValueChange("event_address", value)}
              label="Event Address"
              placeholder="Enter Event Address"
              multiline
              minRows={5}
            />
            {/* <CustomInput
              wrapperClass="w-[30rem] max-w-full"
              labelClass="w-[5rem]"
              value={orderInfo?.event_pincode ?? ""}
              onChange={(value) => handleValueChange("event_pincode", value)}
              label="Event Pincode"
              placeholder="Enter Event Pincode"
            /> */}
            <CustomInput
              value={orderInfo?.remarks ?? ""}
              onChange={(value) => handleValueChange("remarks", value)}
              label="Remarks"
              wrapperClass="w-[30rem] max-w-full"
              className="h-full"
              placeholder="Enter remarks"
              multiline
              minRows={3}
            />
          </div>
          <div className="pb-8 mx-2">
            <div className=" flex flex-wrap gap-2 border bg-gray-100 border-[#ced4da] content-start rounded-md w-full h-full overflow-hidden">
              <div className=" w-full p-2 justify-between flex">
                <p className="w-fit text-right content-center px-2 pt-1">
                  Products
                </p>
                <CustomButton
                  label="Add product"
                  onClick={() => setAddProductOpen(true)}
                />
              </div>
              <div className="flex flex-wrap gap-2 mx-2 mb-2 p-4 rounded-sm border border-gray-300 bg-white w-full h-[78%] max-h-full overflow-auto">
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
        </div>

        {/* === Order Summary === */}
        {orderInfo.type === ProductType.RENTAL && orderInfo.product_details && (
          <div className="w-full flex flex-col px-3">
            <p className="text-xl font-semibold">Order Summary</p>
            <CustomTable
              rowData={
                orderInfo.product_details?.map((product) => ({
                  ...product,
                  rent_per_unit: calculateRentAfterGST(
                    product.rent_per_unit,
                    orderInfo.gst
                  ),
                })) ?? []
              }
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
                    <p>Amount before Taxes</p>
                    <p>Discount</p>
                    <p>Discount Amount</p>
                    <p>GST</p>
                    <p>Round Off</p>
                    <p>Transport Amount</p>
                    <p>Transport Payment Mode</p>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-500 text-end">
                    <p>
                      ₹{" "}
                      {depositData.reduce(
                        (total, deposit) => total + deposit.amount,
                        0
                      )}
                    </p>
                    <p>₹ {calculateTotalAmount}</p>

                    <div className="flex justify-end gap-1">
                      <input
                        className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                        type="number"
                        max={100}
                        min={0}
                        value={orderInfo.discount}
                        onChange={(e) => {
                          if (
                            orderInfo.type === ProductType.RENTAL &&
                            orderInfo.product_details
                          ) {
                            let percent = parseFloat(
                              parseFloat(e.target.value).toFixed(2)
                            );
                            if (percent >= 100) {
                              percent = 100;
                            }
                            const total_amount = calculateTotalAmount;
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
                          const value = e.target.value || "0";
                          const amount = parseFloat(value) || 0;
                          const total_amount = calculateTotalAmount;
                          const percent =
                            total_amount > 0
                              ? parseFloat(
                                  ((amount * 100) / total_amount).toFixed(2)
                                )
                              : 0;

                          setOrderInfo((prev) => ({
                            ...prev,
                            discount: percent,
                            discount_amount: parseFloat(value),
                          }));
                        }}
                      />{" "}
                      ₹
                    </p>
                    <div className="flex justify-end gap-1">
                      <input
                        className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                        max={100}
                        min={0}
                        type="number"
                        value={orderInfo.gst}
                        onChange={(e) => {
                          if (
                            orderInfo.type === ProductType.RENTAL &&
                            orderInfo.product_details
                          ) {
                            let percent =
                              parseFloat(
                                parseFloat(e.target.value).toFixed(0)
                              ) || 0;
                            if (percent >= 100) {
                              percent = 100;
                            }

                            setOrderInfo((prev) => ({
                              ...prev,
                              gst: percent,
                            }));
                          }
                        }}
                      />
                      <span className="w-2">%</span>
                    </div>
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
                    <div>
                      <input
                        className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                        type="number"
                        value={orderInfo.eway_amount}
                        onChange={(e) =>
                          setOrderInfo((prev) => ({
                            ...prev,
                            eway_amount: parseFloat(
                              parseFloat(e.target.value).toFixed(2)
                            ),
                          }))
                        }
                      />{" "}
                      ₹
                    </div>
                    <div>
                      <select
                        className="w-fit outline-none"
                        onChange={(e) =>
                          handleValueChange("eway_mode", e.target.value)
                        }
                        value={orderInfo.eway_mode}
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
                <div className="grid grid-cols-2 border-t border-t-gray-200">
                  <div className="flex flex-col gap-1 font-semibold pb-2">
                    <p>Amount after Taxes</p>
                    <p>
                      {calculateFinalAmount() -
                        depositData.reduce(
                          (total, deposit) => total + deposit.amount,
                          0
                        ) >
                      0
                        ? "Balance"
                        : "Refund"}
                    </p>
                    <p>Mode</p>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                    <p>₹ {Math.abs(calculateFinalAmount())}</p>
                    <p className="font-semibold text-black">
                      ₹{" "}
                      {Math.abs(
                        calculateFinalAmount() -
                          depositData.reduce(
                            (total, deposit) => total + deposit.amount,
                            0
                          )
                      )}
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
                disabled={createOrderDisabled}
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
