import { Modal } from '@mui/material';
import { MdClose } from 'react-icons/md';

interface ViewPdfModalProps {
  open: boolean;
  onClose: () => void;
  selectedPdf: string | null;
}

const ViewPdfModal = ({ open, onClose, selectedPdf }: ViewPdfModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-6xl h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full h-8">
          <p className="text-primary text-2xl font-semibold w-full text-start">
            Purchase Invoice PDF
          </p>
          <MdClose size={25} className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="w-full h-full">
          {selectedPdf && (
            <iframe
              src={selectedPdf}
              className="w-full h-full border-0"
              title="Purchase Invoice PDF"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewPdfModal;
