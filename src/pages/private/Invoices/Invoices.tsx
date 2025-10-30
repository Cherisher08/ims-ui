import { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { FC } from 'react';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import CustomTable from '../../../styled/CustomTable';

import { IoPrintOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { RentalOrderInfo, RentalOrderType } from '../../../types/order';
import {
  calculateFinalAmount,
  currencyFormatter,
  getOrderStatus,
  getOrderStatusColors,
} from '../Orders/utils';

const Invoices: FC = () => {
  const navigate = useNavigate();

  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery();

  const orderData = isRentalOrdersQuerySuccess
    ? rentalOrders
        .filter((order) => order.invoice_id)
        .sort((a, b) => (a.invoice_id < b.invoice_id ? 1 : -1))
    : [];

  const rentalOrderColDef: ColDef[] = [
    {
      field: 'invoice_id',
      headerName: 'Invoice Id',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: 'agGroupCellRenderer',
      // sort: 'desc',
      pinned: 'left',
    },
    {
      field: 'order_id',
      headerName: 'Order Id',
      headerClass: 'ag-header-wrap',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      field: 'customer',
      headerName: 'Customer',
      minWidth: 200,
      resizable: true,
      headerClass: 'ag-header-wrap',
      filter: 'agTextColumnFilter',
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
      field: 'in_date',
      headerName: 'Bill Date',
      minWidth: 180,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        const date = params.value ? new Date(params.value) : '';
        if (date) return dayjs(date).format('DD-MMM-YYYY hh:mm A');
        return '';
      },
    },
    {
      headerName: 'Amount (After Taxes)',
      flex: 1,
      headerClass: 'ag-header-wrap',
      filter: 'agNumberColumnFilter',
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const value = calculateFinalAmount(params.data as RentalOrderType, false);
        return isNaN(value) ? null : value;
      },
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        return <p>₹ {calculateFinalAmount(data as RentalOrderType, false)}</p>;
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
      cellRenderer: (params: ICellRendererParams) => {
        const rowData = params.data;
        return (
          <div className="flex gap-2 h-[2rem] items-center">
            <IoPrintOutline
              size={20}
              className="cursor-pointer"
              onClick={() => {
                navigate(`/orders/invoices/${rowData?._id}`);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <p className="font-primary w-full text-center text-2xl font-bold">INVOICES</p>
      <CustomTable
        isLoading={false}
        colDefs={rentalOrderColDef}
        rowData={orderData}
        getRowStyle={() => {
          return {
            backgroundColor: 'white',
          };
        }}
      />
    </div>
  );
};

export default Invoices;
