import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { LuPlus } from 'react-icons/lu';
import { MdOutlineMail } from 'react-icons/md';
import { RiFileExcel2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import NewProductModal from '../../../components/NewProductModal.';
import { useGetProductCategoriesQuery, useGetUnitsQuery } from '../../../services/ApiService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import { CustomOptionProps } from '../../../styled/CustomAutoComplete';
import CustomButton from '../../../styled/CustomButton';
import { RentalOrderInfo, RentalOrderType } from '../../../types/order';
import AddContactModal from '../Customers/modals/AddContactModal';
import { transformIdNamePair } from '../utils';
import RentalOrderTable from './RentalOrderTable';
import { exportOrderToExcel } from './utils';

const transformRentalOrderData = (rentalOrders: RentalOrderInfo[]): RentalOrderType[] => {
  return rentalOrders.map((rentalOrder) => {
    if (!rentalOrder.customer) {
      return {
        ...rentalOrder,
        customer: {
          _id: '',
          name: '',
        },
      };
    }
    return {
      ...rentalOrder,
      customer: {
        _id: rentalOrder.customer._id,
        name: `${rentalOrder.customer.name}-${rentalOrder.customer.personal_number}`,
      },
    };
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);
  const { data: productCategoryData, isSuccess: isProductCategoryQuerySuccess } =
    useGetProductCategoriesQuery();
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();

  const { data: unitData, isSuccess: isUnitQuerySuccess } = useGetUnitsQuery();
  const [productCategories, setProductCategories] = useState<CustomOptionProps[]>([]);

  const isCommunicationsFeatureDone: boolean = false;

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
            onClick={() => {
              if (rentalOrderData) exportOrderToExcel(rentalOrderData as RentalOrderType[]);
            }}
            label="Export Orders"
            icon={<RiFileExcel2Line color="white" />}
          />
        </div>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="order type"
        >
          <Tab label="Rental" value={1} />
          {/* <Tab label="Sales" value={2} />
          <Tab label="Service" value={3} /> */}
        </Tabs>
      </Box>
      <div role="tabpanel" hidden={activeTab !== 1}>
        <RentalOrderTable rentalOrders={rentalOrders} />
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
