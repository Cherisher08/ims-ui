import { Modal } from "@mui/material";
import { MdClose } from "react-icons/md";

export type DeleteContactType = {
  imageUrl: string | null;
  setImageUrl: (value: string | null) => void;
};

const ViewImageModal = ({ imageUrl, setImageUrl }: DeleteContactType) => {
  return (
    <Modal
      open={imageUrl !== null ? true : false}
      onClose={() => {
        setImageUrl(null);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-2/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-end w-full">
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setImageUrl(null);
            }}
          />
        </div>

        <div className="flex flex-col w-full gap-2 p-2 justify-center items-center rounded-sm">
          {imageUrl !== null && <img src={imageUrl} className="w-full h-80" />}
        </div>
      </div>
    </Modal>
  );
};

export default ViewImageModal;
