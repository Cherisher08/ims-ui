import Modal from '@mui/material/Modal';
import { FC } from 'react';
import { MdClose } from 'react-icons/md';
import CustomButton from '../../styled/CustomButton';
import CustomTable from '../../styled/CustomTable';
import { CellEditingStoppedEvent, ColDef, ColGroupDef } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useGetRentalOrdersQuery } from '../../services/OrderService';
import { useGetContactsQuery } from '../../services/ContactService';
import {
  useGetPettyCashesQuery,
  useCreatePettyCashMutation,
  useUpdatePettyCashMutation,
} from '../../services/PettyCashService';
import { PaymentMode, RepaymentMode, RentalOrderType } from '../../types/order';
import { calculateFinalAmount } from '../../pages/private/Orders/utils';

interface PettyCashDialogProps {
  open: boolean;
  onClose: () => void;
}

interface RowData {
  dateTime: string | null;
  inDate: string;
  customerName: string;
  phoneNumber: string;
  cashIn: number;
  accountIn: number;
  upiIn: number;
  cashLess: number;
  upiLess: number;
  kvbLess: number;
  isPettyCash?: boolean;
  _id?: string;
}

const PettyCashDialog: FC<PettyCashDialogProps> = ({ open, onClose }) => {
  const { data: rentalOrders, isSuccess: isRentalOrdersQuerySuccess } = useGetRentalOrdersQuery();
  const { data: contacts, isSuccess: isContactsQuerySuccess } = useGetContactsQuery();
  const { data: pettyCashes, isSuccess: isPettyCashesQuerySuccess } = useGetPettyCashesQuery();
  const [createPettyCash] = useCreatePettyCashMutation();
  const [updatePettyCash] = useUpdatePettyCashMutation();

  const addNewEntry = () => {
    const newPettyCash = {
      created_date: new Date().toISOString(),
      customer: {
        _id: '',
        name: '',
        personal_number: '',
        office_number: '',
        email: '',
        address: '',
        gstin: '',
        pincode: '',
        company_name: '',
        address_proof: '',
      },
      balance_paid: 0,
      balance_paid_mode: PaymentMode.CASH,
      payment_mode: RepaymentMode.CASHLESS,
      repay_amount: 0,
    };
    createPettyCash(newPettyCash);
  };

  const handleCellEditingStopped = (params: CellEditingStoppedEvent<RowData>) => {
    if (params.data?.isPettyCash && params.colDef.field && params.data._id) {
      const pettyCash = pettyCashes?.find((pc) => pc._id === params.data?._id);
      if (!pettyCash) return;

      const updatedPettyCash = { ...pettyCash };

      // Handle different field updates
      if (params.colDef.field === 'customerName') {
        const contact = contacts?.find((c) => c.name === params.newValue);
        if (contact) {
          updatedPettyCash.customer = {
            ...updatedPettyCash.customer,
            _id: contact._id,
            name: params.newValue,
            personal_number: contact.personal_number || '',
            office_number: contact.office_number || '',
          };
        } else {
          updatedPettyCash.customer = {
            ...updatedPettyCash.customer,
            name: params.newValue,
          };
        }
      } else if (params.colDef.field === 'phoneNumber') {
        const contact = contacts?.find(
          (c) => c.personal_number === params.newValue || c.office_number === params.newValue
        );
        if (contact) {
          updatedPettyCash.customer = {
            ...updatedPettyCash.customer,
            _id: contact._id,
            name: contact.name,
            personal_number: params.newValue,
            office_number: contact.office_number || '',
          };
        } else {
          updatedPettyCash.customer = {
            ...updatedPettyCash.customer,
            personal_number: params.newValue,
          };
        }
      } else if (params.colDef.field === 'cashIn') {
        updatedPettyCash.balance_paid = params.newValue;
        updatedPettyCash.balance_paid_mode = PaymentMode.CASH;
      } else if (params.colDef.field === 'accountIn') {
        updatedPettyCash.balance_paid = params.newValue;
        updatedPettyCash.balance_paid_mode = PaymentMode.ACCOUNT;
      } else if (params.colDef.field === 'upiIn') {
        updatedPettyCash.balance_paid = params.newValue;
        updatedPettyCash.balance_paid_mode = PaymentMode.UPI;
      } else if (params.colDef.field === 'cashLess') {
        updatedPettyCash.repay_amount = params.newValue;
        updatedPettyCash.payment_mode = RepaymentMode.CASHLESS;
      } else if (params.colDef.field === 'upiLess') {
        updatedPettyCash.repay_amount = params.newValue;
        updatedPettyCash.payment_mode = RepaymentMode.UPILESS;
      } else if (params.colDef.field === 'kvbLess') {
        updatedPettyCash.repay_amount = params.newValue;
        updatedPettyCash.payment_mode = RepaymentMode.KVBLESS;
      }

      updatePettyCash(updatedPettyCash);
    }
  };

  // Filter orders with transactions today
  const today = dayjs().startOf('day');
  const paidTodayOrders =
    rentalOrders?.filter(
      (order) =>
        (order.balance_paid_date && dayjs(order.balance_paid_date).isSame(today, 'day')) ||
        (order.repay_date && dayjs(order.repay_date).isSame(today, 'day')) ||
        order.deposits.some((deposit) => dayjs(deposit.date).isSame(today, 'day'))
    ) || [];

  // Process row data
  const processedRowData = paidTodayOrders
    .map((order) => {
      const totalDeposits = order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
      const billAmount = calculateFinalAmount(order as RentalOrderType);
      const repayAmount = totalDeposits - billAmount;

      // Determine the transaction date that matched today
      let transactionDate = null;
      if (order.balance_paid_date && dayjs(order.balance_paid_date).isSame(today, 'day')) {
        transactionDate = order.balance_paid_date;
      } else if (order.repay_date && dayjs(order.repay_date).isSame(today, 'day')) {
        transactionDate = order.repay_date;
      } else {
        const matchingDeposit = order.deposits.find((deposit) =>
          dayjs(deposit.date).isSame(today, 'day')
        );
        transactionDate = matchingDeposit ? matchingDeposit.date : order.invoice_date;
      }

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
        dateTime: transactionDate,
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

  // Filter petty cash data for today
  const todayPettyCashes =
    pettyCashes?.filter((pettyCash) => dayjs(pettyCash.created_date).isSame(today, 'day')) || [];

  // Process petty cash data
  const processedPettyCashData = todayPettyCashes.map((pettyCash) => ({
    dateTime: pettyCash.created_date,
    inDate: pettyCash.created_date,
    customerName: pettyCash.customer?.name || '',
    phoneNumber: pettyCash.customer?.personal_number || pettyCash.customer?.office_number || '',
    cashIn: pettyCash.balance_paid_mode === PaymentMode.CASH ? pettyCash.balance_paid : 0,
    accountIn: pettyCash.balance_paid_mode === PaymentMode.ACCOUNT ? pettyCash.balance_paid : 0,
    upiIn: pettyCash.balance_paid_mode === PaymentMode.UPI ? pettyCash.balance_paid : 0,
    cashLess: pettyCash.payment_mode === RepaymentMode.CASHLESS ? pettyCash.repay_amount : 0,
    upiLess: pettyCash.payment_mode === RepaymentMode.UPILESS ? pettyCash.repay_amount : 0,
    kvbLess: pettyCash.payment_mode === RepaymentMode.KVBLESS ? pettyCash.repay_amount : 0,
    isPettyCash: true,
    _id: pettyCash._id,
  }));

  const rowData = [...processedPettyCashData, ...processedRowData];

  // Create dropdown options for customer name and phone number
  const customerNameOptions = contacts?.map((contact) => contact.name) || [];
  const phoneNumberOptions =
    contacts?.flatMap((contact) =>
      [contact.personal_number, contact.office_number].filter(Boolean)
    ) || [];

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
      editable: (params) => params.data?.isPettyCash || false,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: customerNameOptions,
      },
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      minWidth: 150,
      editable: (params) => params.data?.isPettyCash || false,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: phoneNumberOptions,
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
          editable: (params) => params.data?.isPettyCash || false,
        },
        {
          field: 'accountIn',
          headerName: 'HDFC In',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
          editable: (params) => params.data?.isPettyCash || false,
        },
        {
          field: 'upiIn',
          headerName: 'Gpay In',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
          editable: (params) => params.data?.isPettyCash || false,
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
          editable: (params) => params.data?.isPettyCash || false,
        },
        {
          field: 'upiLess',
          headerName: 'Gpay Less',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
          editable: (params) => params.data?.isPettyCash || false,
        },
        {
          field: 'kvbLess',
          headerName: 'KVB Less',
          minWidth: 150,
          valueFormatter: (params) => `₹ ${params.value || 0}`,
          editable: (params) => params.data?.isPettyCash || false,
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
        <div className="relative w-full flex justify-center items-center">
          <p className="text-primary text-xl font-semibold">Mani Power Tools</p>
          <div className="absolute right-0 flex gap-3 items-center">
            <CustomButton onClick={addNewEntry} label="Add Entry" variant="contained" />
            <MdClose size={25} className="cursor-pointer" onClick={onClose} />
          </div>
        </div>
        <p className="text-primary text-center text-lg font-semibold w-full">Petty Cash</p>
        <div className="flex flex-col gap-3 h-full w-full px-3 overflow-y-auto scrollbar-stable">
          {/* Petty Cash content goes here */}
          <CustomTable
            rowData={rowData}
            colDefs={colDefs}
            isLoading={
              !isRentalOrdersQuerySuccess && !isContactsQuerySuccess && !isPettyCashesQuerySuccess
            }
            handleCellEditingStopped={handleCellEditingStopped}
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
