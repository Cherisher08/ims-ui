import { Modal } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { MdClose } from 'react-icons/md';
import CustomButton from '../../../styled/CustomButton';
import CustomDatePicker from '../../../styled/CustomDatePicker';
import CustomInput from '../../../styled/CustomInput';
import CustomSelect from '../../../styled/CustomSelect';
import { DepositType, PaymentMode, ProductDetails } from '../../../types/order';
import { IdNamePair } from '../Stocks';

type DepositModalType = {
  depositOpen: boolean;
  setDepositOpen: (value: boolean) => void;
  depositData: DepositType[];
  productData: ProductDetails[];
  setDepositData: React.Dispatch<React.SetStateAction<DepositType[]>>;
};

const paymentModeOptions = Object.entries(PaymentMode).map(([key, value]) => ({
  id: key,
  value,
}));

const formatProducts = (products: IdNamePair[]) => {
  return products.map((product) => ({
    id: product._id || '',
    value: product.name,
  }));
};

const DepositModal = ({
  depositOpen,
  setDepositOpen,
  productData,
  depositData,
  setDepositData,
}: DepositModalType) => {
  const products = productData.map((product) => {
    return {
      _id: product._id,
      name: product.name,
    };
  });
  const handleAddDeposit = () => {
    setDepositData([
      ...depositData,
      {
        amount: 0,
        date: dayjs().format('YYYY-MM-DDTHH:mm'),
        mode: PaymentMode.CASH,
        product: products[0],
      },
    ]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDepositChange = (field: string, value: any, index: number) => {
    const data = depositData.map((deposit, idx) =>
      index === idx
        ? {
            ...deposit,
            [field]: value,
          }
        : deposit
    );
    setDepositData(data);
  };

  return (
    <Modal
      open={depositOpen}
      onClose={() => {
        setDepositOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-4/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">Deposits</p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setDepositOpen(false);
            }}
          />
        </div>
        <div className="w-full flex justify-end">
          <CustomButton label="Add deposit" onClick={handleAddDeposit} />
        </div>

        <div className="bg-gray-200 rounded-sm px-2 py-4 w-full flex flex-col overflow-y-auto">
          {depositData.map((deposit: DepositType, index: number) => (
            <div className="grid grid-cols-4 gap-2 justify-between">
              <CustomInput
                label="Amount"
                labelClass="mt-2 text-center"
                value={deposit.amount}
                type="number"
                placeholder="Enter Amount"
                onChange={(value) => handleDepositChange('amount', parseFloat(value), index)}
              />
              <CustomDatePicker
                label="Date"
                labelClass="!min-w-[3rem] w-[3rem]"
                value={deposit.date}
                onChange={(value) => handleDepositChange('date', value, index)}
              />
              <CustomSelect
                label="Product"
                labelClass="!w-[4rem]"
                value={
                  formatProducts(products).find((prod) =>
                    deposit.product ? prod.id === deposit.product._id : false
                  )?.id ?? ''
                }
                options={formatProducts(products)}
                onChange={(id) =>
                  handleDepositChange(
                    'product',
                    products.find((prod) => prod._id === id),
                    index
                  )
                }
              />
              <CustomSelect
                label="Payment Status"
                className="w-[10rem]"
                labelClass="w-fit"
                options={paymentModeOptions}
                value={paymentModeOptions.find((opt) => opt.value === deposit?.mode)?.id ?? ''}
                onChange={(id) =>
                  handleDepositChange(
                    'mode',
                    paymentModeOptions.find((opt) => opt.id === id)?.value as PaymentMode,
                    index
                  )
                }
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 my-3 w-full justify-end">
          <CustomButton label="Cancel" onClick={() => setDepositOpen(false)} variant="outlined" />
          <CustomButton label="Done" onClick={() => setDepositOpen(false)} />
        </div>
      </div>
    </Modal>
  );
};

export default DepositModal;
