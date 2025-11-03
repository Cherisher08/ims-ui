import { Alert, Checkbox, Modal } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../constants/constants';
import {
  calculateFinalAmount,
  extractOrder,
  formatProducts,
  getDuration,
  getLatestInvoiceId,
  getOrderStatus,
  getSplitOrderId,
  isValidOrder,
  paymentModeOptions,
  repaymentModeOptions,
  transportOptions,
} from '../pages/private/Orders/utils';
import { useLazyGetProductByIdQuery, useUpdateProductMutation } from '../services/ApiService';
import {
  useCreateRentalOrderMutation,
  useGetRentalOrdersQuery,
  useUpdateRentalOrderMutation,
} from '../services/OrderService';
import CustomButton from '../styled/CustomButton';
import CustomDatePicker from '../styled/CustomDatePicker';
import CustomInput from '../styled/CustomInput';
import CustomSelect from '../styled/CustomSelect';
import CustomSlider from '../styled/CustomSlider';
import { DiscountType, discountTypeValues, OrderStatusType, ProductType } from '../types/common';
import {
  BillingMode,
  DepositType,
  OrderInfo,
  PaymentMode,
  PaymentStatus,
  ProductDetails,
  RentalOrderInfo,
  RentalOrderType,
  RepaymentMode,
  TransportType,
} from '../types/order';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  orderInfo: RentalOrderInfo;
};

const initialRentalOrder: RentalOrderInfo = {
  order_id: '',
  discount: 0,
  discount_type: DiscountType.RUPEES,
  gst: 0,
  remarks: '',
  type: ProductType.RENTAL,
  billing_mode: BillingMode.B2C,
  status: PaymentStatus.PENDING,
  payment_mode: RepaymentMode.NULL,
  out_date: dayjs().format('YYYY-MM-DDTHH:mm'),
  rental_duration: 0,
  in_date: '',
  round_off: 0,
  customer: {
    _id: '',
    name: '',
    personal_number: '',
    office_number: '',
    gstin: '',
    email: '',
    address: '',
    pincode: '',
    company_name: '',
    address_proof: '',
  },
  event_address: '',
  product_details: [],
  deposits: [],
  eway_amount: 0,
  eway_mode: PaymentMode.CASH,
  eway_type: TransportType.NULL,
  balance_paid: 0,
  balance_paid_mode: PaymentMode.NULL,
  repay_amount: 0,
  balance_paid_date: '',
  repay_date: '',
  event_name: '',
  event_venue: '',
  invoice_id: '',
  invoice_date: '',
};

