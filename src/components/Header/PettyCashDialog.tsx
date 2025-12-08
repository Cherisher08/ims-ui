import Modal from '@mui/material/Modal';
import { FC } from 'react';
import { MdClose } from 'react-icons/md';
import CustomButton from '../../styled/CustomButton';
import CustomTable from '../../styled/CustomTable';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useGetRentalOrdersQuery } from '../../services/OrderService';
import { PaymentMode, PaymentStatus, RepaymentMode, RentalOrderType } from '../../types/order';
import { calculateFinalAmount } from '../../pages/private/Orders/utils';

interface PettyCashDialogProps {
  open: boolean;
  onClose: () => void;
}

const PettyCashDialog: FC<PettyCashDialogProps> = ({ open, onClose }) => {
  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery();

  // Filter orders paid today
  const today = dayjs().subtract(1, 'day').startOf('day');
  const paidTodayOrders =
    rentalOrders?.filter(
      (order) =>
        order.status === PaymentStatus.PAID &&
        order.invoice_date &&
        dayjs(order.invoice_date).isSame(today, 'day')
    ) || [];

  // Process row data
  const rowData = paidTodayOrders
    .map((order) => {
      const totalDeposits = order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
      const billAmount = calculateFinalAmount(order as RentalOrderType);
      const repayAmount = totalDeposits - billAmount;

      // Calculate deposits made today by mode
      const todayDeposits = order.deposits.filter((deposit) =>
        dayjs(deposit.date).isSame(today, 'day')
      );
      const cashDepositsToday = todayDeposits
        .filter((deposit) => deposit.mode === PaymentMode.CASH)
        .reduce((sum, deposit) => sum + deposit.amount, 0);
      const accountDepositsToday = todayDeposits
        .filter((deposit) => deposit.mode === PaymentMode.ACCOUNT)
        .reduce((sum, deposit) => sum + deposit.amount, 0);
      const upiDepositsToday = todayDeposits
        .filter((deposit) => deposit.mode === PaymentMode.UPI)
        .reduce((sum, deposit) => sum + deposit.amount, 0);

      return {
        dateTime: order.invoice_date,
        inDate: order.in_date,
        customerName: order.customer?.name || '',
        phoneNumber: order.customer?.personal_number || '',
        cashIn:
          (order.balance_paid_mode === PaymentMode.CASH ? order.balance_paid : 0) +
          cashDepositsToday,
        accountIn:
          (order.balance_paid_mode === PaymentMode.ACCOUNT ? order.balance_paid : 0) +
          accountDepositsToday,
        upiIn:
          (order.balance_paid_mode === PaymentMode.UPI ? order.balance_paid : 0) + upiDepositsToday,
        cashLess: order.payment_mode === RepaymentMode.CASHLESS ? repayAmount : 0,
        upiLess: order.payment_mode === RepaymentMode.UPILESS ? repayAmount : 0,
        kvbLess: order.payment_mode === RepaymentMode.KVBLESS ? repayAmount : 0,
      };
    })
    .filter(
      (row) =>
        row.cashIn > 0 ||
        row.accountIn > 0 ||
        row.upiIn > 0 ||
        row.cashLess > 0 ||
        row.upiLess > 0 ||
        row.kvbLess > 0
    );

  const colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'dateTime',
      headerName: 'Date and Time',
      minWidth: 150,
      valueFormatter: (params) => {
        const date = params.value ? new Date(params.value) : '';
        return date ? dayjs(date).format('DD-MMM-YYYY hh:mm A') : '';
      },
    },
    {
      field: 'inDate',
      headerName: 'In Date',
      minWidth: 120,
      valueFormatter: (params) => {
        const date = params.value ? new Date(params.value) : '';
        return date ? dayjs(date).format('DD-MMM-YYYY') : '';
      },
    },
    {
      field: 'customerName',
      headerName: 'Customer name',
      minWidth: 200,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      minWidth: 150,
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
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-1/2 h-5/6 max-w-none max-h-none bg-white rounded-lg p-4">
        <div className="flex w-full text-center">
          <p className="text-primary text-xl font-semibold w-full">Mani Power Tools</p>
          <MdClose size={25} className="cursor-pointer" onClick={onClose} />
        </div>
        <p className="text-primary text-center text-lg font-semibold w-full">Petty Cash</p>
        <div className="flex flex-col gap-3 h-full w-full px-3 overflow-y-auto scrollbar-stable">
          {/* Petty Cash content goes here */}
          <CustomTable
            rowData={rowData}
            colDefs={colDefs}
            isLoading={!isRentalOrdersQuerySuccess}
          />
        </div>
        <div className="flex w-full gap-3 justify-end">
          <CustomButton onClick={onClose} label="Close" variant="outlined" className="bg-white" />
        </div>
      </div>
    </Modal>
  );
};

export default PettyCashDialog;
