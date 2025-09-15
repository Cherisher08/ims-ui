import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetContactByIdQuery } from '../../../services/ContactService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import { ContactInfoType } from '../../../types/contact';
import { PaymentStatus, RentalOrderInfo, RentalOrderType } from '../../../types/order';
import { calculateFinalAmount } from '../Orders/utils';
import { Box, Typography } from '@mui/material';

const CustomerBills = () => {
  const { id } = useParams();
  const { data: rentalOrderData } = useGetRentalOrdersQuery();

  const { data: customer } = useGetContactByIdQuery(id!, {
    skip: !id,
  });

  const [customerOrders, setCustomerOrders] = useState<RentalOrderInfo[]>([]);
  const [customerDetails, setCustomerDetails] = useState<ContactInfoType>();

  const getTransactionRows = (orders: RentalOrderInfo[]) => {
    const rows: {
      date: string;
      paymentMode: string;
      billAmount: number;
      receivedAmount: number;
      repaidAmount: number;
    }[] = [];

    orders.forEach((order) => {
      const billAmount = calculateFinalAmount(order as RentalOrderType);

      // 1. Deposits (can be multiple per order)
      order.deposits.forEach((deposit) => {
        rows.push({
          date: deposit.date ? dayjs(deposit.date).format('DD-MM-YYYY') : '',
          paymentMode: deposit.mode || order.payment_mode || '-',
          billAmount: 0,
          receivedAmount: deposit.amount,
          repaidAmount: 0,
        });
      });

      // 2. Balance Paid (if present and > 0)
      if (order.balance_paid && order.balance_paid > 0) {
        rows.push({
          date: order.balance_paid_date
            ? dayjs(order.balance_paid_date).format('DD-MM-YYYY')
            : order.in_date
            ? dayjs(order.in_date).format('DD-MM-YYYY')
            : '',
          paymentMode: order.balance_paid_mode || order.payment_mode || '-',
          billAmount: 0,
          receivedAmount: order.balance_paid,
          repaidAmount: 0,
        });
      }

      // 3. Repayment (if present and > 0)
      const repaid_amount =
        order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0) - billAmount;
      if (order.status === PaymentStatus.PAID && repaid_amount > 0) {
        rows.push({
          date: order.repay_date
            ? dayjs(order.repay_date).format('DD-MM-YYYY')
            : order.in_date
            ? dayjs(order.in_date).format('DD-MM-YYYY')
            : '',
          paymentMode: order.payment_mode || '-',
          billAmount: 0,
          receivedAmount: 0,
          repaidAmount: repaid_amount,
        });
      }

      // 4. If no deposits, balance paid, or repayment, just show bill
      // if (
      //   (!order.deposits || order.deposits.length === 0) &&
      //   (!order.balance_paid || order.balance_paid === 0) &&
      //   order.status !== PaymentStatus.PAID
      // ) {
      rows.push({
        date: order.out_date ? dayjs(order.out_date).format('DD-MM-YYYY') : '',
        paymentMode: order.payment_mode || '-',
        billAmount,
        receivedAmount: 0,
        repaidAmount: 0,
      });
      // }
    });

    // Step 2: Group by date
    const grouped: Record<string, (typeof rows)[0]> = {};
    rows.forEach((row) => {
      if (!row.date) return;
      if (!grouped[row.date]) {
        grouped[row.date] = { ...row };
      } else {
        grouped[row.date].billAmount += row.billAmount;
        grouped[row.date].receivedAmount += row.receivedAmount;
        grouped[row.date].repaidAmount += row.repaidAmount;
        // Optionally, you can concatenate payment modes if needed:
        if (!grouped[row.date].paymentMode.includes(row.paymentMode)) {
          grouped[row.date].paymentMode += `, ${row.paymentMode}`;
        }
      }
    });

    // Step 3: Sort by date and return as array
    return Object.values(grouped).sort(
      (a, b) => dayjs(a.date, 'DD-MM-YYYY').unix() - dayjs(b.date, 'DD-MM-YYYY').unix()
    );
    // rows.sort((a, b) => dayjs(a.date, 'DD-MM-YYYY').unix() - dayjs(b.date, 'DD-MM-YYYY').unix());

    // return rows;
  };

  const transactionRows = getTransactionRows(customerOrders);

  useEffect(() => {
    if (rentalOrderData && id) {
      const filtered = rentalOrderData.filter((order) => order.customer?._id === id);
      setCustomerOrders(filtered);
    }
  }, [id, rentalOrderData]);

  useEffect(() => {
    if (customer) {
      setCustomerDetails(customer);
    }
  }, [customer]);

  const calculateTotalBillAmount = () => {
    const total = transactionRows.reduce((sum, row) => sum + (row.billAmount || 0), 0);
    return total;
  };

  const calculateTotalReceivedAmount = () => {
    const total = transactionRows.reduce((sum, row) => sum + (row.receivedAmount || 0), 0);
    return total;
  };

  const calculateTotalRepaidAmount = () => {
    const total = transactionRows.reduce((sum, row) => sum + (row.repaidAmount || 0), 0);
    return total;
  };

  const calculateTotalOutstandingAmount = () => {
    const total = transactionRows.reduce(
      (sum, row) =>
        sum + (row.billAmount || 0) - (row.receivedAmount || 0) + (row.repaidAmount || 0),
      0
    );
    return total;
  };

  return (
    <div>
      <div className="w-full h-fit flex flex-col">
        <div className="w-full flex justify-between my-2">
          {/* <CustomButton
            label="Add Deposit"
            onClick={() => {
              const newDeposit = getDefaultDeposit(products);
              setDepositData((prev) => {
                if (prev) return [...prev, newDeposit];
                else return [newDeposit];
              });
            }}
          /> */}
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xl">CUSTOMER HISTORY</p>
          <p className="text-lg font-semibold">
            {customerDetails?.name} - {customerDetails?.personal_number}
          </p>
        </div>
        <table className="w-full table-auto border-3 border-gray-300">
          <thead>
            <tr className="bg-primary text-white border-b-3 border-gray-300">
              <th className="px-1 py-1 text-left ">S.No</th>
              <th className="px-1 py-1 text-left ">Date</th>
              <th className="px-1 py-1 text-left ">Payment Mode</th>
              <th className="px-1 py-1 text-left ">Bill Amount</th>
              <th className="px-1 py-1 text-left ">Received Amount</th>
              <th className="px-1 py-1 text-left ">Repaid Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactionRows.length > 0 ? (
              transactionRows.map((order, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-1 py-1">{index + 1}</td>
                  <td className="px-1 py-1">{transactionRows[index].date}</td>
                  <td className="px-1 py-1">{transactionRows[index].paymentMode}</td>
                  <td className="px-1 py-1">{transactionRows[index].billAmount}</td>
                  <td className="px-1 py-1">{transactionRows[index].receivedAmount}</td>
                  <td className="px-1 py-1">{transactionRows[index].repaidAmount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-[5rem] text-center py-4">
                  No Bills Available...
                </td>
              </tr>
            )}
            {customerOrders.length > 0 && (
              <tr className="border-b border-gray-200 bg-gray-100">
                <td></td>
                <td></td>
                <td className="font-semibold">Total</td>
                <td className="px-1 py-1 font-semibold">{`₹${calculateTotalBillAmount().toFixed(
                  2
                )}`}</td>
                <td className="px-1 py-1 font-semibold">{`₹${calculateTotalReceivedAmount().toFixed(
                  2
                )}`}</td>
                <td className="px-1 py-1 font-semibold">{`₹${calculateTotalRepaidAmount().toFixed(
                  2
                )}`}</td>
              </tr>
            )}
          </tbody>
        </table>
        <Box className="flex justify-end mt-4 align-middle gap-2">
          <Typography className="font-semibold p-1">Outstanding Amount: </Typography>
          <Typography
            className={`${
              Number(calculateTotalOutstandingAmount()) === 0 ? 'bg-green-400' : 'bg-red-400'
            } font-semibold p-1 w-[5rem] border border-black border-t-2 border-b-2 border-l-0 border-r-0 text-center`}
          >
            {`₹${calculateTotalOutstandingAmount().toFixed(2)}`}
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default CustomerBills;
