import type {
  CellEditingStoppedEvent,
  ColDef,
  GridApi,
  ICellRendererParams,
  RowHeightParams,
  ValueGetterParams,
} from 'ag-grid-community';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';
import { IoPrintOutline } from 'react-icons/io5';
import { RiFileExcel2Line } from 'react-icons/ri';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AddressCellEditor } from '../../../components/AgGridCellEditors/AddressCellEditor';
import { AutocompleteCellEditor } from '../../../components/AgGridCellEditors/AutocompleteCellEditor';
import { EventNameCellEditor } from '../../../components/AgGridCellEditors/EventNameCellEditor';
import { InDateCellEditor } from '../../../components/AgGridCellEditors/InDateCellEditor';
import { SelectCellEditor } from '../../../components/AgGridCellEditors/SelectCellEditor';
import { useGetContactsQuery } from '../../../services/ContactService';
import { usePatchRentalOrderMutation } from '../../../services/OrderService';
import { setRentalOrderTablePage } from '../../../store/OrdersSlice';
import { RootState } from '../../../store/store';
import CustomTable from '../../../styled/CustomTable';
import { EventNameType, PatchOperation, ProductType } from '../../../types/common';
import {
  DepositType,
  ProductDetails,
  RentalOrderInfo,
  RentalOrderType,
  RentalType,
} from '../../../types/order';
import DeleteOrderModal from '../Customers/modals/DeleteOrderModal';
import { IdNamePair } from '../Stocks';
import {
  calculateFinalAmount,
  calculateTotalAmount,
  currencyFormatter,
  exportOrderToExcel,
  getOrderStatus,
  getOrderStatusColors,
} from './utils';

type RentalOrderTableProps = {
  rentalOrders: RentalOrderType[];
  setSelectedCustomerId: (id: string) => void;
};

