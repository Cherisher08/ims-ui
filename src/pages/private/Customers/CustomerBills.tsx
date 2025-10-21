import dayjs from 'dayjs';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetContactByIdQuery } from '../../../services/ContactService';
import { useGetRentalOrdersQuery } from '../../../services/OrderService';
import { ProductType } from '../../../types/common';
import { ContactInfoType } from '../../../types/contact';
import {
  DepositType,
  PaymentStatus,
  ProductDetails,
  RentalOrderInfo,
  RentalOrderType,
} from '../../../types/order';
import { calculateFinalAmount, calculateTotalAmount } from '../Orders/utils';
import CustomButton from '../../../styled/CustomButton';
import { LuPlus } from 'react-icons/lu';
import AddBalanceModal, { BalanceData } from '../Entries/AddBalanceModal';
import { usePatchRentalOrderMutation } from '../../../services/OrderService';
import { PatchOperation } from '../../../types/common';

const CustomerBills = () => {
  const { id } = useParams();
  const { data: rentalOrderData } = useGetRentalOrdersQuery();

  const { data: customer } = useGetContactByIdQuery(id!, {
    skip: !id,
  });

  const [customerOrders, setCustomerOrders] = useState<RentalOrderInfo[]>([]);
  const [customerDetails, setCustomerDetails] = useState<ContactInfoType>();
  const [showAddBalanceModal, setShowAddBalanceModal] = useState<boolean>(false);

  const [patchRentalOrder] = usePatchRentalOrderMutation();

  // const getTransactionRows = (orders: RentalOrderInfo[]) => {
  //   const rows: {
  //     date: string;
  //     paymentMode: string;
  //     billAmount: number;
  //     receivedAmount: number;
  //     repaidAmount: number;
  //   }[] = [];

  //   orders.forEach((order) => {
  //     const billAmount = calculateFinalAmount(order as RentalOrderType);

  //     // 1. Deposits (can be multiple per order)
  //     order.deposits.forEach((deposit) => {
  //       rows.push({
  //         date: deposit.date ? dayjs(deposit.date).format('DD-MM-YYYY') : '',
  //         paymentMode: deposit.mode || order.payment_mode || '-',
  //         billAmount: 0,
  //         receivedAmount: deposit.amount,
  //         repaidAmount: 0,
  //       });
  //     });

  //     // 2. Balance Paid (if present and > 0)
  //     if (order.balance_paid && order.balance_paid > 0) {
  //       rows.push({
  //         date: order.balance_paid_date
  //           ? dayjs(order.balance_paid_date).format('DD-MM-YYYY')
  //           : order.in_date
  //           ? dayjs(order.in_date).format('DD-MM-YYYY')
  //           : '',
  //         paymentMode: order.balance_paid_mode || order.payment_mode || '-',
  //         billAmount: 0,
  //         receivedAmount: order.balance_paid,
  //         repaidAmount: 0,
  //       });
  //     }

  //     // 3. Repayment (if present and > 0)
  //     const repaid_amount =
  //       order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0) - billAmount;
  //     if (order.status === PaymentStatus.PAID && repaid_amount > 0) {
  //       rows.push({
  //         date: order.repay_date
  //           ? dayjs(order.repay_date).format('DD-MM-YYYY')
  //           : order.in_date
  //           ? dayjs(order.in_date).format('DD-MM-YYYY')
  //           : '',
  //         paymentMode: order.payment_mode || '-',
  //         billAmount: 0,
  //         receivedAmount: 0,
  //         repaidAmount: repaid_amount,
  //       });
  //     }

  //     // 4. If no deposits, balance paid, or repayment, just show bill
  //     // if (
  //     //   (!order.deposits || order.deposits.length === 0) &&
  //     //   (!order.balance_paid || order.balance_paid === 0) &&
  //     //   order.status !== PaymentStatus.PAID
  //     // ) {
  //     rows.push({
  //       date: order.out_date ? dayjs(order.out_date).format('DD-MM-YYYY') : '',
  //       paymentMode: order.payment_mode || '-',
  //       billAmount,
  //       receivedAmount: 0,
  //       repaidAmount: 0,
  //     });
  //     // }
  //   });

  //   // Step 2: Group by date
  //   const grouped: Record<string, (typeof rows)[0]> = {};
  //   rows.forEach((row) => {
  //     if (!row.date) return;
  //     if (!grouped[row.date]) {
  //       grouped[row.date] = { ...row };
  //     } else {
  //       grouped[row.date].billAmount += row.billAmount;
  //       grouped[row.date].receivedAmount += row.receivedAmount;
  //       grouped[row.date].repaidAmount += row.repaidAmount;
  //       // Optionally, you can concatenate payment modes if needed:
  //       if (!grouped[row.date].paymentMode.includes(row.paymentMode)) {
  //         grouped[row.date].paymentMode += `, ${row.paymentMode}`;
  //       }
  //     }
  //   });

  //   // Step 3: Sort by date and return as array
  //   return Object.values(grouped).sort(
  //     (a, b) => dayjs(a.date, 'DD-MM-YYYY').unix() - dayjs(b.date, 'DD-MM-YYYY').unix()
  //   );
  //   // rows.sort((a, b) => dayjs(a.date, 'DD-MM-YYYY').unix() - dayjs(b.date, 'DD-MM-YYYY').unix());

  //   // return rows;
  // };

  // const transactionRows = getTransactionRows(customerOrders);

  useEffect(() => {
    if (rentalOrderData && id) {
      const filtered = rentalOrderData.filter((order) => order.customer?._id === id);

      const orders = splitOrdersByDate(filtered);
      setCustomerOrders(orders.sort((a, b) => dayjs(a.out_date).diff(dayjs(b.out_date))));
      // setCustomerOrders(filtered);
    }
  }, [id, rentalOrderData]);

  function splitOrdersByDate(orders: RentalOrderInfo[]) {
    const formatDate = (date: string | null) => {
      if (!date) return null;
      return new Date(date).toISOString().split('T')[0];
    };

    const splitOrders: RentalOrderInfo[] = [];

    orders.forEach((currentOrder) => {
      let order = {
        ...currentOrder,
      };

      const orderOutDate = formatDate(order.out_date);
      const remainingProducts: ProductDetails[] = [];
      const remainingDeposits: DepositType[] = [];
      const extraOrders: RentalOrderInfo[] = [];

      order.product_details?.forEach((p: ProductDetails) => {
        const productOutDate = formatDate(p.out_date);

        if (productOutDate && productOutDate !== orderOutDate) {
          let newOrder = extraOrders.find((o) => formatDate(o.out_date) === productOutDate);
          if (!newOrder) {
            newOrder = {
              ...order,
              out_date: p.out_date,
              product_details: [],
              deposits: [],
            };
            extraOrders.push(newOrder);
          }
          newOrder.product_details.push(p);
        } else {
          remainingProducts.push(p);
        }
      });

      order.deposits?.forEach((d: DepositType) => {
        const depDate = formatDate(d.date);

        if (depDate && depDate !== orderOutDate) {
          let newOrder = extraOrders.find((o) => formatDate(o.out_date) === depDate);
          if (!newOrder) {
            newOrder = {
              ...order,
              out_date: d.date,
              product_details: [],
              deposits: [],
            };
            extraOrders.push(newOrder);
          }
          newOrder.deposits.push(d);
        } else {
          remainingDeposits.push(d);
        }
      });

      const balancePaidDate = formatDate(order.balance_paid_date);
      if (balancePaidDate && balancePaidDate !== orderOutDate) {
        let newOrder = extraOrders.find((o) => formatDate(o.out_date) === balancePaidDate);
        if (!newOrder) {
          newOrder = {
            ...order,
            out_date: order.balance_paid_date,
            product_details: [],
            deposits: [],
            balance_paid: order.balance_paid,
            balance_paid_date: order.balance_paid_date,
          };

          extraOrders.push(newOrder);
        } else {
          newOrder.balance_paid = order.balance_paid;
          newOrder.balance_paid_date = order.balance_paid_date;
        }
        order = {
          ...order,
          balance_paid: 0,
          balance_paid_date: '',
        };
      }

      if (remainingDeposits.length > 0 && order.status === PaymentStatus.PAID) {
        const excess =
          order.deposits.reduce((total, deposit) => total + deposit.amount, 0) -
          calculateFinalAmount(order as RentalOrderType);
        order = {
          ...order,
          repay_amount: excess > 0 ? excess : 0,
        };
      }

      if (extraOrders.length > 0) {
        const billAmount = calculateFinalAmount(order as RentalOrderType);
        const allDeposits: { order: RentalOrderInfo; dep: DepositType }[] = [];
        remainingDeposits.forEach((dep) => allDeposits.push({ order, dep }));
        extraOrders.forEach((eo) =>
          eo.deposits.forEach((dep) => allDeposits.push({ order: eo, dep }))
        );
        let runningTotal = 0;
        allDeposits.forEach(({ order, dep }, i) => {
          runningTotal += dep.amount;

          if (i === allDeposits.length - 1 && runningTotal > billAmount) {
            const repay = runningTotal - billAmount;
            // order = {
            //   ...order,
            //   repay_amount: repay,
            // };
            order.repay_amount = repay;
          } else {
            // order = {
            //   ...order,
            //   repay_amount: 0,
            // };
            order.repay_amount = 0;
          }
        });
      }

      if (remainingProducts.length > 0 || remainingDeposits.length > 0) {
        splitOrders.push({
          ...order,
          product_details: remainingProducts,
          deposits: remainingDeposits,
        });
      }

      splitOrders.push(...extraOrders);
    });

    return splitOrders;
  }

  useEffect(() => {
    if (customer) {
      setCustomerDetails(customer);
    }
  }, [customer]);

  const calculateTotalBillAmount = () => {
    const total = customerOrders.reduce(
      (total, order) => total + calculateTotalAmount(order as RentalOrderType),
      0
    );
    return total;
  };

  const calculateTotalReceivedAmount = () => {
    const totalDeposits = customerOrders.reduce(
      (total, order) => total + order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0),
      0
    );
    const totalReceivedAmount =
      customerOrders.reduce((total, order) => total + order.balance_paid, 0) || 0;

    const totalRepayment =
      customerOrders.reduce((total, order) => total + order.repay_amount, 0) || 0;
    return totalDeposits + totalReceivedAmount - totalRepayment;
  };

  // const calculateTotalOutstandingAmount = () => {
  //   const total = transactionRows.reduce(
  //     (sum, row) =>
  //       sum + (row.billAmount || 0) - (row.receivedAmount || 0) + (row.repaidAmount || 0),
  //     0
  //   );
  //   return total;
  // };

  const findOrderType = (order: RentalOrderType): string => {
    const products = order.product_details;
    const isRental = products.find((prod) => prod.type === ProductType.RENTAL);
    const isSales = products.find((prod) => prod.type === ProductType.SALES);
    if (isRental && isSales) return 'RENTAL, SALES';
    else if (isRental) return 'RENTAL';
    else if (isSales) return 'SALES';
    else return '-';
  };

  // const findPaymentMode = (order: RentalOrderType): string => {
  //   const str = [];
  //   if (order.deposits.length === 1) {
  //     str.push(`Deposit - ${order.deposits[0].mode}`);
  //   }
  //   if (order.balance_paid && order.balance_paid_mode === '-') {
  //     str.push(`Balance - ${order.balance_paid_mode}\n`);
  //   }
  //   if (order.payment_mode !== '-') str.push(`Repay - ${order.payment_mode}`);

  //   if (str.length === 0) str.push('-');
  //   return str.join(', ');
  // };

  const findPaymentMode = (order: RentalOrderType): JSX.Element => {
    const elements: JSX.Element[] = [];

    if (order.deposits.length > 0) {
      elements.push(<span key="dep">Deposit - {order.deposits[0].mode}</span>);
      elements.push(<br key="dep-br" />);
    }

    if (order.balance_paid && order.balance_paid_mode !== '-') {
      elements.push(<span key="balance">Balance - {order.balance_paid_mode}</span>);
      elements.push(<br key="balance-br" />);
    }

    if (order.payment_mode !== '-') {
      elements.push(<span key="repay">Repay - {order.payment_mode}</span>);
    }

    if (elements.length === 0) return <>-</>;

    return <>{elements}</>;
  };

  const setBalancePaidToOrders = async (balanceData: BalanceData) => {
    let remainingAmount = balanceData.amount;

    // Filter rental orders for the current customer
    const rentalOrders = rentalOrderData?.filter(
      (order) => order.customer?._id === id
    ) as RentalOrderType[];

    // Sort orders by out_date to process in chronological order
    const sortedOrders = rentalOrders.sort((a, b) => dayjs(a.out_date).diff(dayjs(b.out_date)));

    for (const order of sortedOrders) {
      if (remainingAmount <= 0) break;

      // Calculate outstanding amount for this order
      const billAmount = calculateFinalAmount(order as RentalOrderType);
      const deposits = order.deposits.reduce((sum, dep) => sum + dep.amount, 0);
      const repayAmount = order.repay_amount || 0;
      const outstanding = billAmount - deposits + repayAmount;

      if (outstanding > 0) {
        const amountToPay = Math.min(remainingAmount, outstanding);

        // Create patch payload
        const patchPayload: PatchOperation[] = [
          {
            op: 'replace',
            path: '/balance_paid',
            value: (order.balance_paid || 0) + amountToPay,
          },
          {
            op: 'replace',
            path: '/balance_paid_date',
            value: balanceData.date,
          },
          {
            op: 'replace',
            path: '/balance_paid_mode',
            value: balanceData.mode,
          },
        ];

        // Patch the order
        try {
          await patchRentalOrder({ id: order._id!, payload: patchPayload });
          remainingAmount -= amountToPay;
        } catch (error) {
          console.error('Failed to patch order:', error);
        }
      }
    }

    // If there is still remaining amount, add it as a deposit to the last order
    if (remainingAmount > 0 && sortedOrders.length > 0) {
      const lastOrder = sortedOrders[sortedOrders.length - 1];
      const newDeposit = {
        amount: remainingAmount,
        date: balanceData.date,
        mode: balanceData.mode,
        product: { _id: lastOrder.product_details[0]._id, name: lastOrder.product_details[0].name },
      };

      const patchPayload: PatchOperation[] = [
        {
          op: 'add',
          path: '/deposits',
          value: newDeposit,
        },
      ];

      try {
        await patchRentalOrder({ id: lastOrder._id!, payload: patchPayload });
      } catch (error) {
        console.error('Failed to add deposit to last order:', error);
      }
    }
  };

  const handleAddBalance = () => {
    setShowAddBalanceModal(true);
  };

  // const calculateRepayAmount = (order: RentalOrderType): string => {
  //   const depositData: DepositType[] = order.deposits ?? 0;
  //   if (order.status === PaymentStatus.PAID && order.product_details.length > 0) {
  //     const amount = Math.abs(
  //       Math.min(
  //         0,
  //         calculateFinalAmount(order) -
  //           depositData.reduce((total, deposit) => total + deposit.amount, 0)
  //       )
  //     ).toFixed(0);
  //     return amount === '0' ? '' : amount;
  //   } else return '';
  // };

  return (
    <div>
      <div className="w-full h-fit flex flex-col">
        <div className="flex gap-1 justify-between align-middle pb-1">
          <p className="text-xl">CUSTOMER HISTORY</p>
          <p className="text-lg font-semibold">
            {customerDetails?.name} - {customerDetails?.personal_number}
          </p>
          <CustomButton
            label={'Add Balance'}
            onClick={() => {
              handleAddBalance();
            }}
            icon={<LuPlus color="white" />}
          />
        </div>
        <table className="w-full table-auto border-3 border-gray-300">
          <thead>
            <tr className="bg-primary text-white border-b-3 border-gray-300">
              <th className="px-1 py-1 text-left ">S.No</th>
              <th className="px-1 py-1 text-left ">Date</th>
              <th className="px-1 py-1 text-left ">Type</th>
              <th className="px-1 py-1 text-left ">Mode</th>
              {/* <th className="px-1 py-1 text-left ">Payment Mode</th> */}
              <th className="px-1 py-1 text-left ">Deposit</th>
              <th className="px-1 py-1 text-left ">Repay</th>
              <th className="px-1 py-1 text-left ">Bill Amount</th>
              <th className="px-1 py-1 text-left ">Received Amount</th>
              {/* <th className="px-1 py-1 text-left ">Outstanding Amount</th> */}
            </tr>
          </thead>
          <tbody>
            {customerOrders.length > 0 ? (
              customerOrders.map((order, index) => (
                <tr key={index} className="border-b min-h-[2.5rem] border-gray-200">
                  <td className="px-1 py-1">{index + 1}</td>
                  <td className="px-1 py-1">{dayjs(order.out_date).format('DD-MM-YYYY')}</td>
                  <td className="px-1 py-1">{findOrderType(order as RentalOrderType)}</td>
                  <td className="px-1 py-1">{findPaymentMode(order as RentalOrderType)}</td>
                  <td className="px-1 py-1">
                    {order.deposits.reduce((sum, deposit) => sum + deposit.amount, 0) || '-'}
                  </td>
                  <td className="px-1 py-1">
                    {order.repay_amount}
                    {/* {calculateRepayAmount(order as RentalOrderType) || '-'} */}
                  </td>
                  <td
                    className={`px-1 py-1 ${
                      calculateFinalAmount(order as RentalOrderType) !== 0 &&
                      order.status === PaymentStatus.PENDING
                        ? 'bg-warning'
                        : ''
                    }`}
                  >
                    {calculateFinalAmount(order as RentalOrderType) > 0
                      ? calculateFinalAmount(order as RentalOrderType)
                      : 0}
                  </td>
                  <td className="px-1 py-1">{order.balance_paid || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="h-[5rem] text-center py-4">
                  No Bills Available...
                </td>
              </tr>
            )}
            {customerOrders.length > 0 && (
              <>
                <tr className="border-b border-gray-200 h-[2.5rem] bg-gray-100">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="font-semibold">Total</td>
                  <td className="px-1 py-1 font-semibold">{calculateTotalBillAmount()}</td>
                  <td className="px-1 py-1 font-semibold">{calculateTotalReceivedAmount()}</td>
                </tr>
                <tr className="border-b border-gray-200 h-[2.5rem] bg-gray-100">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="font-semibold">
                    {calculateTotalBillAmount() - calculateTotalReceivedAmount() >= 0
                      ? 'Balance Amount'
                      : 'Repay Amount'}
                  </td>
                  <td
                    className={`${
                      Number(calculateTotalBillAmount() - calculateTotalReceivedAmount()) === 0
                        ? 'bg-green-400'
                        : 'bg-red-400'
                    } font-semibold px-1 py-1`}
                  >
                    {Math.abs(calculateTotalBillAmount() - calculateTotalReceivedAmount())}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      <AddBalanceModal
        addBalanceOpen={showAddBalanceModal}
        setAddBalanceOpen={() => {
          setShowAddBalanceModal(false);
        }}
        setBalanceData={(balanceData) => {
          setBalancePaidToOrders(balanceData);
        }}
      />
    </div>
  );
};

export default CustomerBills;