const SplitOrdermodal = ({ open, setOpen, orderInfo }: Props) => {
  const navigate = useNavigate();
  const [triggerGetProduct] = useLazyGetProductByIdQuery();
  const [updateProductData] = useUpdateProductMutation();
  const [newOrder, setNewOrder] = useState(initialRentalOrder);
  const { data: orders } = useGetRentalOrdersQuery();
  const [
    createRentalOrder,
    { isSuccess: isRentalOrderCreateSuccess, isError: isRentalOrderCreateError },
  ] = useCreateRentalOrderMutation();
  const [
    updateRentalOrder,
    { isSuccess: isRentalOrderUpdateSuccess, isError: isRentalOrderUpdateError },
  ] = useUpdateRentalOrderMutation();

  useEffect(() => {
    setNewOrder(() => ({
      ...orderInfo,
      customer: orderInfo.customer,
    }));
  }, [orderInfo]);

  useEffect(() => {
    if (isRentalOrderCreateSuccess) {
      toast.success('Rental Order Created Successfully', {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
    }
    if (isRentalOrderCreateError) {
      toast.error('Rental Order was not Created Successfully', {
        toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
      });
    }
  }, [isRentalOrderCreateError, isRentalOrderCreateSuccess]);

  useEffect(() => {
    if (isRentalOrderUpdateSuccess) {
      toast.success('Rental Order Updated Successfully', {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
    }
    if (isRentalOrderUpdateError) {
      toast.error('Rental Order was not Updated Successfully. Please Try Again', {
        toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
      });
    }
  }, [isRentalOrderUpdateError, isRentalOrderUpdateSuccess]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (key: string, value: any) => {
    setNewOrder((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreate = async () => {
    const oldOrder = extractOrder(orderInfo, newOrder);
    const validOldOrder = isValidOrder(oldOrder);
    const newInvoiceId = getLatestInvoiceId(orders as OrderInfo[]);
    const newOrderId = getSplitOrderId(orderInfo.order_id, orders as OrderInfo[]);
    const newOrderStatus = getOrderStatus(newOrder);

    if (newOrderStatus === OrderStatusType.PAID) {
      newOrder.status = PaymentStatus.PAID;
      newOrder.invoice_id = newInvoiceId;
      newOrder.invoice_date = new Date().toISOString();
      for (const product of newOrder.product_details) {
        const currentProductDetail = await triggerGetProduct(product._id).unwrap();
        const newQuantity = currentProductDetail.available_stock + product.order_quantity;
        await updateProductData({
          ...currentProductDetail,
          available_stock: newQuantity,
        }).unwrap();
      }
    } else {
      newOrder.status = PaymentStatus.PENDING;
    }

    if (validOldOrder) {
      delete newOrder._id;
      newOrder.order_id = newOrderId;

      const oldOrderId = getSplitOrderId(orderInfo.order_id, [
        ...(orders || []),
        newOrder,
      ] as OrderInfo[]);
      // const oldOrderStatus = getOrderStatus(oldOrder);
      oldOrder.order_id = oldOrderId;

      // if (oldOrderStatus === OrderStatusType.PAID) {

      //   oldOrder.status = PaymentStatus.PAID;

      //   for (const product of newOrder.product_details) {
      //     const currentProductDetail = await triggerGetProduct(product._id).unwrap();

      //     const newQuantity = getAvailableStockQuantity(
      //       currentProductDetail.available_stock,
      //       product,
      //       newOrder
      //     );

      //     await updateProductData({
      //       ...currentProductDetail,
      //       available_stock: newQuantity,
      //     }).unwrap();
      //   }
      // } else oldOrder.status = PaymentStatus.PENDING;
      updateRentalOrder(oldOrder);
      createRentalOrder(newOrder);
    } else {
      updateRentalOrder(newOrder);
    }
    navigate('/orders');
    // const latestOrders = await getRefetchRentalOrders();
    // const orderId = getNewOrderId(latestOrders.data || []);
    // console.log(orderId);
    // const orderResponse = await createRentalOrder({
    //   ...newOrder,
    //   order_id: orderId,
    // }).unwrap();
  };

  // const handlePaymentStatus = (type: 'balance_paid' | 'repay_amount', value: number) => {
  //   const amountDue = Math.abs(
  //     calculateTotalAmount(newOrder as RentalOrderType) -
  //       newOrder.deposits.reduce((total, deposit) => total + deposit.amount, 0)
  //   );

  //   if (value === amountDue) {
  //     handleValueChange(type, value);
  //     handleValueChange('status', PaymentStatus.PAID);
  //   } else {
  //     handleValueChange(type, value);
  //     handleValueChange('status', PaymentStatus.PENDING);
  //   }
  // };

  useEffect(() => {
    if (!newOrder.product_details || newOrder.product_details.length === 0) return;

    const inDates = newOrder.product_details
      .map((prod) => prod.in_date)
      .filter((date) => !!date)
      .map((date) => dayjs(date));

    if (inDates.length === 0) return;

    const latestInDate = inDates.reduce((latest, current) =>
      current.isAfter(latest) ? current : latest
    );

    if ((newOrder.in_date && dayjs(newOrder.in_date).isBefore(latestInDate)) || !newOrder.in_date) {
      setNewOrder((prev) => ({
        ...prev,
        in_date: latestInDate.format('YYYY-MM-DDTHH:mm'),
      }));
    }
  }, [newOrder.product_details, newOrder.in_date]);

  useEffect(() => {
    const amountDue =
      calculateFinalAmount(newOrder as RentalOrderType) -
      newOrder.deposits.reduce((total, deposit) => total + deposit.amount, 0);
    if (amountDue === 0 && newOrder.in_date) handleValueChange('status', PaymentStatus.PAID);
    else handleValueChange('status', PaymentStatus.PENDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrder.product_details, newOrder.balance_paid, newOrder.deposits, newOrder.in_date]);

  return (
    <div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex justify-center items-center overflow-x-auto"
      >
        <div className="flex flex-col gap-4 justify-center w-4/5 items-center max-h-4/5 overflow-y-auto bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">Create Sub-Order</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setOpen(false);
              }}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-auto overflow-x-auto flex flex-col gap-4">
            {/* Basic Details */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <CustomInput
                onChange={() => {}}
                label="Order Id"
                placeholder="Enter Order Id"
                value={newOrder.order_id}
                disabled
              />
              <CustomInput
                onChange={() => {}}
                label="Customer Number"
                placeholder="Enter Customer Number"
                value={newOrder.customer?.personal_number || ''}
                disabled
              />
              <CustomInput
                onChange={() => {}}
                label="Customer Name"
                placeholder="Enter Customer Name"
                value={newOrder.customer?.name || ''}
                disabled
              />

              {ProductType.RENTAL === newOrder.type && (
                <>
                  <CustomDatePicker
                    label="Event Start Date/Entry Date"
                    disabled={true}
                    labelClass="mb-1"
                    value={newOrder.out_date ?? ''}
                    onChange={(value) => {
                      handleValueChange('out_date', value);
                      if (newOrder?.in_date) {
                        const duration = getDuration(value, newOrder.in_date);
                        handleValueChange('rental_duration', duration);
                      }
                    }}
                    placeholder="Enter Out Date"
                  />

                  <CustomDatePicker
                    label="Bill Date/End Date"
                    value={newOrder.in_date ?? ''}
                    helperText="In Date must be after Out Date"
                    onChange={(value) => {
                      if (dayjs(value).isBefore(dayjs(newOrder.out_date))) {
                        value = newOrder.out_date;
                      }
                      const duration = getDuration(newOrder.out_date, value);
                      handleValueChange('rental_duration', duration);
                      handleValueChange('in_date', value);
                    }}
                    placeholder="Enter In Date"
                  />
                </>
              )}

              <CustomInput
                value={newOrder.rental_duration ?? ''}
                onChange={(value) => {
                  handleValueChange('rental_duration', value);
                }}
                label="Event Expected Days"
                type="number"
                placeholder="Enter expected days"
              />
              <CustomInput
                value={newOrder.remarks ?? ''}
                onChange={(value) => handleValueChange('remarks', value)}
                label="Event Remarks"
                wrapperClass="col-span-2"
                placeholder="Enter Remarks"
              />
            </div>

            {/* Products */}
            <div className="w-full overflow-x-auto min-h-fit">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-1 py-1 text-left w-[5rem]">
                      <Checkbox
                        checked={
                          newOrder.product_details.length === orderInfo.product_details.length
                        }
                        onChange={(e) => {
                          setNewOrder((prev) => {
                            let updatedProducts: ProductDetails[] = [];

                            if (e.target.checked) {
                              updatedProducts = orderInfo.product_details;
                            } else {
                              updatedProducts = [];
                            }

                            return {
                              ...prev,
                              product_details: updatedProducts,
                            };
                          });
                        }}
                      />
                    </th>
                    <th className="px-1 py-1 text-left w-[30rem]">Product</th>
                    <th className="px-1 py-1 text-left w-[11rem]">Out Date</th>
                    <th className="px-1 py-1 text-left w-[11rem]">In Date</th>
                    <th className="px-1 py-1 text-left w-[10rem]">Amount Per Unit</th>
                    <th className="px-1 py-1 text-left w-[10rem]">Final Amount</th>
                    <th className="px-1 py-1 text-left w-[6rem]">Order Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {orderInfo.product_details.length > 0 ? (
                    orderInfo.product_details.map((product: ProductDetails) => {
                      const selectedProduct = newOrder.product_details.find(
                        (p) => p._id === product._id
                      );

                      return (
                        <tr key={product._id} className="border-b border-gray-200">
                          {/* Checkbox */}
                          <td className="px-1 py-2 content-start">
                            <Checkbox
                              checked={!!selectedProduct}
                              onChange={(e) => {
                                setNewOrder((prev) => {
                                  let updatedProducts: ProductDetails[] = [];

                                  if (e.target.checked) {
                                    updatedProducts = [
                                      ...prev.product_details,
                                      { ...product, order_quantity: 0 },
                                    ].filter(
                                      (p, i, arr) => arr.findIndex((x) => x._id === p._id) === i
                                    );
                                  } else {
                                    updatedProducts = prev.product_details.filter(
                                      (p) => p._id !== product._id
                                    );
                                  }

                                  return {
                                    ...prev,
                                    product_details: updatedProducts,
                                  };
                                });
                              }}
                            />
                          </td>

                          {/* Product Name */}
                          <td className="px-1 py-2 content-start">
                            <CustomInput
                              label=""
                              placeholder=""
                              disabled
                              value={product.name || ''}
                              onChange={() => {}}
                            />
                          </td>

                          {/* Out Date */}
                          <td className="px-1 py-2 content-start">
                            <CustomDatePicker
                              label=""
                              value={
                                product.out_date
                                  ? dayjs(product.out_date).format('DD-MMM-YYYY hh:mm A')
                                  : ''
                              }
                              disabled={!selectedProduct || product.type !== ProductType.RENTAL}
                              className="w-[15rem]"
                              onChange={(val) => {
                                setNewOrder((prev) => {
                                  const updatedProducts = prev.product_details.map((p) =>
                                    p._id === product._id
                                      ? {
                                          ...p,
                                          out_date: val,
                                          duration: getDuration(val, p.in_date),
                                        }
                                      : p
                                  );
                                  return { ...prev, product_details: updatedProducts };
                                });
                              }}
                            />
                          </td>

                          {/* In Date */}
                          <td className="px-1 py-2 content-start">
                            <CustomDatePicker
                              label=""
                              value={
                                selectedProduct?.in_date
                                  ? dayjs(selectedProduct.in_date).format('DD-MMM-YYYY hh:mm A')
                                  : ''
                              }
                              disabled={!selectedProduct}
                              className="w-[15rem]"
                              onChange={(val) => {
                                setNewOrder((prev) => {
                                  const updatedProducts = prev.product_details.map((p) => {
                                    if (p._id === product._id) {
                                      const safeInDate =
                                        val && dayjs(val).diff(p.out_date) < 0 ? p.out_date : val;
                                      return {
                                        ...p,
                                        in_date: safeInDate,
                                        duration: safeInDate
                                          ? getDuration(p.out_date, safeInDate)
                                          : 1,
                                      };
                                    }
                                    return p;
                                  });
                                  return { ...prev, product_details: updatedProducts };
                                });
                              }}
                            />
                          </td>

                          {/* Rent Per Unit */}
                          <td className="px-1 py-2 content-start">
                            <CustomInput
                              type="number"
                              label=""
                              placeholder=""
                              className="w-[8rem] p-2"
                              disabled={!selectedProduct}
                              value={selectedProduct?.rent_per_unit || product.rent_per_unit}
                              onChange={(val) => {
                                setNewOrder((prev) => {
                                  const updatedProducts = prev.product_details.map((p) =>
                                    p._id === product._id ? { ...p, rent_per_unit: Number(val) } : p
                                  );
                                  return { ...prev, product_details: updatedProducts };
                                });
                              }}
                            />
                          </td>

                          {/* Total Rent */}
                          <td className="px-1 py-2 content-start">
                            <CustomInput
                              disabled
                              type="number"
                              label=""
                              placeholder=""
                              className="w-[8rem] p-2"
                              value={
                                (selectedProduct?.rent_per_unit || 0) *
                                (selectedProduct?.order_quantity || 0) *
                                (selectedProduct?.duration || 0)
                              }
                              onChange={() => {}}
                            />
                          </td>

                          {/* Quantity Slider */}
                          <td className="px-1 py-2 content-start">
                            <CustomSlider
                              hideLabel
                              value={selectedProduct?.order_quantity || 0}
                              max={product.order_quantity}
                              setValue={(val) => {
                                setNewOrder((prev) => {
                                  const updatedProducts = prev.product_details.map((p) =>
                                    p._id === product._id ? { ...p, order_quantity: val } : p
                                  );
                                  return { ...prev, product_details: updatedProducts };
                                });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={12} className="h-[5rem] text-center py-4">
                        No Products Available...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Deposits */}
            <div className="w-full overflow-x-auto min-h-fit">
              <table className="w-full table-auto border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-1 py-1 text-left w-[3rem]">
                      <Checkbox
                        checked={newOrder.deposits.length === orderInfo.deposits.length}
                        onChange={(e) => {
                          setNewOrder((prev) => {
                            let updatedDeposits: DepositType[] = [];

                            if (e.target.checked) {
                              updatedDeposits = orderInfo.deposits;
                            } else {
                              updatedDeposits = [];
                            }

                            return {
                              ...prev,
                              deposits: updatedDeposits,
                            };
                          });
                        }}
                      />
                    </th>
                    <th className="px-1 py-1 text-left w-[15rem]">Amount</th>
                    <th className="px-1 py-1 text-left w-[15rem]">Date</th>
                    <th className="px-1 py-1 text-left w-[15rem]">Product</th>
                    <th className="px-1 py-1 text-left w-[20rem]">Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {orderInfo.deposits.length > 0 ? (
                    orderInfo.deposits.map((deposit) => {
                      const existingDeposit = newOrder.deposits.find((d) => d._id === deposit._id);
                      const isChecked = !!existingDeposit;

                      return (
                        <tr key={deposit._id} className="border-b border-gray-200">
                          <td className="px-1 py-2 content-start">
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) => {
                                setNewOrder((prev) => {
                                  const updatedDeposits = e.target.checked
                                    ? [
                                        ...prev.deposits,
                                        {
                                          ...deposit,
                                          amount: deposit.amount ?? 0,
                                          date: deposit.date ?? '',
                                          product: deposit.product,
                                          mode: deposit.mode,
                                        },
                                      ].filter(
                                        (d, idx, arr) =>
                                          arr.findIndex((x) => x._id === d._id) === idx
                                      ) // avoid duplicates
                                    : prev.deposits.filter((d) => d._id !== deposit._id);

                                  return { ...prev, deposits: updatedDeposits };
                                });
                              }}
                            />
                          </td>

                          <td className="px-1 py-1">
                            <CustomInput
                              label=""
                              placeholder=""
                              type="number"
                              className="w-[14rem] p-2"
                              disabled={!isChecked}
                              value={isChecked ? existingDeposit?.amount : deposit.amount}
                              onChange={(val) => {
                                if (!isChecked) return;
                                const numVal = Number(val);
                                setNewOrder((prev) => ({
                                  ...prev,
                                  deposits: prev.deposits.map((d) =>
                                    d._id === deposit._id
                                      ? {
                                          ...d,
                                          amount: Math.max(0, Math.min(numVal, deposit.amount)),
                                        }
                                      : d
                                  ),
                                }));
                              }}
                            />
                          </td>

                          <td className="px-1 py-1">
                            <CustomDatePicker
                              label=""
                              disabled={!isChecked}
                              value={isChecked ? existingDeposit?.date || '' : deposit.date || ''}
                              onChange={(val) => {
                                if (!isChecked) return;
                                setNewOrder((prev) => ({
                                  ...prev,
                                  deposits: prev.deposits.map((d) =>
                                    d._id === deposit._id ? { ...d, date: val } : d
                                  ),
                                }));
                              }}
                            />
                          </td>

                          <td className="px-1 py-1">
                            <CustomSelect
                              label=""
                              disabled={!isChecked}
                              value={
                                (isChecked
                                  ? existingDeposit?.product?._id
                                  : deposit.product?._id) || ''
                              }
                              options={formatProducts(newOrder.product_details)}
                              onChange={(id) => {
                                if (!isChecked) return;
                                const product =
                                  newOrder.product_details.find((p) => p._id === id) || null;
                                setNewOrder((prev) => ({
                                  ...prev,
                                  deposits: prev.deposits.map((d) =>
                                    d._id === deposit._id ? { ...d, product } : d
                                  ),
                                }));
                              }}
                            />
                          </td>

                          <td className="px-1 py-1">
                            <CustomSelect
                              label=""
                              disabled={!isChecked}
                              value={
                                paymentModeOptions.find(
                                  (mode) =>
                                    (isChecked ? existingDeposit?.mode : deposit.mode) ===
                                    mode.value
                                )?.id || ''
                              }
                              options={paymentModeOptions}
                              onChange={(selectedId) => {
                                if (!isChecked) return;
                                const modeValue =
                                  paymentModeOptions.find((m) => m.id === selectedId)?.value ??
                                  deposit.mode;

                                setNewOrder((prev) => ({
                                  ...prev,
                                  deposits: prev.deposits.map((d) =>
                                    d._id === deposit._id ? { ...d, mode: modeValue } : d
                                  ),
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="h-[5rem] text-center py-4">
                        No Deposits Available...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1  lg:grid-cols-2 gap-x-10 my-4">
              <div className="grid grid-cols-[3fr_1fr] gap-2">
                <CustomInput
                  label="Transport"
                  type="number"
                  wrapperClass="w-full"
                  placeholder="Enter Transport"
                  value={newOrder.eway_amount}
                  onChange={(val) => {
                    handleValueChange('eway_amount', Number(val));
                  }}
                />
                <div className="flex items-end gap-2">
                  <CustomSelect
                    label=""
                    className="w-full min-w-[10rem]"
                    options={paymentModeOptions}
                    value={
                      paymentModeOptions.find((mode) => newOrder.eway_mode === mode.value)?.id || ''
                    }
                    onChange={(mode) => {
                      const currentMode =
                        paymentModeOptions.find((md) => md.id === mode)?.value ?? PaymentMode.CASH;
                      handleValueChange('eway_mode', currentMode);
                    }}
                  />
                  <CustomSelect
                    label=""
                    className="w-full min-w-[10rem]"
                    options={transportOptions}
                    value={
                      transportOptions.find((mode) => newOrder.eway_type === mode.value)?.id || ''
                    }
                    onChange={(mode) => {
                      const currentMode =
                        transportOptions.find((md) => md.id === mode)?.value ?? TransportType.NULL;
                      handleValueChange('eway_type', currentMode);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Discount"
                  type="number"
                  wrapperClass="w-full"
                  placeholder="Enter Discount"
                  value={newOrder.discount}
                  onChange={(val) => {
                    const amount = val === '' ? 0 : parseFloat(val);
                    setNewOrder((prev) => ({
                      ...prev,
                      discount: amount,
                    }));
                  }}
                />
                <CustomSelect
                  label=""
                  wrapperClass="mt-6"
                  className="w-full min-w-[10rem]"
                  options={discountTypeValues}
                  value={
                    discountTypeValues.find(
                      (discountType) => newOrder.discount_type === discountType.id
                    )?.id ?? discountTypeValues[0].id
                  }
                  onChange={(value) => handleValueChange('discount_type', value)}
                />
              </div>
              <div className="flex flex-row gap-2">
                <CustomInput
                  label="Balance Paid"
                  placeholder="Enter Balance Paid"
                  wrapperClass="w-full"
                  type="number"
                  value={newOrder.balance_paid}
                  onChange={(value) => {
                    handleValueChange('balance_paid', Number(value));
                    // handlePaymentStatus('balance_paid', Number(val));
                  }}
                />
                <div className="flex items-end gap-2">
                  <CustomDatePicker
                    label=""
                    value={dayjs(newOrder.balance_paid_date).format('DD-MMM-YYYY') || ''}
                    className="w-[11rem]"
                    onChange={(val) => {
                      handleValueChange('balance_paid_date', val);
                    }}
                    format="DD/MM/YYYY"
                  />
                  <CustomSelect
                    label=""
                    className="w-full min-w-[10rem]"
                    options={paymentModeOptions}
                    value={
                      paymentModeOptions.find((mode) => newOrder.balance_paid_mode === mode.value)
                        ?.id || ''
                    }
                    onChange={(mode) => {
                      const currentMode =
                        paymentModeOptions.find((md) => md.id === mode)?.value ?? PaymentMode.CASH;
                      handleValueChange('balance_paid_mode', currentMode);
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-[3fr_1fr] gap-2">
                {/* <CustomInput
            label="Repay Amount"
            wrapperClass="w-full"
            placeholder="Enter Repay Amount"
            type="number"
            value={orderInfo.repay_amount}
            onChange={(val) => {
              handlePaymentStatus("repay_amount", Number(val));
            }}
          /> */}
                <CustomDatePicker
                  label="Repayment Details"
                  value={dayjs(newOrder.repay_date).format('DD-MMM-YYYY') || ''}
                  // className="w-[11rem]"
                  onChange={(val) => {
                    if (!val && newOrder.payment_mode === RepaymentMode.NULL) {
                      handleValueChange('status', PaymentStatus.PENDING);
                    } else {
                      handleValueChange('status', PaymentStatus.PAID);
                    }
                    handleValueChange('repay_date', val);
                  }}
                  format="DD/MM/YYYY"
                />
                <div className="flex items-end gap-2">
                  <CustomSelect
                    label=""
                    // className="w-[8rem]"
                    options={repaymentModeOptions}
                    value={
                      repaymentModeOptions.find((mode) => newOrder.payment_mode === mode.value)
                        ?.id || ''
                    }
                    onChange={(mode) => {
                      const currentMode =
                        repaymentModeOptions.find((md) => md.id === mode)?.value ??
                        RepaymentMode.CASHLESS;
                      if (currentMode === RepaymentMode.NULL && !newOrder.repay_date) {
                        handleValueChange('status', PaymentStatus.PENDING);
                      } else {
                        handleValueChange('status', PaymentStatus.PAID);
                      }
                      handleValueChange('payment_mode', currentMode);
                    }}
                  />
                </div>
              </div>
              <div></div>
              <div className="grid grid-cols-2 pt-4">
                <div className="flex flex-col gap-1 font-semibold pb-2">
                  <p>Balance Amount</p>
                </div>
                <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                  <p>
                    ₹{' '}
                    {Math.max(
                      0,
                      calculateFinalAmount(newOrder as RentalOrderType) -
                        newOrder.deposits.reduce((total, deposit) => total + deposit.amount, 0)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <div></div>
              <div className="grid grid-cols-2">
                <div className="flex flex-col gap-1 font-semibold pb-2">
                  <p>Order Status</p>
                </div>
                <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                  <p>{getOrderStatus(newOrder)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between w-full items-center">
            <Alert severity="warning" className="h-fit">
              Changes here will affect the original order
            </Alert>
            <div className="flex gap-4 my-3 ">
              <CustomButton label="Cancel" onClick={() => setOpen(false)} variant="outlined" />
              <CustomButton
                label="Create"
                disabled={
                  (newOrder.product_details.length === 0 || !newOrder.eway_amount) &&
                  getOrderStatus(newOrder) !== OrderStatusType.PAID
                }
                onClick={handleCreate}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SplitOrdermodal;
