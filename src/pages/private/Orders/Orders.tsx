import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { LuPlus } from 'react-icons/lu';
import { MdOutlineMail } from 'react-icons/md';
import { RiFileExcel2Line } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NewProductModal from '../../../components/NewProductModal.';
import { useGetProductCategoriesQuery, useGetUnitsQuery } from '../../../services/ApiService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import { RootState } from '../../../store/store';
import { CustomOptionProps } from '../../../styled/CustomAutoComplete';
import CustomButton from '../../../styled/CustomButton';
import { RentalOrderType } from '../../../types/order';
import AddContactModal from '../Customers/modals/AddContactModal';
import { transformIdNamePair } from '../utils';
import RentalOrderTable from './RentalOrderTable';
import { calculateFinalAmount, exportOrderToExcel, transformRentalOrderData } from './utils';

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [customerId, setCustomerId] = useState<string>('');
  const [customerOutstanding, setCustomerOutstanding] = useState(0);
  const expiredRentalOrders = useSelector((state: RootState) => state.rentalOrder.data);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);
  const [viewChallans, setViewChallans] = useState(false);
  const { data: productCategoryData, isSuccess: isProductCategoryQuerySuccess } =
    useGetProductCategoriesQuery();
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();

  const { data: unitData, isSuccess: isUnitQuerySuccess } = useGetUnitsQuery();
  const [productCategories, setProductCategories] = useState<CustomOptionProps[]>([]);

  const isCommunicationsFeatureDone: boolean = false;

  const getCustomerOrderAmount = useCallback(
    (cusId: string) => {
      const customerOrders = transformRentalOrderData(
        expiredRentalOrders.filter((order) => order.customer && order.customer._id === cusId)
      );

      const amounts = customerOrders.map((order) => calculateFinalAmount(order));
      const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
      return {
        customerOrders,
        totalAmount,
      };
    },
    [expiredRentalOrders]
  );

  const [rentalOrders, setRentalOrders] = useState<RentalOrderType[]>([]);

  // const handleNewRentalOrder = async () => {
  //   if (isRentalOrdersQuerySuccess) {
  //     const orderId = getNewOrderId(rentalOrderData);
  //     const newOrderData = getDefaultRentalOrder(orderId);
  //     try {
  //       const orderResponse = await createRentalOrder(newOrderData).unwrap();
  //       toast.success("Rental Order Created Successfully", {
  //         toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
  //       });
  //       console.log("✅ Order created successfully", orderResponse);
  //     } catch {
  //       toast.error("Rental Order was not Created Successfully", {
  //         toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
  //       });
  //     }
  //   }
  // };

  useEffect(() => {
    if (customerId) {
      const { totalAmount } = getCustomerOrderAmount(customerId);
      setCustomerOutstanding(totalAmount);
    } else {
      setCustomerOutstanding(0);
    }
  }, [customerId, expiredRentalOrders, getCustomerOrderAmount]);

  useEffect(() => {
    if (isRentalOrdersQuerySuccess) {
      setRentalOrders(transformRentalOrderData(rentalOrderData));
    }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

  useEffect(() => {
    if (isUnitQuerySuccess)
      setProductUnits(() => {
        return transformIdNamePair(unitData);
      });
  }, [isUnitQuerySuccess, unitData]);

  useEffect(() => {
    if (isProductCategoryQuerySuccess) {
      setProductCategories(() => {
        return transformIdNamePair(productCategoryData);
      });
    }
  }, [isProductCategoryQuerySuccess, productCategoryData]);

  return (
    <div className="h-full flex gap-3 flex-col">
      {/* Header */}
      <div className="flex justify-between">
        <CustomButton
          onClick={() => navigate('/orders/rentals')}
          label="New Order"
          icon={<LuPlus color="white" />}
        />
        <div className="flex gap-3">
          {isCommunicationsFeatureDone && (
            <>
              <CustomButton
                onClick={() => console.log('whatsapp')}
                label="Whatsapp"
                icon={<FaWhatsapp color="white" />}
              />
              <CustomButton
                onClick={() => console.log('email')}
                label="Email"
                icon={<MdOutlineMail color="white" />}
              />
            </>
          )}
          <CustomButton
            onClick={() => setAddProductOpen(true)}
            label="Add Product"
            icon={<LuPlus color="white" />}
          />
          <CustomButton
            onClick={() => setAddContactOpen(true)}
            label="Add Customer"
            icon={<LuPlus color="white" />}
          />
          <CustomButton
            onClick={() => setViewChallans((prev) => !prev)}
            label="View Challan Status"
          />
          <CustomButton
            onClick={() => {
              if (rentalOrderData) exportOrderToExcel(rentalOrderData as RentalOrderType[]);
            }}
            label="Export Orders"
            icon={<RiFileExcel2Line color="white" />}
          />
        </div>
      </div>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="order type"
        >
          <Tab label="Rental" value={1} />
          {/* <Tab label="Sales" value={2} />
          <Tab label="Service" value={3} /> */}
        </Tabs>
        <Typography variant="body2" className="text-red-700 text-lg" sx={{ mt: 1, mb: 1, ml: 4 }}>
          {customerId &&
            (() => {
              return `Customer Outstanding Amount: ₹${customerOutstanding.toFixed(2)}`;
            })()}
        </Typography>
      </Box>
      <div role="tabpanel" hidden={activeTab !== 1}>
        <RentalOrderTable
          rentalOrders={rentalOrders}
          viewChallans={viewChallans}
          setSelectedCustomerId={(selectedId) => {
            setCustomerId(selectedId);
          }}
        />
      </div>
      {/* <div role="tabpanel" hidden={activeTab !== 2}>
        <SalesOrderTable rentalOrders={rentalOrders} />
      </div>
      <div role="tabpanel" hidden={activeTab !== 3}>
        <ServiceOrderTable rentalOrders={rentalOrders} />
      </div> */}
      <AddContactModal
        addContactOpen={addContactOpen}
        setAddContactOpen={(value: boolean) => setAddContactOpen(value)}
      />

      <NewProductModal
        addProductOpen={addProductOpen}
        productCategories={productCategories}
        productUnits={productUnits}
        key="New Product"
        setAddProductOpen={setAddProductOpen}
      />
    </div>
  );
};

export default Orders;
