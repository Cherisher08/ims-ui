import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Tab, Tabs } from '@mui/material';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../../constants/constants';
import { useGetProductsQuery, useUpdateProductMutation } from '../../../services/ApiService';
import { useGetContactsQuery } from '../../../services/ContactService';
import {
  useCreateRentalOrderMutation,
  useGetRentalOrderByIdQuery,
  useGetRentalOrdersQuery,
  useLazyGetExpiredRentalOrdersQuery,
  useUpdateRentalOrderMutation,
} from '../../../services/OrderService';
import { calculateDiscountAmount, calculateProductRent } from '../../../services/utility_functions';
import { setExpiredRentalOrders } from '../../../store/OrdersSlice';
import CustomAutoComplete from '../../../styled/CustomAutoComplete';
import CustomButton from '../../../styled/CustomButton';
import CustomDatePicker from '../../../styled/CustomDatePicker';
import CustomInput from '../../../styled/CustomInput';
import CustomSelect, { CustomSelectOptionProps } from '../../../styled/CustomSelect';
import AntSwitch from '../../../styled/CustomSwitch';
import {
  DiscountType,
  discountTypeValues,
  EventNameType,
  Product,
  ProductType,
} from '../../../types/common';
import { ContactInfoType, initialContactType } from '../../../types/contact';
import {
  BillingMode,
  // BillingUnit,
  DepositType,
  PaymentMode,
  PaymentStatus,
  RentalOrderInfo,
  RepaymentMode,
} from '../../../types/order';
import AddContactModal from '../Customers/modals/AddContactModal';
import {
  // billingUnitOptions,
  formatProducts,
  getDefaultDeposit,
  getDefaultProduct,
  getDuration,
  getNewOrderId,
  paymentModeOptions,
  repaymentModeOptions,
} from '../Orders/utils';

