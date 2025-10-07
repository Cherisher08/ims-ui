import { FC } from 'react';
import { RentalOrderInfo } from '../../../types/order';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import DeliveryChallanPDF from './DeliveryChallanPDF';
import { saveAs } from 'file-saver';
import { TOAST_IDS } from '../../../constants/constants';
import { toast } from 'react-toastify';
import { usePostOrderDcAsWhatsappMessageMutation } from '../../../services/OrderService';
import { Modal } from '@mui/material';
import CustomButton from '../../../styled/CustomButton';
import { MdClose } from 'react-icons/md';
import * as pdfjsLib from 'pdfjs-dist';

interface DeliveryChallanDialogProps {
  onClose: () => void;
  open: boolean;
  orderInfo: RentalOrderInfo;
}

const DeliveryChallanDialog: FC<DeliveryChallanDialogProps> = ({ onClose, open, orderInfo }) => {
  const [whatsappRentalOrderDC] = usePostOrderDcAsWhatsappMessageMutation();

  // Set PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const handlePrintDeliveryChallan = async () => {
    try {
      const pdfBlob = await pdf(<DeliveryChallanPDF data={orderInfo} />).toBlob();
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      const page = await pdfDoc.getPage(1);
      const scale = 2; // Higher resolution
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      canvas.toBlob((imageBlob) => {
        console.log('imageBlob: ', imageBlob);
        if (imageBlob) {
          saveAs(imageBlob, `DeliveryChallan_${orderInfo.order_id}.png`);
        }
      });
    } catch (error) {
      console.error('Error converting PDF to image:', error);
      toast.error('Failed to download as image');
    }
  };

  const handleWhatsappChallan = async (orderInfo: RentalOrderInfo) => {
    const blob = await pdf(<DeliveryChallanPDF data={orderInfo} />).toBlob();
    const file = new File([blob], 'DeliveryChallan.pdf', { type: 'application/pdf' });
    const messageDetails = {
      customerName: orderInfo.customer?.name || '',
      orderId: orderInfo.order_id,
    };
    try {
      await whatsappRentalOrderDC({
        mobile_number: orderInfo.customer?.personal_number || '',
        messageDetails,
        pdf_file: file,
      }).unwrap();
      toast.success('WhatsApp message sent successfully', {
        toastId: TOAST_IDS.SUCCESS_WHATSAPP_ORDER_DC,
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast.error('Failed to send WhatsApp message', {
        toastId: TOAST_IDS.ERROR_WHATSAPP_ORDER_DC,
      });
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-1/2 h-5/6 max-w-none max-h-none bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">Delivery Challan</p>
          <MdClose size={25} className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-col gap-3 h-full w-full px-3 overflow-y-auto scrollbar-stable">
          <PDFViewer width="100%" height="700">
            <DeliveryChallanPDF data={orderInfo} />
          </PDFViewer>
        </div>
        <div className="flex w-full gap-3 justify-end">
          <CustomButton onClick={onClose} label="Close" variant="outlined" className="bg-white" />
          <CustomButton onClick={handlePrintDeliveryChallan} label="Download as Image" />
          <CustomButton onClick={() => handleWhatsappChallan(orderInfo)} label="Send WhatsApp" />
        </div>
      </div>
    </Modal>
  );
};

export default DeliveryChallanDialog;
