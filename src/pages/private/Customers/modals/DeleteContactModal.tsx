import { useEffect } from 'react';
import { Modal } from '@mui/material';
import { MdClose } from 'react-icons/md';
import { PiWarningFill } from 'react-icons/pi';
import CustomButton from '../../../../styled/CustomButton';
import { useDeleteContactMutation } from '../../../../services/ContactService';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../../../constants/constants';

export type DeleteContactType = {
  deleteContactOpen: boolean;
  setDeleteContactOpen: (value: boolean) => void;
  deleteContactId: string;
  setDeleteContactId: (value: string) => void;
};

const DeleteContactModal = ({
  deleteContactOpen,
  setDeleteContactOpen,
  deleteContactId,
  setDeleteContactId,
}: DeleteContactType) => {
  const [deleteContact, { isSuccess: isDeleteContactSuccess, reset }] = useDeleteContactMutation();

  const handleDeleteContact = () => {
    deleteContact(deleteContactId);
    setDeleteContactId('');
  };

  useEffect(() => {
    if (isDeleteContactSuccess) {
      toast.success('Deleted Contact Successfully', {
        toastId: TOAST_IDS.SUCCESS_CONTACT_DELETE,
      });
      reset();
      setDeleteContactOpen(false);
    }
  }, [isDeleteContactSuccess, reset, setDeleteContactOpen]);

  return (
    <Modal
      open={deleteContactOpen}
      onClose={() => {
        setDeleteContactId('');
        setDeleteContactOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-2/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">Delete Contact</p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setDeleteContactId('');
              setDeleteContactOpen(false);
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
              setDeleteContactId('');
              setDeleteContactOpen(false);
            }}
            label="Cancel"
            variant="outlined"
            className="bg-white"
          />
          <CustomButton onClick={() => handleDeleteContact()} label="Delete" />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteContactModal;
