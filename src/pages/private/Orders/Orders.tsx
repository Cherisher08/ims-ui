import {
  Box,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useEffect, useState } from 'react';
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
import AddContactModal from '../Customers/modals/AddContactModal';
import { transformIdNamePair } from '../utils';
import RentalOrderTable from './RentalOrderTable';
import { exportOrderToExcel, transformRentalOrderData } from './utils';
import CustomSplitButton from '../../../styled/CustomSplitButton';
import { GridApi } from 'ag-grid-community';

const Orders = () => {
  const navigate = useNavigate();

  // Month and Year Filter State - declare early so it can be used in useState defaults
  const currentDate = dayjs();

  const [activeTab, setActiveTab] = useState(1);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);
  const [viewChallans, setViewChallans] = useState(false);
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState<boolean>(false);
  const [showOnlyUnpaidOrders, setShowOnlyUnpaidOrders] = useState<boolean>(false);
  const [viewSelectiveOrders, setViewSelectiveOrders] = useState<boolean>(true);

  // Pending settings (before Save is clicked)
  const [pendingViewChallans, setPendingViewChallans] = useState<boolean>(viewChallans);
  const [pendingShowOnlyUnpaidOrders, setPendingShowOnlyUnpaidOrders] =
    useState<boolean>(showOnlyUnpaidOrders);
  const [pendingViewSelectiveOrders, setPendingViewSelectiveOrders] =
    useState<boolean>(viewSelectiveOrders);
  const [pendingSelectedMonth, setPendingSelectedMonth] = useState<number>(currentDate.month());
  const [pendingSelectedYear, setPendingSelectedYear] = useState<number>(currentDate.year());

  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.month());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.year());

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
  const filterArray: string[] = [];

  // If showing only unpaid orders, add status filter to exclude paid orders
  if (showOnlyUnpaidOrders) {
    filterArray.push('status:pending');
  }

  // If filtering by date range, add date filters
  if (viewSelectiveOrders) {
    filterArray.push(`out_date:gte:${selectedStartDate}`);
    filterArray.push(`out_date:lte:${selectedEndDate}`);
  }

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
              setPendingViewChallans(viewChallans);
              setPendingShowOnlyUnpaidOrders(showOnlyUnpaidOrders);
              setPendingViewSelectiveOrders(viewSelectiveOrders);
              setPendingSelectedMonth(selectedMonth);
              setPendingSelectedYear(selectedYear);
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

      <Dialog
        open={displaySettingsOpen}
        onClose={() => setDisplaySettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Display Settings</DialogTitle>
        <DialogContent className="space-y-6">
          {/* Whatsapp Notifications Checkbox */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="viewWhatsappNotifications"
              checked={pendingViewChallans}
              onChange={(e) => setPendingViewChallans(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="viewWhatsappNotifications" className="cursor-pointer">
              View Whatsapp Notifications
            </label>
          </div>

          {/* Show Only Unpaid Orders Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnlyUnpaidOrders"
              checked={pendingShowOnlyUnpaidOrders}
              onChange={(e) => setPendingShowOnlyUnpaidOrders(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="showOnlyUnpaidOrders" className="cursor-pointer">
              Show Only Unpaid Orders
            </label>
          </div>

          {/* Filter by Date Range Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filterByDateRange"
              checked={pendingViewSelectiveOrders}
              onChange={(e) => {
                setPendingViewSelectiveOrders(e.target.checked);
                // If unchecking and "Show Only Unpaid Orders" is also unchecked, force it to be checked
                if (!e.target.checked && !pendingShowOnlyUnpaidOrders) {
                  setPendingViewSelectiveOrders(true);
                }
              }}
              disabled={!pendingShowOnlyUnpaidOrders}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="filterByDateRange"
              className={`cursor-pointer ${!pendingShowOnlyUnpaidOrders ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Filter by Date Range
            </label>
          </div>

          {/* Month/Year Filter Controls */}
          <div
            className={`flex items-center gap-2 ${pendingViewSelectiveOrders ? '' : 'opacity-50 cursor-not-allowed'}`}
          >
            <label className="whitespace-nowrap">Month & Year:</label>
            <select
              value={pendingSelectedMonth.toString()}
              onChange={(e) => setPendingSelectedMonth(parseInt(e.target.value))}
              disabled={!pendingViewSelectiveOrders}
              className={`px-3 py-2 border rounded bg-white cursor-pointer ${
                !pendingViewSelectiveOrders ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.description}
                </option>
              ))}
            </select>
            <select
              value={pendingSelectedYear.toString()}
              onChange={(e) => setPendingSelectedYear(parseInt(e.target.value))}
              disabled={!pendingViewSelectiveOrders}
              className={`px-3 py-2 border rounded bg-white cursor-pointer ${
                !pendingViewSelectiveOrders ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {yearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Info Alert */}
          <Alert severity="info" className="mt-4">
            Filter by Date Range is mandatory when "Show Only Unpaid Orders" is unchecked. You can
            only disable the date range filter when viewing unpaid orders.
          </Alert>
        </DialogContent>
        <DialogActions className="gap-2 p-4">
          <button
            onClick={() => setDisplaySettingsOpen(false)}
            className="px-4 py-2 border rounded bg-white cursor-pointer hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Apply all pending settings
              setViewChallans(pendingViewChallans);
              setShowOnlyUnpaidOrders(pendingShowOnlyUnpaidOrders);
              setViewSelectiveOrders(pendingViewSelectiveOrders);
              setSelectedMonth(pendingSelectedMonth);
              setSelectedYear(pendingSelectedYear);
              setDisplaySettingsOpen(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
          >
            Save
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Orders;
