import { useEffect } from "react";
import { Modal } from "@mui/material";
import { MdClose } from "react-icons/md";
import { PiWarningFill } from "react-icons/pi";
import CustomButton from "../../../../styled/CustomButton";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../../constants/constants";
import { useDeleteRentalOrderMutation } from "../../../../services/OrderService";

export type DeleteOrderType = {
  deleteOrderOpen: boolean;
  setDeleteOrderOpen: (value: boolean) => void;
  deleteOrderId: string;
  setDeleteOrderId: (value: string) => void;
};

const DeleteOrderModal = ({
  deleteOrderOpen,
  setDeleteOrderOpen,
  deleteOrderId,
  setDeleteOrderId,
}: DeleteOrderType) => {
  const [deleteOrder, { isSuccess: isDeleteOrderSuccess, reset }] =
    useDeleteRentalOrderMutation();

  const handleDeleteOrder = () => {
    deleteOrder(deleteOrderId);
    setDeleteOrderId("");
  };

  useEffect(() => {
    if (isDeleteOrderSuccess) {
      toast.success("Deleted Order Successfully", {
        toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_DELETE,
      });
      reset();
      setDeleteOrderOpen(false);
    }
  }, [isDeleteOrderSuccess, reset, setDeleteOrderOpen]);

  return (
    <Modal
      open={deleteOrderOpen}
      onClose={() => {
        setDeleteOrderId("");
        setDeleteOrderOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-2/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">
            Delete Order
          </p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setDeleteOrderId("");
              setDeleteOrderOpen(false);
            }}
          />
        </div>

        <div className="bg-yellow flex flex-col w-full gap-2 p-2 rounded-sm">
          <div className="flex gap-2 items-center">
            <PiWarningFill size={25} />
            <span className="text-xl">Warning!</span>
          </div>
          <p>This action is irreversible!</p>
        </div>
        <div className="flex w-full gap-3 justify-end">
          <CustomButton
            onClick={() => {
              setDeleteOrderId("");
              setDeleteOrderOpen(false);
            }}
            label="Cancel"
            variant="outlined"
            className="bg-white"
          />
          <CustomButton onClick={() => handleDeleteOrder()} label="Delete" />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteOrderModal;
