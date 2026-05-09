import {
  Box,
  Tab,
  Tabs,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaWhatsapp } from 'react-icons/fa';
import { LuPlus } from 'react-icons/lu';
import { MdOutlineMail } from 'react-icons/md';
import { RiFileExcel2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import NewProductModal from '../../../components/NewProductModal.';
import { useGetProductCategoriesQuery, useGetUnitsQuery } from '../../../services/ApiService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import { CustomOptionProps } from '../../../styled/CustomAutoComplete';
import CustomButton from '../../../styled/CustomButton';
import { RentalOrderType } from '../../../types/order';
import { Branch, UserRole } from '../../../types/user';
import { RootState } from '../../../store/store';
import AddContactModal from '../Customers/modals/AddContactModal';
import { transformIdNamePair } from '../utils';
import RentalOrderTable from './RentalOrderTable';
import { exportOrderToExcel, transformRentalOrderData } from './utils';
import DisplaySettingsDialog from './modals/DisplaySettingsDialog';
import CustomSplitButton from '../../../styled/CustomSplitButton';
import { GridApi } from 'ag-grid-community';
import { addBranchFilterToArray } from '../../../utils/branchFilterUtils';

const getInitialSetting = <T,>(key: string, defaultValue: T): T => {
  const stored = sessionStorage.getItem(`orders_${key}`);
  if (stored !== null) {
    try {
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};


const Orders = () => {
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  const isAdmin = userData.role === UserRole.Admin;

  // Month and Year Filter State - declare early so it can be used in useState defaults
  const currentDate = dayjs();

  const [activeTab, setActiveTab] = useState(1);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);
  const [viewChallans, setViewChallans] = useState<boolean>(getInitialSetting('viewChallans', false));
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState<boolean>(false);
  const [showOnlyUnpaidOrders, setShowOnlyUnpaidOrders] = useState<boolean>(getInitialSetting('showOnlyUnpaidOrders', false));
  const [viewSelectiveOrders, setViewSelectiveOrders] = useState<boolean>(getInitialSetting('viewSelectiveOrders', true));
  const [showAllBranches, setShowAllBranches] = useState<boolean>(getInitialSetting('showAllBranches', false));

  const [selectedMonth, setSelectedMonth] = useState<number>(getInitialSetting('selectedMonth', currentDate.month()));
  const [selectedYear, setSelectedYear] = useState<number>(getInitialSetting('selectedYear', currentDate.year()));

  // Generate month options
  const monthOptions: CustomOptionProps[] = Array.from({ length: 12 }, (_, i) => ({
    id: i.toString(),
    value: i.toString(),
    description: dayjs().month(i).format('MMMM'),
  }));

  // Generate year options (current year and previous 2 years)
  const yearOptions: CustomOptionProps[] = Array.from({ length: 3 }, (_, i) => ({
    id: (currentDate.year() - i).toString(),
    value: (currentDate.year() - i).toString(),
    description: (currentDate.year() - i).toString(),
  }));

  const { data: productCategoryData, isSuccess: isProductCategoryQuerySuccess } =
    useGetProductCategoriesQuery();

  // Build start/end ISO strings for the selected month to filter by `out_date`
  const selectedStartDate = dayjs()
    .year(selectedYear)
    .month(selectedMonth)
    .startOf('month')
    .format('YYYY-MM-DDTHH:mm:ss');

  const selectedEndDate = dayjs()
    .year(selectedYear)
    .month(selectedMonth)
    .endOf('month')
    .format('YYYY-MM-DDTHH:mm:ss');

  // Build conditional filter based on view mode
  let filterArray: string[] = [];

  // If showing only unpaid orders, add status filter to exclude paid orders
  if (showOnlyUnpaidOrders) {
    filterArray.push('status:pending');
  }

  // If filtering by date range, add date filters
  if (viewSelectiveOrders) {
    filterArray.push(`out_date:gte:${selectedStartDate}`);
    filterArray.push(`out_date:lte:${selectedEndDate}`);
  }

  // Add branch filter (only applies if user is not admin or admin chooses to filter by branch)
  filterArray = addBranchFilterToArray(filterArray, userData.branch as Branch, showAllBranches);

  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery({
    filter: filterArray,
  });

  const { data: unitData, isSuccess: isUnitQuerySuccess } = useGetUnitsQuery();
  const [productCategories, setProductCategories] = useState<CustomOptionProps[]>([]);

  const isCommunicationsFeatureDone: boolean = false;

  // const getCustomerOrderAmount = useCallback(
  //   (cusId: string) => {
  //     const customerOrders = transformRentalOrderData(
  //       expiredRentalOrders.filter((order) => order.customer && order.customer._id === cusId)
  //     );

  //     const amounts = customerOrders.map((order) => calculateFinalAmount(order));
  //     const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
  //     return {
  //       customerOrders,
  //       totalAmount,
  //     };
  //   },
  //   [expiredRentalOrders]
  // );

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

  // useEffect(() => {
  //   if (customerId) {
  //     const { totalAmount } = getCustomerOrderAmount(customerId);
  //     setCustomerOutstanding(totalAmount);
  //   } else {
  //     setCustomerOutstanding(0);
  //   }
  // }, [customerId, expiredRentalOrders, getCustomerOrderAmount]);

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
          <CustomSplitButton
            onClick={() => {
              if (rentalOrderData) exportOrderToExcel(rentalOrderData as RentalOrderType[]);
            }}
            label="Export Orders"
            icon={<RiFileExcel2Line color="white" />}
            options={['All Orders', 'Filtered Orders']}
            onMenuItemClick={(index) => {
              try {
                if (index === 0) {
                  // All invoices
                  if (rentalOrderData && rentalOrderData.length > 0) {
                    exportOrderToExcel(rentalOrderData as RentalOrderType[]);
                  }
                } else if (index === 1) {
                  // Filtered invoices - collect filtered rows via gridApi
                  if (!gridApi) {
                    // fallback to all if grid not ready
                    if (rentalOrderData && rentalOrderData.length > 0)
                      exportOrderToExcel(rentalOrderData as RentalOrderType[]);
                    return;
                  }
                  const filtered: RentalOrderType[] = [];
                  gridApi.forEachNodeAfterFilter((node) => {
                    if (node && node.data) {
                      filtered.push(node.data as RentalOrderType);
                    }
                  });
                  if (filtered.length > 0) exportOrderToExcel(filtered);
                }
              } catch (err) {
                console.error('Failed to export invoices', err);
              }
            }}
          />
          <CustomButton
            onClick={() => {
              setDisplaySettingsOpen(true);
            }}
            label="Display Settings"
            icon={<LuPlus color="white" />}
          />
        </div>
      </div>

      <div className="flex justify-end"></div>

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
        {/* <Typography variant="body2" className="text-red-700 text-lg" sx={{ mt: 1, mb: 1, ml: 4 }}>
          {customerId &&
            (() => {
              return `Customer Outstanding Amount: ₹${customerOutstanding.toFixed(2)}`;
            })()}
        </Typography> */}
      </Box>
      <div role="tabpanel" hidden={activeTab !== 1}>
        <RentalOrderTable
          rentalOrders={rentalOrders}
          viewChallans={viewChallans}
          showOnlyUnpaidOrders={showOnlyUnpaidOrders}
          onGridReady={(api) => setGridApi(api)}
          // setSelectedCustomerId={(selectedId) => {
          //   setCustomerId(selectedId);
          // }}
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

      <DisplaySettingsDialog
        open={displaySettingsOpen}
        onClose={() => setDisplaySettingsOpen(false)}
        isAdmin={isAdmin}
        initialViewChallans={viewChallans}
        initialShowOnlyUnpaidOrders={showOnlyUnpaidOrders}
        initialViewSelectiveOrders={viewSelectiveOrders}
        initialSelectedMonth={selectedMonth}
        initialSelectedYear={selectedYear}
        initialShowAllBranches={showAllBranches}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        onSave={(settings) => {
          setViewChallans(settings.viewChallans);
          setShowOnlyUnpaidOrders(settings.showOnlyUnpaidOrders);
          setViewSelectiveOrders(settings.viewSelectiveOrders);
          setSelectedMonth(settings.selectedMonth);
          setSelectedYear(settings.selectedYear);
          setShowAllBranches(settings.showAllBranches);

          setDisplaySettingsOpen(false);
        }}
      />
    </div>
  );
};

export default Orders;