const formatContacts = (contacts: ContactInfoType[]): CustomSelectOptionProps[] =>
  contacts.map((contact) => ({
    id: contact._id ?? '',
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

const paymentStatusOptions = Object.entries(PaymentStatus).map(([key, value]) => ({
  id: key,
  value,
}));

const initialRentalProduct: RentalOrderInfo = {
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
  customer: initialContactType,
  event_address: '',
  product_details: [],
  deposits: [],
  eway_amount: 0,
  eway_mode: PaymentMode.CASH,
  balance_paid: 0,
  balance_paid_mode: PaymentMode.NULL,
  repay_amount: 0,
  balance_paid_date: '',
  repay_date: '',
  event_name: '',
  event_venue: '',
};

const NewOrder = () => {
  const navigate = useNavigate();
  const { rentalId } = useParams();
  const dispatch = useDispatch();

  const [triggerGetRentalOrder] = useLazyGetExpiredRentalOrdersQuery();
  const isAllOrdersAllowed: boolean = false;
  const { data: productsData, isSuccess: isProductsQuerySuccess } = useGetProductsQuery();
  const { data: contactsData, isSuccess: isContactsQuerySuccess } = useGetContactsQuery();
  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery();
  const { data: existingRentalOrder, isSuccess: isRentalOrderQueryByIdSuccess } =
    useGetRentalOrderByIdQuery(rentalId!, {
      skip: !rentalId,
    });
  const [updateProductData, { isSuccess: isUpdateProductSuccess }] = useUpdateProductMutation();
  const [
    createRentalOrder,
    { isSuccess: isRentalOrderCreateSuccess, isError: isRentalOrderCreateError },
  ] = useCreateRentalOrderMutation();
  const [
    updateRentalOrder,
    { isSuccess: isRentalOrderUpdateSuccess, isError: isRentalOrderUpdateError },
  ] = useUpdateRentalOrderMutation();

  const [createOrderDisabled, setCreateOrderDisabled] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<RentalOrderInfo>(initialRentalProduct);
  const [contacts, setContacts] = useState<ContactInfoType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [eventNameOptions, setEventNameOptions] = useState<CustomSelectOptionProps[]>([]);
  const [removedProducts, setRemovedProducts] = useState<Product[]>([]);

  const [depositData, setDepositData] = useState<DepositType[]>([
    {
      amount: 0,
      date: dayjs().format('YYYY-MM-DDTHH:mm'),
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
      (orderInfo.customer && !orderInfo.customer._id) ||
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
  }, [orderInfo.type, orderInfo.product_details, orderInfo.billing_mode, orderInfo.gst]);

  const calculateFinalAmount = useCallback(() => {
    const finalAmount = calculateTotalAmount;
    const roundOff = orderInfo.round_off || 0;
    const discountAmount =
      orderInfo.discount_type === DiscountType.PERCENT
        ? calculateDiscountAmount(orderInfo.discount || 0, finalAmount)
        : orderInfo.discount || 0;
    const gstAmount = calculateDiscountAmount(orderInfo.gst || 0, finalAmount - discountAmount);
    return parseFloat(
      (finalAmount - discountAmount + gstAmount + roundOff + orderInfo.eway_amount).toFixed(2)
    );
  }, [
    calculateTotalAmount,
    orderInfo.discount,
    orderInfo.discount_type,
    orderInfo.eway_amount,
    orderInfo.gst,
    orderInfo.round_off,
  ]);

  const removeOrderProduct = (id: string) => {
    if (orderInfo.type === ProductType.RENTAL) {
      const filteredProducts = (orderInfo.product_details || []).filter((prod) => prod._id !== id);

      const removedProduct = orderInfo.product_details.find((prod) => prod._id === id);

      if (removedProduct) {
        const removedProductData = products.find((prod) => prod._id === id);
        if (removedProductData) {
          const updatedProductData = {
            ...removedProductData,
            available_stock: removedProductData.available_stock + removedProduct.order_quantity,
          };

          const updatedProducts = products.map((prod) =>
            prod._id === id ? updatedProductData : prod
          );
          console.log(updatedProductData);
          setProducts(updatedProducts);
          setRemovedProducts((prev) => [...prev, updatedProductData]);
        }
      }

      setOrderInfo({
        ...orderInfo,
        product_details: filteredProducts,
      });
    }
  };

  const updateProductStock = (paymentStatus: PaymentStatus | undefined) => {
    const updatedProducts = orderInfo.product_details.map((updatedProductDetail) => {
      const currentProduct = {
        ...products.find((product) => product._id === updatedProductDetail._id)!,
      };
      if (paymentStatus === 'paid') {
        currentProduct.available_stock += updatedProductDetail.order_quantity;
      } else if (paymentStatus === 'pending') {
        currentProduct.available_stock -= updatedProductDetail.order_quantity;
      }
      return currentProduct;
    });
    setProducts(updatedProducts);
  };

  const createNewOrder = async () => {
    const newOrderInfo = { ...orderInfo, deposits: depositData };
    const productsInOrder = newOrderInfo.product_details;
    const product = productsInOrder.find((product) => product.order_quantity === 0);
    if (product) {
      // mes
      toast.error(`${product.name} has 0 quantity`);
      return;
    }
    if (rentalId) {
      updateRentalOrder(newOrderInfo);
      if (existingRentalOrder) {
        newOrderInfo.product_details.forEach((updatedProductDetail) => {
          // const previousProductDetail = existingRentalOrder.product_details.find(
          //   (prev) => prev._id === updatedProductDetail._id
          // );

          // const previousQuantity = previousProductDetail?.order_quantity ?? 0;
          // const previousRepair = previousProductDetail?.order_repair_count ?? 0;

          // const quantityDelta = updatedProductDetail.order_quantity - previousQuantity;
          // const repairDelta = updatedProductDetail.order_repair_count - previousRepair;

          // find the product in inventory

          const currentProduct = {
            ...products.find((product) => product._id === updatedProductDetail._id)!,
          };

          // apply the delta
          // currentProduct.available_stock -= quantityDelta;
          // currentProduct.repair_count += repairDelta;
          updateProductData(currentProduct);
        });

        removedProducts.forEach((updatedProductDetail) => {
          // const previousProductDetail = existingRentalOrder.product_details.find(
          //   (prev) => prev._id === updatedProductDetail._id
          // );

          // const previousQuantity = previousProductDetail?.order_quantity ?? 0;
          // const previousRepair = previousProductDetail?.order_repair_count ?? 0;

          // const quantityDelta = updatedProductDetail.order_quantity - previousQuantity;
          // const repairDelta = updatedProductDetail.order_repair_count - previousRepair;

          // find the product in inventory
          const currentProduct = {
            ...products.find((product) => product._id === updatedProductDetail._id)!,
          };

          // apply the delta
          // currentProduct.available_stock -= quantityDelta;
          // currentProduct.repair_count += repairDelta;
          updateProductData(currentProduct);
        });
      }
    } else {
      try {
        // 1️⃣ Create the rental order and wait for it to succeed
        const orderResponse = await createRentalOrder(newOrderInfo).unwrap();
        console.log('✅ Order created successfully', orderResponse);

        // 2️⃣ Once order is created, update product stocks
        const results = await Promise.allSettled(
          newOrderInfo.product_details.map((product_detail) => {
            const currentProduct = products.find((product) => product._id === product_detail._id);

            if (!currentProduct) {
              console.warn(`⚠️ Product ${product_detail._id} not found, skipping`);
              return Promise.resolve();
            }

            return updateProductData({
              ...currentProduct,
              available_stock: currentProduct.available_stock - product_detail.order_quantity,
              repair_count: currentProduct.repair_count + product_detail.order_repair_count,
            }).unwrap();
          })
        );

        results.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            console.log(`✅ Product ${newOrderInfo.product_details[idx]._id} updated successfully`);
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
        console.error('❌ Failed to create rental order:', error);
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
      toast.success('Rental Order Created Successfully', {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
      navigate('/orders');
    }
    if (isRentalOrderCreateError) {
      toast.error('Rental Order was not Created Successfully', {
        toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
      });
      navigate('/orders');
    }
  }, [isRentalOrderCreateError, isRentalOrderCreateSuccess, isUpdateProductSuccess, navigate]);

  useEffect(() => {
    if (isRentalOrderUpdateSuccess) {
      toast.success('Rental Order Updated Successfully', {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
      });
      const fetchExpiredOrders = async () => {
        const result = await triggerGetRentalOrder();
        if ('error' in result && result.error) {
          const error = result.error;

          if ('status' in error && error.status === 404) {
            dispatch(setExpiredRentalOrders([]));
          }
        } else if ('data' in result && result.data) {
          dispatch(setExpiredRentalOrders(result.data));
        }
      };

      fetchExpiredOrders();
      navigate('/orders');
    }
    if (isRentalOrderUpdateError) {
      toast.error('Rental Order was not Updated Successfully. Please Try Again', {
        toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
      });
      navigate('/orders');
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
  }, [contactsData, isContactsQuerySuccess, isProductsQuerySuccess, productsData]);

  useEffect(() => {
    if (rentalId) {
      if (isRentalOrderQueryByIdSuccess) {
        setOrderInfo(existingRentalOrder);
        setDepositData(existingRentalOrder.deposits);
      }
    } else if (isRentalOrdersQuerySuccess) {
      const orderId = getNewOrderId(rentalOrders);
      handleValueChange('order_id', orderId);
    } else {
      handleValueChange('order_id', `INV/${getCurrentFY()}/0001`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderInfo.gst, orderInfo.billing_mode]);

  useEffect(() => {
    const options: CustomSelectOptionProps[] = Object.values(EventNameType).map((val) => ({
      id: val,
      value: val,
    }));
    if (orderInfo.event_name && !options.find((val) => val.id === orderInfo.event_name)) {
      options.push({
        id: orderInfo.event_name,
        value: orderInfo.event_name,
      });
    }
    setEventNameOptions(options);
  }, [orderInfo.event_name]);

  const addEventNameOption = (value: string) => {
    if (!value) return;
    const newOption = {
      id: value,
      value: value,
    };
    if (eventNameOptions.length === 3) {
      setEventNameOptions((prev) => [...prev, newOption]);
    } else {
      const options = [...eventNameOptions];
      options[3] = newOption;
      setEventNameOptions(options);
    }
    handleValueChange('event_name', value);
  };

  const handlePaymentStatus = (type: 'balance_paid' | 'repay_amount', value: number) => {
    // Calculate the amount to be paid or received
    const amountDue = Math.abs(
      calculateFinalAmount() -
        orderInfo.deposits.reduce((total, deposit) => total + deposit.amount, 0)
    );

    // If paid/received amount equals the amount due, mark as Paid
    if (value === amountDue) {
      handleValueChange(type, value);
      handleValueChange('status', PaymentStatus.PAID);
    } else {
      handleValueChange(type, value);
      handleValueChange('status', PaymentStatus.PENDING);
    }
  };

  useEffect(() => {
    if (orderInfo.product_details.length > 0) {
      updateProductStock(orderInfo.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderInfo.status]);

  return (
    <div className="w-full flex flex-col ">
      {/* === Top Tabs and Add Button === */}
      <div className="w-full flex justify-between mb-4">
        {isAllOrdersAllowed ? (
          <Tabs
            value={orderInfo.type}
            onChange={(_, value) => handleValueChange('type', value)}
            sx={{ '& .MuiTabs-indicator': { display: 'none' } }}
          >
            {Object.values(ProductType).map((type) => (
              <Tab
                key={type}
                label={type.charAt(0) + type.slice(1).toLowerCase()}
                value={type}
                sx={{
                  backgroundColor: orderInfo.type === type ? '#002f53' : '',
                  color: orderInfo.type === type ? '#ffffff !important' : '',
                  fontWeight: orderInfo.type === type ? 'bold' : 'normal',
                }}
              />
            ))}
          </Tabs>
        ) : (
          <Box className="font-primary text-2xl font-bold w-full">Rental Order</Box>
        )}

        <div className="flex flex-col items-end">
          <CustomButton
            className="w-[6rem]"
            onClick={() => setAddContactOpen(true)}
            label="Add Customer"
            icon={<LuPlus color="white" />}
          />
          <p className="text-sm text-primary whitespace-nowrap mt-3">
            <InfoOutlinedIcon fontSize="small" className="text-blue-800" /> Add at least one product
            to proceed.
          </p>
        </div>
      </div>
      <div className="flex justify-between">
        <label className="underline text-xl font-bold">Details:</label>
        <div className="flex items-center gap-2 py-4 min-[1169px]:py-0">
          <p>B2C</p>
          <AntSwitch
            checked={orderInfo.billing_mode === BillingMode.B2B}
            onChange={(e) => {
              handleValueChange(
                'billing_mode',
                e.target.checked ? BillingMode.B2B : BillingMode.B2C
              );
              handleValueChange('gst', e.target.checked ? 0 : orderInfo.gst);
            }}
          />
          <p>B2B</p>
        </div>
      </div>

      {/* Basic Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {orderInfo.type === ProductType.RENTAL && (
          <CustomInput
            onChange={() => {}}
            label="Order Id"
            placeholder="Enter Order Id"
            value={orderInfo?.order_id ?? ''}
            disabled
          />
        )}
        <CustomAutoComplete
          options={contacts.map((contact) => ({
            id: contact.personal_number,
            value: contact.personal_number,
          }))}
          addNewValue={() => {}}
          placeholder=""
          createOption={false}
          value={
            contacts.find((cont) => cont?.personal_number === orderInfo?.customer?.personal_number)
              ?.personal_number || ''
          }
          label="Customer Mobile"
          onChange={(value) => {
            const contact = contacts.find((c) => c.personal_number === value);
            if (contact) {
              handleValueChange('customer', contact);
            } else {
              handleValueChange('customer', {
                ...initialContactType,
                personal_number: value,
              });
            }
          }}
        />
        <CustomAutoComplete
          addNewValue={() => setAddContactOpen(true)}
          placeholder=""
          createOption={true}
          label="Customer"
          options={formatContacts(contacts)}
          value={
            formatContacts(contacts).find((option) => option.id === orderInfo.customer?._id)
              ?.value ?? ''
          }
          onChange={(name) => {
            handleValueChange(
              'customer',
              contacts.find((option) => option.name === name)
            );
          }}
        />
        {orderInfo.type === ProductType.RENTAL && (
          <CustomSelect
            label="Payment Status"
            options={paymentStatusOptions}
            value={
              paymentStatusOptions.find((paymentStatus) => orderInfo.status === paymentStatus.value)
                ?.id ?? ''
            }
            onChange={(id) => {
              const status = paymentStatusOptions.find((option) => option.id === id)?.value;
              if (status === 'pending') {
                handleValueChange('repay_date', '');
                handleValueChange('payment_mode', RepaymentMode.NULL);
              }
              handleValueChange('status', status);
            }}
          />
        )}
        <CustomAutoComplete
          options={eventNameOptions}
          addNewValue={(val) => addEventNameOption(val)}
          createOption={true}
          value={orderInfo?.event_name ?? ''}
          onChange={(value) => handleValueChange('event_name', value)}
          label="Event Name"
          placeholder="Enter Event Name"
        />

        {ProductType.RENTAL === orderInfo.type && (
          <>
            <CustomDatePicker
              label="Event Start Date/Entry Date"
              value={orderInfo.out_date ?? ''}
              onChange={(value) => {
                handleValueChange('out_date', value);
                if (orderInfo.in_date) {
                  const duration = getDuration(value, orderInfo.in_date);
                  handleValueChange('rental_duration', duration);
                }
              }}
              placeholder="Enter Out Date"
            />

            <CustomDatePicker
              label="Bill Date/End Date"
              value={orderInfo.in_date ?? ''}
              error={errors.inDate}
              helperText="In Date must be after Out Date"
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
                const duration = getDuration(orderInfo.out_date, value);
                handleValueChange('rental_duration', duration);
                handleValueChange('in_date', value);
              }}
              placeholder="Enter In Date"
            />
          </>
        )}

        <CustomInput
          value={orderInfo?.rental_duration ?? ''}
          onChange={(value) => {
            handleValueChange('rental_duration', value);
          }}
          label="Event Expected Days"
          type="number"
          placeholder="Enter expected days"
        />

        <CustomInput
          value={orderInfo?.event_venue ?? ''}
          onChange={(value) => handleValueChange('event_venue', value)}
          label="Event Venue"
          placeholder="Enter Event Venue"
          multiline
          minRows={5}
        />
        <CustomInput
          value={orderInfo?.event_address ?? ''}
          onChange={(value) => handleValueChange('event_address', value)}
          label="Event Address"
          placeholder="Enter Event Address"
          multiline
          minRows={5}
        />
        <CustomInput
          onChange={(value) => {
            const contact = {
              ...(orderInfo.customer || {}),
              address: value,
            };
            handleValueChange('customer', contact);
          }}
          value={orderInfo.customer?.address || ''}
          label="Customer Address"
          placeholder="Customer Address"
          multiline
          minRows={5}
        />
        {/* <CustomInput
          value={orderInfo?.remarks ?? ""}
          onChange={(value) => handleValueChange("remarks", value)}
          label="Event Remarks"
          placeholder="Enter Remarks"
          multiline
          minRows={5}
        /> */}
      </div>

      {/* Products */}
      <div className="w-full h-fit flex flex-col">
        <div className="w-full flex justify-between my-2">
          <label className="text-xl font-bold underline">Products:</label>
          <CustomButton
            label="Add Product"
            disabled={
              orderInfo.product_details?.filter((current) => current._id === '').length > 0 || false
            }
            onClick={() => {
              const newProduct = getDefaultProduct(orderInfo?.out_date, orderInfo.in_date);
              setOrderInfo((prev) => ({
                ...prev,
                product_details: [...(prev.product_details || []), newProduct],
              }));
            }}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-1 py-1 text-left w-[15rem]">Product</th>
                <th className="px-1 py-1 text-left w-[8rem]">Product Unit</th>
                <th className="px-1 py-1 text-left w-[9rem]">Available Stock</th>
                <th className="px-1 py-1 text-left w-[6rem]">Order Quantity</th>
                <th className="px-1 py-1 text-left w-[11rem]">Out Date</th>
                <th className="px-1 py-1 text-left w-[11rem]">In Date</th>
                <th className="px-1 py-1 text-left w-[8rem]">Duration</th>
                <th className="px-1 py-1 text-left w-[8rem]">Order Repair Quantity</th>
                <th className="px-1 py-1 text-left w-[10rem]">Rent Per Unit</th>
                <th className="px-1 py-1 text-left w-[10rem]">Final Amount</th>
                <th className="px-1 py-1 text-left w-[20rem]">Damage</th>
                <th className="px-1 py-1 text-left w-[10rem]">Options</th>
              </tr>
            </thead>
            <tbody>
              {orderInfo.product_details.length > 0 ? (
                orderInfo.product_details?.map((product, index) => (
                  <tr key={product._id} className="border-b border-gray-200">
                    <td className="px-1 py-2 content-start">
                      <CustomAutoComplete
                        addNewValue={() => {}}
                        placeholder=""
                        createOption={false}
                        label=""
                        options={formatProducts(
                          products.filter(
                            (prod) =>
                              !orderInfo.product_details?.find(
                                (current) => current._id === prod._id && prod._id !== product._id
                              )
                          )
                        )}
                        className="w-[14rem]"
                        value={product.name}
                        onChange={(name) => {
                          const data = products.find((prod) => prod.name === name);
                          if (data) {
                            const newProducts = [...orderInfo.product_details];
                            newProducts[index] = {
                              ...product,
                              _id: data._id || '',
                              name: data?.name,
                              category: data?.category.name,
                              product_unit: data.unit,
                              rent_per_unit: data.rent_per_unit,
                              product_code: data.product_code,
                            };
                            if (removedProducts.find((prod) => prod._id === data._id)) {
                              setRemovedProducts((prev) =>
                                prev.filter((prod) => prod._id !== data._id)
                              );
                            }
                            setOrderInfo({
                              ...orderInfo,
                              product_details: newProducts,
                            });
                          }
                        }}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        label=""
                        placeholder=""
                        disabled
                        className="w-[7rem] p-2"
                        value={orderInfo.product_details[index].product_unit.name || ''}
                        onChange={() => {}}
                      />
                    </td>
                    {/* <td className="px-1 py-2 content-start">
                      <CustomSelect
                        label=""
                        className="w-[8rem]"
                        options={billingUnitOptions}
                        value={
                          billingUnitOptions.find(
                            (unit) => product.billing_unit === unit.value
                          )?.id || ""
                        }
                        onChange={(unit) => {
                          const currentUnit =
                            billingUnitOptions.find((ut) => ut.id === unit)
                              ?.value ?? BillingUnit.DAYS;
                          const newProducts = [...orderInfo.product_details];
                          const duration = calculateProductRent(
                            {
                              ...newProducts[index],
                              billing_unit: currentUnit,
                            },
                            true
                          );
                          newProducts[index] = {
                            ...product,
                            billing_unit: currentUnit,
                            duration: duration,
                          };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                      />
                    </td> */}
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        disabled
                        value={products.find((p) => p._id === product._id)?.available_stock || 0}
                        type="number"
                        className="w-[8rem] p-2"
                        onChange={() => {}}
                        label=""
                        placeholder=""
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        type="number"
                        label=""
                        placeholder=""
                        disabled={orderInfo.status === PaymentStatus.PAID}
                        className="w-[5rem] p-2"
                        value={orderInfo.product_details[index].order_quantity || 0}
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];

                          const newQuantity = Number(val);
                          const currentProduct = products.find((p) => p._id === product._id);

                          if (!currentProduct) return;

                          const available_stock = currentProduct.available_stock;
                          const prevQuantity = product.order_quantity;

                          // Calculate the difference
                          const diff = newQuantity - prevQuantity;

                          let finalQuantity = prevQuantity;
                          let finalStock = available_stock;

                          // If user is increasing quantity
                          if (diff > 0) {
                            // Only increase up to available stock
                            const increase = Math.min(diff, available_stock);
                            finalQuantity += increase;
                            finalStock -= increase;
                          }

                          // If user is decreasing quantity
                          if (diff < 0) {
                            const decrease = Math.abs(diff);
                            finalQuantity -= decrease;
                            finalStock += decrease; // return stock back
                          }

                          // Update products stock
                          setProducts((prev) =>
                            prev.map((p) =>
                              p._id === product._id ? { ...p, available_stock: finalStock } : p
                            )
                          );

                          // Update order info
                          newProducts[index] = {
                            ...product,
                            order_quantity: finalQuantity,
                          };

                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomDatePicker
                        label=""
                        value={
                          dayjs(orderInfo.product_details[index].out_date).format(
                            'DD-MMM-YYYY hh:mm A'
                          ) || ''
                        }
                        className="w-[15rem]"
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];
                          const duration = getDuration(val, newProducts[index].in_date);
                          newProducts[index] = {
                            ...product,
                            out_date: val,
                            duration: duration,
                          };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                        // format="DD/MM/YYYY"
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomDatePicker
                        label=""
                        value={
                          dayjs(orderInfo.product_details[index].in_date).format(
                            'DD-MMM-YYYY hh:mm A'
                          ) || ''
                        }
                        className="w-[15rem]"
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];
                          const duration = getDuration(newProducts[index].out_date, val);
                          newProducts[index] = {
                            ...product,
                            in_date: val,
                            duration: duration,
                          };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                        // format="DD/MM/YYYY"
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        type="number"
                        label=""
                        placeholder=""
                        className="w-[5rem] p-2"
                        value={orderInfo.product_details[index].duration || 0}
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];
                          newProducts[index] = {
                            ...product,
                            duration: Number(val),
                          };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        type="number"
                        label=""
                        placeholder=""
                        className="w-[8rem] p-2"
                        value={orderInfo.product_details[index].order_repair_count || 0}
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];
                          newProducts[index] = {
                            ...product,
                            order_repair_count:
                              Number(val) <= product.order_quantity
                                ? Number(val)
                                : product.order_quantity,
                          };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        type="number"
                        label=""
                        placeholder=""
                        className="w-[8rem] p-2"
                        value={product.rent_per_unit}
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];
                          newProducts[index] = {
                            ...product,
                            rent_per_unit: Number(val),
                          };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        disabled
                        type="number"
                        label=""
                        placeholder=""
                        className="w-[8rem] p-2"
                        value={product.rent_per_unit * product.order_quantity * product.duration}
                        onChange={() => {}}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <CustomInput
                        type="number"
                        label=""
                        placeholder=""
                        className="w-[20rem]"
                        multiline
                        minRows={1}
                        value={orderInfo.product_details[index].damage || ''}
                        onChange={(val) => {
                          const newProducts = [...orderInfo.product_details];
                          newProducts[index] = { ...product, damage: val };
                          setOrderInfo({
                            ...orderInfo,
                            product_details: newProducts,
                          });
                        }}
                      />
                    </td>
                    <td className="px-1 py-2 content-start">
                      <div className="flex gap-2">
                        <CustomButton
                          label="Remove"
                          onClick={() => removeOrderProduct(product._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
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
      </div>

      {/* Deposits */}
      <div className="w-full h-fit flex flex-col">
        <div className="w-full flex justify-between my-2">
          <label className="text-xl font-bold underline">Deposits:</label>
          <CustomButton
            label="Add Deposit"
            onClick={() => {
              const newDeposit = getDefaultDeposit(products);
              setDepositData((prev) => {
                if (prev) return [...prev, newDeposit];
                else return [newDeposit];
              });
            }}
          />
        </div>
        <table className="w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-1 py-1 text-left w-[15rem]">Amount</th>
              <th className="px-1 py-1 text-left w-[15rem]">Date</th>
              <th className="px-1 py-1 text-left w-[15rem]">Product</th>
              <th className="px-1 py-1 text-left w-[20rem]">Payment Mode</th>
              <th className="px-1 py-1 text-left w-[10rem]">Options</th>
            </tr>
          </thead>
          <tbody>
            {depositData.length > 0 ? (
              depositData.map((deposit, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-1 py-1">
                    <CustomInput
                      type="number"
                      label=""
                      placeholder=""
                      className="w-[14rem] p-2"
                      value={deposit.amount || 0}
                      onChange={(val) => {
                        const newDeposits = [...depositData];
                        newDeposits[index] = {
                          ...deposit,
                          amount: Number(val),
                        };
                        setDepositData(newDeposits);
                      }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <CustomDatePicker
                      label=""
                      placeholder=""
                      className="w-[14rem] p-2"
                      value={deposit.date}
                      onChange={(val) => {
                        const newDeposits = [...depositData];
                        newDeposits[index] = { ...deposit, date: val };
                        setDepositData(newDeposits);
                      }}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <CustomSelect
                      label=""
                      value={
                        formatProducts(products).find((prod) =>
                          deposit.product ? prod.id === deposit.product._id : false
                        )?.id ?? ''
                      }
                      options={formatProducts(orderInfo.product_details || [])}
                      onChange={(id) =>
                        setDepositData((prev) => {
                          const newDeposits = [...prev];
                          const product = products.find((prod) => prod._id === id) || null;
                          newDeposits[index] = { ...deposit, product: product };
                          return newDeposits;
                        })
                      }
                    />
                  </td>
                  <td className="px-1 py-1">
                    <CustomSelect
                      label=""
                      options={paymentModeOptions}
                      className="w-[14rem]"
                      value={
                        paymentModeOptions.find((mode) => deposit.mode === mode.value)?.id || ''
                      }
                      onChange={(mode) => {
                        const currentMode =
                          paymentModeOptions.find((md) => md.id === mode)?.value ??
                          PaymentMode.CASH;
                        const newDeposits = [...depositData];
                        newDeposits[index] = {
                          ...deposit,
                          mode: currentMode as PaymentMode,
                        };
                        setDepositData(newDeposits);
                      }}
                    />
                  </td>
                  <td>
                    <CustomButton
                      label="Delete"
                      icon=""
                      onClick={() => {
                        const newDeposits = depositData.filter((_, i) => i !== index);
                        setDepositData(newDeposits);
                      }}
                    ></CustomButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-[5rem] text-center py-4">
                  No Deposits Available...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-x-10 my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <CustomInput
            label="Transport"
            type="number"
            wrapperClass="w-full"
            placeholder="Enter Transport"
            value={orderInfo.eway_amount}
            onChange={(val) => {
              console.log(val);
              handleValueChange('eway_amount', parseInt(val));
            }}
          />
          <div className="flex items-end">
            <CustomSelect
              label=""
              className="w-full"
              options={paymentModeOptions}
              value={
                paymentModeOptions.find((mode) => orderInfo.eway_mode === mode.value)?.id || ''
              }
              onChange={(mode) => {
                const currentMode =
                  paymentModeOptions.find((md) => md.id === mode)?.value ?? PaymentMode.CASH;
                handleValueChange('eway_mode', currentMode);
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
            value={orderInfo.discount}
            onChange={(val) => {
              const value = val || '0';
              const amount = parseFloat(value) || 0;

              setOrderInfo((prev) => ({
                ...prev,
                discount: amount,
              }));
            }}
          />
          <CustomSelect
            label=""
            wrapperClass="mt-6"
            options={discountTypeValues}
            value={
              discountTypeValues.find((discountType) => orderInfo.discount_type === discountType.id)
                ?.id ?? discountTypeValues[0].id
            }
            onChange={(value) => handleValueChange('discount_type', value)}
          />
        </div>
        <div className="flex gap-2 col-span-2">
          <CustomInput
            label="Balance Paid"
            placeholder="Enter Balance Paid"
            wrapperClass="w-full"
            type="number"
            value={orderInfo.balance_paid}
            onChange={(val) => {
              handlePaymentStatus('balance_paid', Number(val));
            }}
          />
          <div className="flex items-end gap-2">
            <CustomDatePicker
              label=""
              value={dayjs(orderInfo.balance_paid_date).format('DD-MMM-YYYY') || ''}
              className="w-[11rem]"
              onChange={(val) => {
                handleValueChange('balance_paid_date', val);
              }}
              format="DD/MM/YYYY"
            />
            <CustomSelect
              label=""
              className="w-[8rem]"
              options={paymentModeOptions}
              value={
                paymentModeOptions.find((mode) => orderInfo.balance_paid_mode === mode.value)?.id ||
                ''
              }
              onChange={(mode) => {
                const currentMode =
                  paymentModeOptions.find((md) => md.id === mode)?.value ?? PaymentMode.CASH;
                handleValueChange('balance_paid_mode', currentMode);
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 col-span-2">
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
            value={dayjs(orderInfo.repay_date).format('DD-MMM-YYYY') || ''}
            // className="w-[11rem]"
            onChange={(val) => {
              if (!val && orderInfo.payment_mode === RepaymentMode.NULL) {
                console.log(`first`);
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
              className="w-[8rem]"
              options={repaymentModeOptions}
              value={
                repaymentModeOptions.find((mode) => orderInfo.payment_mode === mode.value)?.id || ''
              }
              onChange={(mode) => {
                const currentMode =
                  repaymentModeOptions.find((md) => md.id === mode)?.value ??
                  RepaymentMode.CASHLESS;
                if (currentMode === RepaymentMode.NULL && !orderInfo.repay_date) {
                  handleValueChange('status', PaymentStatus.PENDING);
                } else {
                  handleValueChange('status', PaymentStatus.PAID);
                }
                handleValueChange('payment_mode', currentMode);
              }}
            />
          </div>
        </div>
      </div>

      {/* === Order Info Form === */}
      <div className="max-w-full flex flex-col gap-2">
        {orderInfo.type === ProductType.RENTAL && orderInfo.product_details && (
          <div className="w-full flex flex-col px-3">
            <div className="flex justify-end w-full">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 text-gray-500">
                    <p>Deposit</p>
                    <p>Amount before Taxes</p>
                    <p>Discount</p>
                    <p>Transport</p>
                    <p>GST</p>
                    <p>Round Off</p>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-500 text-end">
                    <p>
                      ₹{' '}
                      {depositData.reduce((total, deposit) => total + deposit.amount, 0).toFixed(2)}
                    </p>
                    <p>₹ {calculateTotalAmount.toFixed(2)}</p>

                    <p>
                      {orderInfo.discount_type === DiscountType.PERCENT
                        ? `${orderInfo.discount}%`
                        : `₹ ${orderInfo.discount.toFixed(2)}`}
                    </p>
                    <p>{`₹ ${Number(orderInfo.eway_amount)?.toFixed(2)}`}</p>
                    <div className="flex justify-end gap-1">
                      <input
                        className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                        max={100}
                        min={0}
                        type="number"
                        value={orderInfo.gst}
                        onChange={(e) => {
                          if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
                            let percent = parseFloat(parseFloat(e.target.value).toFixed(0)) || 0;
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
                    <div className="flex pr-3 justify-end">
                      {'₹ '}
                      <input
                        className="w-[5rem] ml-1 bg-gray-200 border-b-2 text-right pr-2 outline-none"
                        type="number"
                        value={orderInfo.round_off}
                        onChange={(e) =>
                          setOrderInfo((prev) => ({
                            ...prev,
                            round_off: parseFloat(parseFloat(e.target.value).toFixed(2)),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-t border-t-gray-200">
                  <div className="flex flex-col gap-1 font-semibold pb-2">
                    <p>Amount after Taxes</p>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-500 items-end text-end pb-2">
                    <p>₹ {Math.abs(calculateFinalAmount()).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 my-3 justify-end">
              <CustomButton
                label="Cancel"
                onClick={() => {
                  if (rentalId) {
                    navigate('/orders');
                  } else {
                    setDepositData([]);
                    setOrderInfo(initialRentalProduct);
                  }
                }}
                variant="outlined"
              />
              <CustomButton
                label={rentalId ? 'Update Order' : 'Create Order'}
                disabled={createOrderDisabled}
                onClick={createNewOrder}
              />
            </div>
          </div>
        )}
      </div>
      <AddContactModal
        addContactOpen={addContactOpen}
        setAddContactOpen={(value: boolean) => setAddContactOpen(value)}
      />
    </div>
  );
};

export default NewOrder;
