import { Modal } from '@mui/material';
import { MdClose } from 'react-icons/md';
import CustomButton from '../../../styled/CustomButton';
import CustomDatePicker from '../../../styled/CustomDatePicker';
import CustomInput from '../../../styled/CustomInput';
import CustomSelect from '../../../styled/CustomSelect';
import { PaymentMode } from '../../../types/order';
import { useState } from 'react';

export type BalanceData = {
  amount: number;
  date: string;
  mode: PaymentMode;
};

type AddBalanceModalType = {
  addBalanceOpen: boolean;
  setAddBalanceOpen: (value: boolean) => void;
  setBalanceData: (balanceData: BalanceData) => void;
};

const paymentModeOptions = Object.entries(PaymentMode).map(([key, value]) => ({
  id: key,
  value,
}));

const AddBalanceModal = ({
  addBalanceOpen,
  setAddBalanceOpen,
  setBalanceData,
}: AddBalanceModalType) => {
  const [balanceData, setBalanceDataState] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    mode: PaymentMode.CASH,
  });

  const handleBalanceChange = (field: string, value: string | number) => {
    setBalanceDataState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      open={addBalanceOpen}
      onClose={() => {
        setAddBalanceOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-2/5 max-h-3/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">New Balance</p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setAddBalanceOpen(false);
            }}
          />
        </div>

        <div className="bg-gray-200 rounded-sm px-2 py-4 w-full flex flex-col overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 justify-between">
            <CustomInput
              label="Amount"
              value={balanceData.amount.toString()}
              type="number"
              placeholder="Enter Amount"
              onChange={(value) => handleBalanceChange('amount', parseFloat(value))}
            />
            <CustomDatePicker
              label="Date"
              labelClass="!min-w-[3rem] w-[3rem]"
              value={balanceData.date}
              onChange={(value) => handleBalanceChange('date', value)}
            />
            <CustomSelect
              label="Payment Status"
              className="w-[15rem]"
              labelClass="w-fit"
              options={paymentModeOptions}
              value={paymentModeOptions.find((opt) => opt.value === balanceData?.mode)?.id ?? ''}
              onChange={(id) =>
                handleBalanceChange(
                  'mode',
                  paymentModeOptions.find((opt) => opt.id === id)?.value as PaymentMode
                )
              }
            />
          </div>
        </div>

        <div className="flex gap-4 my-3 w-full justify-end">
          <CustomButton
            label="Cancel"
            onClick={() => setAddBalanceOpen(false)}
            variant="outlined"
          />
          <CustomButton
            label="Done"
            onClick={() => {
              setAddBalanceOpen(false);
              setBalanceData(balanceData);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddBalanceModal;