const RentalOrderTable: React.FC<RentalOrderTableProps> = ({
  rentalOrders,
  setSelectedCustomerId,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storedPage = useSelector((state: RootState) => state.rentalOrder.tablePage);
  const [patchRentalOrder] = usePatchRentalOrderMutation();
  const [searchParams, setSearchParams] = useSearchParams();
  // const customer = searchParams.get('customerId') || '';
  const { data: contactsQueryData, isSuccess: isGetContactsSuccess } = useGetContactsQuery();

  const gridApiRef = useRef<GridApi | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  const [customerList, setCustomerList] = useState<IdNamePair[]>([]);

  const orderData = rentalOrders.map((order) => ({ ...order }));

  // Child passes grid API up
  const onGridReady = (api: GridApi) => {
    gridApiRef.current = api;
    if (typeof storedPage === 'number') {
      api.paginationGoToPage(storedPage);
    }
    // if (customer) {
    //   api.setFilterModel({
    //     customer: {
    //       type: 'contains',
    //       filter: customer,
    //     },
    //   });
    // }
  };

  const [deleteOrderOpen, setDeleteOrderOpen] = useState<boolean>(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string>('');

  // const calculateRentAfterGST = (
  //   rent: number,
  //   gst: number,
  //   orderInfo: RentalOrderType
  // ) => {
  //   if (orderInfo.billing_mode === BillingMode.B2C) {
  //     const exclusiveAmount = rent / (1 + gst / 100);
  //     return Math.round(exclusiveAmount * 100) / 100;
  //   } else {
  //     return rent;
  //   }
  // };

  const eventOptions: IdNamePair[] = Object.values(EventNameType).map((val, index) => ({
    id: `event-${index}`,
    name: val,
  }));

  const rentalOrderColDef: ColDef<RentalType>[] = [
    // {
    //   headerCheckboxSelection: true,
    //   checkboxSelection: true,
    //   width: 50,
    //   pinned: 'left',
    // },
    {
      field: 'order_id',
      headerName: 'Order Id',
      headerClass: 'ag-header-wrap',
      minWidth: 100,
      pinned: 'left',
      filter: 'agTextColumnFilter',
      cellRenderer: 'agGroupCellRenderer',
      sort: 'desc',
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      headerClass: 'ag-header-wrap',
      minWidth: 200,
      editable: true,
      singleClickEdit: true,
      filter: 'agTextColumnFilter',
      pinned: 'left',
      cellEditor: AutocompleteCellEditor,
      cellEditorParams: {
        customerOptions: customerList,
      },
      valueParser: (params) => {
        return params.newValue;
      },
      valueFormatter: (params) => {
        return params.value.name ?? '';
      },
      filterValueGetter: (params: ValueGetterParams) => {
        return params.data.customer.name;
      },
    },
    {
      headerName: 'Balance Amount',
      flex: 1,
      minWidth: 200,
      headerClass: 'ag-header-wrap',
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        const depositData: DepositType[] = params.data.deposits ?? 0;
        return (
          <p>
            ₹{' '}
            {Math.max(
              0,
              calculateFinalAmount(data) -
                depositData.reduce((total, deposit) => total + deposit.amount, 0)
            ).toFixed(2)}
          </p>
        );
      },
    },
    {
      field: 'out_date',
      headerName: 'Order Out Date',
      minWidth: 160,
      filter: 'agDateColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: InDateCellEditor,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return dayjs(date).format('DD-MMM-YYYY hh:mm A');
      },
    },
    {
      field: 'in_date',
      headerName: 'Order In Date',
      minWidth: 160,
      filter: 'agDateColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: InDateCellEditor,
      valueFormatter: (params) => {
        const date = params.value ? new Date(params.value) : '';
        if (date) return dayjs(date).format('DD-MMM-YYYY hh:mm A');
        return '';
      },
    },
    {
      field: 'rental_duration',
      headerName: 'Rental Duration (Days)',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agNumberColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        step: 1,
      },
    },
    {
      headerName: 'Deposit Amount',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agNumberColumnFilter',
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const depositData: DepositType[] = params.data.deposits ?? 0;
        return depositData.reduce((total, deposit) => total + deposit.amount, 0);
      },
    },
    {
      headerName: 'Amount (After Taxes)',
      flex: 1,
      minWidth: 200,
      headerClass: 'ag-header-wrap',
      filter: 'agNumberColumnFilter',
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const value = calculateFinalAmount(params.data, false);
        return isNaN(value) ? null : value;
      },
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        return <p>₹ {calculateFinalAmount(data, false)}</p>;
      },
    },
    // {
    //   headerName: "Outstanding Amount",
    //   flex: 1,
    //   minWidth: 200,
    //   headerClass: "ag-header-wrap",
    //   filter: "agNumberColumnFilter",
    //   valueGetter: (params: ValueGetterParams) => {
    //     const depositData: DepositType[] = params.data.deposits ?? 0;
    //     const value =
    //       calculateFinalAmount(params.data) -
    //       depositData.reduce((total, deposit) => total + deposit.amount, 0);

    //     return isNaN(value) ? null : value;
    //   },
    //   cellRenderer: (params: ICellRendererParams) => {
    //     const data = params.data;
    //     const depositData: DepositType[] = params.data.deposits ?? 0;
    //     return (
    //       <p>
    //         ₹{" "}
    //         {(
    //           calculateFinalAmount(data) -
    //           depositData.reduce((total, deposit) => total + deposit.amount, 0)
    //         ).toFixed(2)}
    //       </p>
    //     );
    //   },
    // },
    {
      field: 'balance_paid',
      headerName: 'Balance Paid Amount',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agTextColumnFilter',
      editable: true,
      valueFormatter: currencyFormatter,
      singleClickEdit: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        step: 1,
      },
    },
    {
      field: 'repay_amount',
      headerName: 'Repayment Amount',
      flex: 1,
      minWidth: 200,
      headerClass: 'ag-header-wrap',
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        const depositData: DepositType[] = params.data.deposits ?? 0;
        return (
          <p>
            ₹{' '}
            {Math.abs(
              Math.min(
                0,
                calculateFinalAmount(data) -
                  depositData.reduce((total, deposit) => total + deposit.amount, 0)
              )
            ).toFixed(2)}
          </p>
        );
      },
    },
    {
      field: 'event_name',
      headerName: 'Event Name',
      flex: 1,
      headerClass: 'ag-header-wrap',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: EventNameCellEditor,
      cellEditorParams: {
        customerOptions: eventOptions,
      },
    },
    {
      field: 'event_venue',
      headerName: 'Event Venue',
      flex: 1,
      headerClass: 'ag-header-wrap',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: AddressCellEditor,
    },
    {
      field: 'event_address',
      headerName: 'Event Address',
      flex: 1,
      headerClass: 'ag-header-wrap',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: AddressCellEditor,
      valueFormatter: (params) => {
        return params.value?.replace(/\n/g, ' ') ?? '';
      },
    },
    {
      field: 'billing_mode',
      headerName: 'GST Mode',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ['B2C', 'B2B'],
      },
    },
    {
      field: 'gst',
      headerName: 'GST(%)',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agNumberColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        step: 1,
      },
    },
    {
      headerName: 'GST Amount',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agTextColumnFilter',
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const gstPercent = parseFloat(params.data.gst ?? 0);
        const totalAmount = calculateTotalAmount(params.data);
        if (isNaN(gstPercent) || isNaN(totalAmount)) return 0;
        return (gstPercent / 100) * totalAmount;
      },
    },
    {
      field: 'discount',
      headerName: 'Discount',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agNumberColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        step: 1,
      },
      valueFormatter: (params) => {
        const data = params.data;
        if (
          data &&
          data.type === ProductType.RENTAL &&
          data.product_details &&
          data.discount_type === 'percent'
        ) {
          return `${data.discount}%`;
        }
        return `₹${data?.discount.toFixed(2)}`;
      },
    },
    {
      field: 'discount_type',
      headerName: 'Discount Type',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ['percent', 'rupees'],
      },
    },
    {
      field: 'round_off',
      headerName: 'Round Off',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agTextColumnFilter',
      editable: true,
      valueFormatter: currencyFormatter,
      singleClickEdit: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        step: 1,
      },
    },
    {
      field: 'eway_amount',
      headerName: 'Transport Amount',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agTextColumnFilter',
      editable: true,
      valueFormatter: currencyFormatter,
      singleClickEdit: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        step: 1,
      },
    },
    {
      field: 'eway_type',
      headerName: 'Transport Type',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ['-', 'Up', 'Down', 'Both'],
      },
    },
    {
      field: 'eway_mode',
      headerName: 'Transport Payment Mode',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ['-', 'cash', 'account', 'upi'],
      },
    },
    // {
    //   field: 'remarks',
    //   headerName: 'Remarks',
    //   flex: 1,
    //   headerClass: 'ag-header-wrap',
    //   minWidth: 200,
    //   filter: 'agTextColumnFilter',
    //   editable: true,
    //   singleClickEdit: true,
    //   cellEditor: AddressCellEditor,
    //   valueFormatter: (params) => {
    //     return params.value?.replace(/\n/g, ' ') ?? '';
    //   },
    // },
    {
      field: 'payment_mode',
      headerName: 'Repayment Mode',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ['-', 'cash less', 'upi less', 'kvb less'],
      },
    },
    {
      field: 'balance_paid_mode',
      headerName: 'Balance Payment Mode',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ['-', 'cash', 'account', 'upi'],
      },
    },
    {
      field: 'status',
      headerName: 'Order Status',
      headerClass: 'ag-header-wrap',
      maxWidth: 170,
      filter: 'agTextColumnFilter',
      pinned: 'right',
      // editable: true,
      // singleClickEdit: true,
      valueGetter: (params) => getOrderStatus(params.data as RentalOrderInfo),
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        const status = getOrderStatus(data);
        const statusColor = getOrderStatusColors(status);
        return (
          <p
            style={{
              width: '100%',
              height: '100%',
              textAlign: 'center',
              backgroundColor: statusColor.bg,
              color: statusColor.text,
            }}
          >
            {status}
          </p>
        );
      },
      // valueFormatter: (params: ValueFormatterParams) => {
      //   const data = params.data;
      //   const status = getOrderStatus(data);
      //   return status;
      //   // const status = params.data.status;
      //   // if (status === 'paid') return 'Paid';
      //   // if (status === 'pending') {
      //   //   const data = params.data;
      //   //   const depositData: DepositType[] = params.data.deposits ?? 0;

      //   //   const total =
      //   //     calculateFinalAmount(data) -
      //   //     depositData.reduce((total, deposit) => total + deposit.amount, 0);

      //   //   return total >= 0 ? 'Machine and Balance Pending' : 'Machine and Repayment Pending';
      //   // }
      //   // return status;
      // },
      // cellEditor: SelectCellEditor,
      // cellEditorParams: {
      //   options: ['paid', 'pending'],
      // },
      cellStyle: () => {
        return {
          padding: 0,
        };
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      pinned: 'right',
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams<RentalType>) => {
        const rowData = params.data;
        return (
          <div className="flex gap-2 h-[2rem] items-center">
            <FiEdit
              size={19}
              className="cursor-pointer"
              onClick={() => {
                if (gridApiRef.current) {
                  const currentPage = gridApiRef.current.paginationGetCurrentPage();
                  dispatch(setRentalOrderTablePage(currentPage));
                }
                navigate(`/orders/rentals/${rowData?._id}`);
              }}
            />
            <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              onClick={() => {
                setDeleteOrderOpen(true);
                setDeleteOrderId(rowData?._id || '');
              }}
            />
            <RiFileExcel2Line
              size={20}
              className="cursor-pointer"
              onClick={() => {
                if (params.data) {
                  exportOrderToExcel([params.data]);
                }
              }}
            />

            <IoPrintOutline
              size={20}
              className="cursor-pointer"
              onClick={() => {
                window.open(`/orders/invoices/${rowData?._id}`, '_blank');
              }}
            />
          </div>
        );
      },
    },
  ];

  const handleCellEditingStopped = async (event: CellEditingStoppedEvent) => {
    const { data, colDef, oldValue, newValue } = event;
    const field = colDef.field;
    if (!field || newValue === oldValue) return;
    try {
      let value = newValue;

      //expandedRows
      const expanded: string[] = [];
      if (gridApiRef.current !== null) {
        gridApiRef.current.forEachNode((node) => {
          if (node.expanded) expanded.push(node.data._id);
        });
      }
      setExpandedRowIds(expanded);

      // Special case for customer field
      if (field === 'customer') {
        if (!isGetContactsSuccess) {
          console.error('Customer query not retrieved yet');
          return;
        }
        const customer = contactsQueryData.find((c) => c._id === newValue._id);
        if (!customer) {
          console.error('Customer not found for ID:', newValue);
          return;
        }
        value = { ...customer };
      }

      if (field === 'event_name') {
        value = value.name;
      }

      if (field === 'in_date') {
        if (dayjs(value).diff(data.out_date) < 0) {
          value = data.out_date;
        }
      }

      const patchPayload: PatchOperation[] = [
        {
          op: 'replace',
          path: `/${field}`,
          value,
        },
      ];

      if (field === 'status') {
        if (value === 'paid' && !data.in_date) {
          toast.warning('Bill Date/End Date is empty');
          return;
        }

        if (typeof newValue === 'string' && newValue.includes('pending')) value = 'pending';

        if (value === 'pending') {
          // patchPayload.push({
          //   op: 'replace',
          //   path: '/repay_date',
          //   value: '',
          // });
          patchPayload.push({
            op: 'replace',
            path: '/payment_mode',
            value: '-',
          });
        }
      }

      if (field === 'discount_type') {
        patchPayload.push({
          op: 'replace',
          path: '/discount',
          value: 0,
        });
      }

      const notReturnedProducts =
        data.product_details.find(
          (prod: ProductDetails) => !prod.in_date && prod.type === ProductType.RENTAL
        ) || false;
      const hasProductOrTransportAmount =
        (data.product_details.length > 0 &&
          data.product_details.some((p: ProductDetails) => p.order_quantity > 0)) ||
        data.eway_amount > 0;
      const finalAmount =
        calculateFinalAmount(data) -
        data.deposits.reduce((sum: number, deposit: DepositType) => sum + deposit.amount, 0);
      if (
        data.in_date &&
        (data.repay_date || finalAmount === 0) &&
        !notReturnedProducts &&
        hasProductOrTransportAmount
      ) {
        patchPayload.push({
          op: 'replace',
          path: '/status',
          value: 'paid',
        });
      } else {
        patchPayload.push({
          op: 'replace',
          path: '/status',
          value: 'pending',
        });
      }

      await patchRentalOrder({ id: data._id, payload: patchPayload }).unwrap();

      console.log(`Successfully patched ${field} for order ${data._id}`);
    } catch (err) {
      console.error('Failed to patch rental order:', err);
      // Optional: revert or notify
    }
  };

  const handleRowHeight = (params: RowHeightParams) => {
    if (params.node.detail) {
      return 300;
    }
    return 45;
  };

  const onRowDataUpdated = useCallback(() => {
    if (gridApiRef.current === null) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gridApiRef?.current?.forEachNode((node: any) => {
      if (expandedRowIds.includes(node.data._id)) {
        node.setExpanded(true);
      }
    });
  }, [expandedRowIds]);

  const initialFilterApplied = useRef(false);

  const handleFilterChanged = () => {
    if (!gridApiRef.current) return;
    // const filterModel = gridApiRef.current.getFilterModel();

    // Skip the first filter change (initial setup)
    if (!initialFilterApplied.current) {
      initialFilterApplied.current = true;
      return;
    }

    // If the customer filter is removed or changed, reset selected customer
    // if (
    //   !filterModel ||
    //   !filterModel.customer ||
    //   (customerList.length > 0 &&
    //     filterModel.customer.filter !== customerList.find((c) => c._id === customer)?.name)
    // ) {
    //   setSelectedCustomerId('');
    // }
  };

  useEffect(() => {
    if (isGetContactsSuccess) {
      setCustomerList(
        contactsQueryData.map((contact) => ({
          _id: contact._id,
          name: `${contact.name}-${contact.personal_number}`,
        }))
      );
    }
  }, [contactsQueryData, isGetContactsSuccess]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRowGroupOpened = (params: any) => {
    const rowId = params.node.data?._id;
    if (!rowId) return;

    setExpandedRowIds((prev) => {
      if (prev) {
        if (params.node.expanded) {
          return prev.includes(rowId) ? prev : [...prev, rowId];
        } else {
          return prev.filter((id) => id !== rowId);
        }
      } else {
        return [rowId];
      }
    });
  };

  useEffect(() => {
    if (!gridApiRef.current) return;
    // if (customer && customerList.length > 0) {
    //   const selectedCustomer = customerList.find((c) => c._id === customer)?.name;
    //   if (!selectedCustomer) return;
    //   gridApiRef.current.setFilterModel({
    //     customer: {
    //       type: 'contains',
    //       filter: selectedCustomer,
    //     },
    //   });
    //   setSelectedCustomerId(customer);

    //   searchParams.delete('customerId');
    //   setSearchParams(searchParams, { replace: true });
    // }
  }, [customerList, searchParams, setSearchParams, setSelectedCustomerId]);

  return (
    <>
      <CustomTable
        isLoading={false}
        colDefs={rentalOrderColDef}
        rowData={orderData}
        onGridReady={onGridReady}
        getRowStyle={() => {
          return {
            backgroundColor: 'white',
          };
        }}
        onRowGroupOpened={onRowGroupOpened}
        masterDetail={true}
        handleCellEditingStopped={handleCellEditingStopped}
        getRowHeight={handleRowHeight}
        onRowDataUpdated={onRowDataUpdated}
        onFilterChanged={handleFilterChanged}
      />
      <DeleteOrderModal
        deleteOrderOpen={deleteOrderOpen}
        setDeleteOrderOpen={(value) => setDeleteOrderOpen(value)}
        deleteOrderId={deleteOrderId}
        setDeleteOrderId={(value) => setDeleteOrderId(value)}
      />
    </>
  );
};

export default RentalOrderTable;
