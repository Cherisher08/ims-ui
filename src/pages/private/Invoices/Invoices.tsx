import { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { FC, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Invoice from '../../../components/Invoice';
import { pdfElementToPngFile, sendImageViaWhatsapp } from '../Entries/pdfWhatsappUtils';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../../constants/constants';
import { IoLogoWhatsapp } from 'react-icons/io5';
import {
  usePostOrderDcAsWhatsappMessageMutation,
  useUpdateRentalOrderMutation,
} from '../../../services/OrderService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import CustomTable from '../../../styled/CustomTable';

import { IoPrintOutline } from 'react-icons/io5';
import { RentalOrderInfo, RentalOrderType } from '../../../types/order';

import {
  calculateFinalAmount,
  currencyFormatter,
  dateFilterParams,
  exportInvoiceToExcel,
  getOrderStatus,
  getOrderStatusColors,
  parseDateFromString,
} from '../Orders/utils';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { RiFileExcel2Line } from 'react-icons/ri';
import CustomSplitButton from '../../../styled/CustomSplitButton';
import CustomDatePicker from '../../../styled/CustomDatePicker';
import CustomSelect from '../../../styled/CustomSelect';

dayjs.extend(isSameOrBefore);

const Invoices: FC = () => {
  // Set PDF.js worker once
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>('1');
  const [filterDates, setFilterDates] = useState<{ start: string; end: string } | null>(null);

  const [sendDcWhatsapp] = usePostOrderDcAsWhatsappMessageMutation();
  const [updateRentalOrder] = useUpdateRentalOrderMutation();

  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery();

  const orderData = isRentalOrdersQuerySuccess
    ? rentalOrders
        .filter((order) => order.invoice_id)
        .sort((a, b) => (a.invoice_id < b.invoice_id ? 1 : -1))
    : [];

  const filterOptions = [
    { id: '1', value: 'All Invoices' },
    { id: '2', value: 'Current Month' },
    { id: '3', value: 'Custom' },
  ];

  const getValidInvoiceDates = (
    filter: string,
    filterDates: { start: string; end: string } | null
  ): string[] => {
    const today = dayjs();
    const dates: string[] = [];

    if (filter === '2') {
      // Current month: from 1st to today
      const start = today.startOf('month');
      const end = today;
      let cursor = start.clone();
      while (cursor.isSameOrBefore(end)) {
        dates.push(cursor.format('YYYY-MM-DD'));
        cursor = cursor.add(1, 'day');
      }
    } else if (filter === '3') {
      // Custom: from start to end
      if (filterDates) {
        const start = dayjs(filterDates.start);
        const end = dayjs(filterDates.end);
        let cursor = start.clone();
        while (cursor.isSameOrBefore(end)) {
          dates.push(cursor.format('YYYY-MM-DD'));
          cursor = cursor.add(1, 'day');
        }
      }
    }

    return dates;
  };

  const filteredOrderData = orderData.filter((order) => {
    if (filter === '1') {
      // All Invoices - no filtering
      return true;
    }
    if (!order.invoice_date) return false;
    const invoiceDate = dayjs(order.invoice_date).format('YYYY-MM-DD');
    const validDates = getValidInvoiceDates(filter, filterDates);
    return validDates.includes(invoiceDate);
  });

  const renderIcon = (params: { data: RentalOrderInfo; type: 'delivery_challan' | 'invoice' }) => {
    const bill =
      params.data?.whatsapp_notifications?.[
        params.type === 'delivery_challan' ? 'delivery_challan' : 'invoice'
      ];

    const sent = bill?.is_sent || false;

    return sent ? (
      <div className="flex h-full w-full justify-center items-center">
        <FaCheckCircle className="text-green-600 text-xl" />
      </div>
    ) : (
      <div className="flex h-full w-full justify-center items-center">
        <FaTimesCircle className="text-red-600 text-xl" />
      </div>
    );
  };

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
      field: 'customer.gstin',
      headerName: 'GST Number',
      minWidth: 200,
      resizable: true,
      headerClass: 'ag-header-wrap',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'invoice_date',
      headerName: 'Invoice Date',
      minWidth: 180,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        const date = params.value ? new Date(params.value) : '';
        if (date) return dayjs(date).format('DD-MMM-YYYY hh:mm A');
        return '';
      },
      filterValueGetter: (tableData: ValueGetterParams) => {
        const date = tableData.data.invoice_date ? tableData.data.invoice_date : null;
        const formattedDate = parseDateFromString(date);
        return formattedDate;
      },
      filterParams: dateFilterParams,
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
      field: 'gst',
      headerName: 'GST(%)',
      headerClass: 'ag-header-wrap',
      minWidth: 150,
      maxWidth: 200,
      filter: 'agNumberColumnFilter',
    },
    {
      colId: 'sent_invoice',
      headerName: 'Sent Invoice',
      flex: 1,
      minWidth: 100,
      cellRenderer: renderIcon,
      cellRendererParams: { type: 'invoice' },
      valueGetter: (params) => {
        return params.data?.whatsapp_notifications?.invoice?.is_sent === true ? 'Yes' : 'No';
      },
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Invoice - Last Sent Date',
      minWidth: 160,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        const data = params.data;
        const invoice = data?.whatsapp_notifications?.invoice;
        if (invoice?.is_sent) {
          const date = new Date(invoice.last_sent_date);
          return dayjs(date).format('DD-MMM-YYYY hh:mm A');
        } else return '';
      },
    },
    {
      field: 'status',
      headerName: 'Order Status',
      headerClass: 'ag-header-wrap',
      maxWidth: 170,
      filter: 'agTextColumnFilter',
      pinned: 'right',
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
          <div className="flex gap-2 h-8 items-center">
            <IoPrintOutline
              size={20}
              className="cursor-pointer"
              onClick={() => {
                window.open(`/orders/invoices/${rowData?._id}`, '_blank');
              }}
            />

            {/* WhatsApp send icon: renders invoice -> converts to PNG -> sends via existing mutation */}
            <IoLogoWhatsapp
              size={20}
              className={`cursor-pointer text-green-600 ${
                sendingMap[rowData._id] ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={async () => {
                if (!rowData) return;
                const orderId = rowData._id;
                try {
                  setSendingMap((s) => ({ ...s, [orderId]: true }));
                  const invoiceId = rowData.invoice_id || '';

                  const file = await pdfElementToPngFile(
                    <Invoice data={rowData} invoiceId={invoiceId} />,
                    `${rowData.customer?.name || 'Invoice'}.png`
                  );

                  await sendImageViaWhatsapp({
                    file,
                    order: rowData,
                    sendDcWhatsapp,
                    updateRentalOrder,
                  });

                  toast.success('Invoice sent via WhatsApp', {
                    toastId: TOAST_IDS.SUCCESS_WHATSAPP_ORDER_DC,
                  });
                } catch (err) {
                  console.error('Error sending invoice via WhatsApp from Invoices table', err);
                  toast.error('Failed to send invoice via WhatsApp', {
                    toastId: TOAST_IDS.ERROR_WHATSAPP_ORDER_DC,
                  });
                } finally {
                  setSendingMap((s) => ({ ...s, [rowData._id]: false }));
                }
              }}
            />
            <RiFileExcel2Line
              size={20}
              className="cursor-pointer"
              onClick={() => {
                if (params.data) {
                  exportInvoiceToExcel([params.data]);
                }
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex justify-between">
        <p className="font-primary w-full text-2xl font-bold">INVOICES</p>
        <div className="flex gap-4 mb-3">
          {filter === '3' && (
            <>
              <CustomDatePicker
                label={'Start Date'}
                value={filterDates ? filterDates.start : ''}
                onChange={(startDate) => {
                  setFilterDates({ start: startDate, end: filterDates ? filterDates.end : '' });
                }}
                wrapperClass="flex-row items-center"
                format="YYYY-MM-DD"
              />
              <CustomDatePicker
                label={'End Date'}
                value={filterDates ? filterDates.end : ''}
                onChange={(endDate) => {
                  setFilterDates({ start: filterDates ? filterDates.start : '', end: endDate });
                }}
                wrapperClass="flex-row items-center"
                format="YYYY-MM-DD"
              />
            </>
          )}
          <CustomSelect
            label=""
            onChange={(val) => setFilter(val)}
            className="w-[8rem]"
            options={filterOptions}
            value={filter}
          />
          <CustomSplitButton
            onClick={() => {
              if (orderData) exportInvoiceToExcel(orderData as RentalOrderInfo[]);
            }}
            label="Export Invoices"
            icon={<RiFileExcel2Line color="white" />}
            options={['All Invoices', 'Filtered Invoices']}
            onMenuItemClick={(index) => {
              try {
                if (index === 0) {
                  // All invoices
                  if (orderData && orderData.length > 0) {
                    exportInvoiceToExcel(orderData as RentalOrderInfo[]);
                  }
                } else if (index === 1) {
                  // Filtered invoices - use filteredOrderData
                  if (filteredOrderData && filteredOrderData.length > 0) {
                    exportInvoiceToExcel(filteredOrderData as RentalOrderInfo[]);
                  }
                }
              } catch (err) {
                console.error('Failed to export invoices', err);
              }
            }}
          />
        </div>
      </div>
      <CustomTable
        isLoading={false}
        colDefs={rentalOrderColDef}
        rowData={filteredOrderData}
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
