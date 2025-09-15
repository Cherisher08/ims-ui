import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetContactByIdQuery } from '../../../services/ContactService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import { ContactInfoType } from '../../../types/contact';
import { RentalOrderInfo, RentalOrderType } from '../../../types/order';
import { calculateFinalAmount } from '../Orders/utils';

const CustomerBills = () => {
  const { id } = useParams();
  const { data: rentalOrderData } = useGetRentalOrdersQuery();

  const { data: customer } = useGetContactByIdQuery(id!, {
    skip: !id,
  });

  const [customerOrders, setCustomerOrders] = useState<RentalOrderInfo[]>([]);
  const [customerDetails, setCustomerDetails] = useState<ContactInfoType>();

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
    const total = customerOrders.reduce(
      (total, order) => total + calculateFinalAmount(order as RentalOrderType),
      0
    );
    return total;
  };

  const calculateTotalReceivedAmount = () => {
    const total = customerOrders.reduce(
      (total, order) => total + order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0),
      0
    );
    return total;
  };

  const calculateTotalOutstandingAmount = () => {
    const total = customerOrders.reduce(
      (total, order) =>
        total +
        Math.abs(
          Math.max(
            0,
            calculateFinalAmount(order as RentalOrderType) -
              order.deposits.reduce((total, deposit) => total + deposit.amount, 0)
          )
        ),
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
              <th className="px-1 py-1 text-left ">Outstanding Amount</th>
            </tr>
          </thead>
          <tbody>
            {customerOrders.length > 0 ? (
              customerOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-1 py-1">{index + 1}</td>
                  <td className="px-1 py-1">{dayjs(order.out_date).format('DD-MM-YYYY')}</td>
                  <td className="px-1 py-1">{order.payment_mode}</td>
                  <td className="px-1 py-1">{calculateFinalAmount(order as RentalOrderType)}</td>
                  <td className="px-1 py-1">
                    {order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0)}
                  </td>
                  <td className="px-1 py-1">
                    {Math.max(
                      0,
                      calculateFinalAmount(order as RentalOrderType) -
                        order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
                    ).toFixed(2)}
                  </td>
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
                <td className="px-1 py-1 font-semibold">{calculateTotalBillAmount()}</td>
                <td className="px-1 py-1 font-semibold">{calculateTotalReceivedAmount()}</td>
                <td
                  className={`${
                    Number(calculateTotalOutstandingAmount()) === 0 ? 'bg-green-400' : 'bg-red-400'
                  } font-semibold px-1 py-1`}
                >
                  {calculateTotalOutstandingAmount()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerBills;
