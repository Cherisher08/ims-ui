import Modal from '@mui/material/Modal';
import { FC, useState } from 'react';
import { MdClose } from 'react-icons/md';
import CustomButton from '../../styled/CustomButton';
import CustomTable from '../../styled/CustomTable';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { useGetRentalOrdersQuery } from '../../services/OrderService';
import { useGetPettyCashesQuery } from '../../services/PettyCashService';
import { PaymentMode, RepaymentMode, RentalOrderType } from '../../types/order';
import { calculateFinalAmount } from '../../pages/private/Orders/utils';
import CustomDatePicker from '../../styled/CustomDatePicker';
import DateSpecificPettyCashDialog from './DateSpecificPettyCashDialog';

interface PettyCashDialogProps {
  open: boolean;
  onClose: () => void;
}

interface RowData {
  date: string;
  cashIn: number;
  accountIn: number;
  upiIn: number;
  cashLess: number;
  upiLess: number;
  kvbLess: number;
}

const PettyCashDialog: FC<PettyCashDialogProps> = ({ open, onClose }) => {
  const [filterDates, setFilterDates] = useState<{ start: string; end: string }>({
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  });

  const [dateSpecificDialog, setDateSpecificDialog] = useState<{ open: boolean; date: string }>({
    open: false,
    date: '',
  });

  const fromDate = dayjs(filterDates.start);
  const toDate = dayjs(filterDates.end);

  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery();
  const { data: pettyCashes, isSuccess: isPettyCashesQuerySuccess } = useGetPettyCashesQuery();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableHTML = `
      <html>
        <head>
          <title>Petty Cash Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .totals { background-color: #e6f3ff; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mani Power Tools</h1>
            <h2>Petty Cash Report</h2>
            <p>Period: ${fromDate.format('DD-MMM-YYYY')} to ${toDate.format('DD-MMM-YYYY')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cash In</th>
                <th>HDFC In</th>
                <th>Gpay In</th>
                <th>Cash Less</th>
                <th>Gpay Less</th>
                <th>KVB Less</th>
              </tr>
            </thead>
            <tbody>
              ${rowData
                .map(
                  (row) => `
                <tr>
                  <td>${dayjs(row.date).format('DD-MMM-YYYY')}</td>
                  <td>₹ ${row.cashIn || 0}</td>
                  <td>₹ ${row.accountIn || 0}</td>
                  <td>₹ ${row.upiIn || 0}</td>
                  <td>₹ ${row.cashLess || 0}</td>
                  <td>₹ ${row.upiLess || 0}</td>
                  <td>₹ ${row.kvbLess || 0}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="totals">
                <td>Totals</td>
                <td>₹ ${totalsRow.cashIn}</td>
                <td>₹ ${totalsRow.accountIn}</td>
                <td>₹ ${totalsRow.upiIn}</td>
                <td>₹ ${totalsRow.cashLess}</td>
                <td>₹ ${totalsRow.upiLess}</td>
                <td>₹ ${totalsRow.kvbLess}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate list of dates between fromDate and toDate
  const dates = [];
  let currentDate = fromDate.clone();
  while (currentDate.isBefore(toDate) || currentDate.isSame(toDate, 'day')) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }

  // Collect all transactions within the date range
  const allTransactions: RowData[] = [];

  // From rental orders
  rentalOrders?.forEach((order) => {
    const totalDeposits = order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    const billAmount = calculateFinalAmount(order as RentalOrderType);
    const repayAmount = totalDeposits - billAmount;

    // Balance paid
    if (
      order.balance_paid_date &&
      dayjs(order.balance_paid_date).isBetween(fromDate, toDate, 'day', '[]')
    ) {
      allTransactions.push({
        date: dayjs(order.balance_paid_date).format('YYYY-MM-DD'),
        cashIn: order.balance_paid_mode === PaymentMode.CASH ? order.balance_paid : 0,
        accountIn: order.balance_paid_mode === PaymentMode.ACCOUNT ? order.balance_paid : 0,
        upiIn: order.balance_paid_mode === PaymentMode.UPI ? order.balance_paid : 0,
        cashLess: 0,
        upiLess: 0,
        kvbLess: 0,
      });
    }

    // Repay
    if (order.repay_date && dayjs(order.repay_date).isBetween(fromDate, toDate, 'day', '[]')) {
      allTransactions.push({
        date: dayjs(order.repay_date).format('YYYY-MM-DD'),
        cashIn: 0,
        accountIn: 0,
        upiIn: 0,
        cashLess: order.payment_mode === RepaymentMode.CASHLESS ? repayAmount : 0,
        upiLess: order.payment_mode === RepaymentMode.UPILESS ? repayAmount : 0,
        kvbLess: order.payment_mode === RepaymentMode.KVBLESS ? repayAmount : 0,
      });
    }

    // Deposits
    order.deposits.forEach((deposit) => {
      if (dayjs(deposit.date).isBetween(fromDate, toDate, 'day', '[]')) {
        allTransactions.push({
          date: dayjs(deposit.date).format('YYYY-MM-DD'),
          cashIn: deposit.mode === PaymentMode.CASH ? deposit.amount : 0,
          accountIn: deposit.mode === PaymentMode.ACCOUNT ? deposit.amount : 0,
          upiIn: deposit.mode === PaymentMode.UPI ? deposit.amount : 0,
          cashLess: 0,
          upiLess: 0,
          kvbLess: 0,
        });
      }
    });
  });

  // From petty cash
  pettyCashes?.forEach((pettyCash) => {
    if (dayjs(pettyCash.created_date).isBetween(fromDate, toDate, 'day', '[]')) {
      allTransactions.push({
        date: dayjs(pettyCash.created_date).format('YYYY-MM-DD'),
        cashIn: pettyCash.balance_paid_mode === PaymentMode.CASH ? pettyCash.balance_paid : 0,
        accountIn: pettyCash.balance_paid_mode === PaymentMode.ACCOUNT ? pettyCash.balance_paid : 0,
        upiIn: pettyCash.balance_paid_mode === PaymentMode.UPI ? pettyCash.balance_paid : 0,
        cashLess: pettyCash.payment_mode === RepaymentMode.CASHLESS ? pettyCash.repay_amount : 0,
        upiLess: pettyCash.payment_mode === RepaymentMode.UPILESS ? pettyCash.repay_amount : 0,
        kvbLess: pettyCash.payment_mode === RepaymentMode.KVBLESS ? pettyCash.repay_amount : 0,
      });
    }
  });

  // Group by date and sum
  const consolidatedData = dates.map((date) => {
    const dayTransactions = allTransactions.filter((t) => t.date === date);
    return {
      date,
      cashIn: dayTransactions.reduce((sum, t) => sum + t.cashIn, 0),
      accountIn: dayTransactions.reduce((sum, t) => sum + t.accountIn, 0),
      upiIn: dayTransactions.reduce((sum, t) => sum + t.upiIn, 0),
      cashLess: dayTransactions.reduce((sum, t) => sum + t.cashLess, 0),
      upiLess: dayTransactions.reduce((sum, t) => sum + t.upiLess, 0),
      kvbLess: dayTransactions.reduce((sum, t) => sum + t.kvbLess, 0),
    };
  });

  const rowData = consolidatedData;

  // Compute consolidated totals for numeric columns
  const totalsRow = {
    date: 'Totals',
    cashIn: rowData.reduce((sum, r) => sum + (r.cashIn || 0), 0),
    accountIn: rowData.reduce((sum, r) => sum + (r.accountIn || 0), 0),
    upiIn: rowData.reduce((sum, r) => sum + (r.upiIn || 0), 0),
    cashLess: rowData.reduce((sum, r) => sum + (r.cashLess || 0), 0),
    upiLess: rowData.reduce((sum, r) => sum + (r.upiLess || 0), 0),
    kvbLess: rowData.reduce((sum, r) => sum + (r.kvbLess || 0), 0),
  };

  const colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 120,
      valueFormatter: (params) => {
        const date = params.value ? new Date(params.value) : '';
        return date ? dayjs(date).format('DD-MMM-YYYY') : '';
      },
    },
    {
      headerName: 'In Payment',
      children: [
        {
          field: 'cashIn',
          headerName: 'Cash In',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
        },
        {
          field: 'accountIn',
          headerName: 'HDFC In',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
        },
        {
          field: 'upiIn',
          headerName: 'Gpay In',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
        },
      ],
    },
    {
      headerName: 'Repayment',
      children: [
        {
          field: 'cashLess',
          headerName: 'Cash Less',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
        },
        {
          field: 'upiLess',
          headerName: 'Gpay Less',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
        },
        {
          field: 'kvbLess',
          headerName: 'KVB Less',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
        },
      ],
    },
    {
      headerName: 'Actions',
      field: 'actions',
      minWidth: 120,
      cellRenderer: (params: { data: RowData }) => {
        const data = params.data as RowData;
        if (!data || data.date === 'Totals') return null;
        return (
          <div>
            <CustomButton
              label="View Details"
              onClick={() => setDateSpecificDialog({ open: true, date: data.date })}
              variant="contained"
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center w-1/2 h-5/6 max-w-none max-h-none bg-white rounded-lg p-4">
          <div className="relative w-full flex justify-center items-center">
            <p className="text-primary text-xl font-semibold">Mani Power Tools</p>
            <div className="absolute right-0 flex gap-3 items-center">
              <CustomButton onClick={handlePrint} label="Print" variant="outlined" />
              <MdClose size={25} className="cursor-pointer" onClick={onClose} />
            </div>
          </div>
          <p className="text-primary text-center text-lg font-semibold w-full">Petty Cash</p>
          <div className="flex w-full gap-4 items-center justify-center">
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
          </div>
          <div className="flex flex-col gap-3 h-full w-full px-3 overflow-y-auto scrollbar-stable">
            {/* Petty Cash content goes here */}
            <CustomTable
              rowData={rowData}
              colDefs={colDefs}
              isLoading={!isRentalOrdersQuerySuccess && !isPettyCashesQuerySuccess}
              // pinnedBottomRowData={[totalsRow]}
            />
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton onClick={onClose} label="Close" variant="outlined" className="bg-white" />
          </div>
        </div>
      </Modal>
      <DateSpecificPettyCashDialog
        open={dateSpecificDialog.open}
        onClose={() => setDateSpecificDialog({ open: false, date: '' })}
        date={dateSpecificDialog.date}
      />
    </>
  );
};

export default PettyCashDialog;
