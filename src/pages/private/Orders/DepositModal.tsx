import { Modal } from "@mui/material";
import React, { useEffect } from "react";
import { DepositType, PaymentMode } from "../../../types/order";
import { MdClose } from "react-icons/md";
import CustomButton from "../../../styled/CustomButton";
import CustomInput from "../../../styled/CustomInput";
import CustomDatePicker from "../../../styled/CustomDatePicker";
import CustomSelect from "../../../styled/CustomSelect";

type DepositModalType = {
  depositOpen: boolean;
  setDepositOpen: (value: boolean) => void;
  depositData: DepositType[];
  setDepositData: React.Dispatch<React.SetStateAction<DepositType[]>>;
};

const DepositModal = ({
  depositOpen,
  setDepositOpen,
  depositData,
  setDepositData,
}: DepositModalType) => {
  const handleAddDeposit = () => {
    setDepositData([
      ...depositData,
      {
        amount: 0,
        date: "",
        mode: PaymentMode.CASH,
        product: 0,
      },
    ]);
  };

  const handleDepositChange = <K extends keyof DepositType>(
    field: K,
    value: DepositType[K],
    index: number
  ) => {
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

  useEffect(() => {
    console.log(depositData);
  }, [depositData]);

  return (
    <Modal
      open={depositOpen}
      onClose={() => {
        setDepositOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-3/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">
            Deposits
          </p>
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
            <div className="flex justify-between">
              <CustomInput
                label="Amount"
                labelClass="mt-2 text-center"
                value={deposit.amount}
                type="number"
                placeholder="Enter Amount"
                onChange={(value) =>
                  handleDepositChange("amount", parseFloat(value), index)
                }
              />
              <CustomDatePicker
                label="Date"
                value={deposit.date}
                onChange={(value) => handleDepositChange("date", value, index)}
              />
              {/* <CustomSelect
                label="Product"
                value={deposit.product}
                onChange={(value) =>
                  handleDepositChange("product", parseInt(value), index)
                }
              /> */}
              {/* <CustomSelect
                label="Payment Status"
                className="w-[15rem]"
                labelClass="w-fit"
                options={deposit.mode}
                value={
                  paymentStatusOptions.find(
                    (opt) => opt.id === orderInfo?.status
                  ) ?? paymentStatusOptions[0]
                }
                onChange={(selected) =>
                  handleValueChange("status", selected.id as PaymentStatus)
                }
              /> */}
            </div>
          ))}
        </div>

        <div className="flex gap-4 my-3 w-full justify-end">
          <CustomButton
            label="Cancel"
            onClick={() => setDepositOpen(false)}
            variant="outlined"
          />
          <CustomButton label="Done" onClick={() => {}} />
        </div>
      </div>
    </Modal>
  );
};

export default DepositModal;
