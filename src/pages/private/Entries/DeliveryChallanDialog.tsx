import { Modal } from '@mui/material';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import { FC } from 'react';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../../constants/constants';
import {
  usePostOrderDcAsWhatsappMessageMutation,
  useUpdateRentalOrderMutation,
} from '../../../services/OrderService';
import CustomButton from '../../../styled/CustomButton';
import { RentalOrderInfo } from '../../../types/order';
import DeliveryChallanPDF from './DeliveryChallanPDF';

interface DeliveryChallanDialogProps {
  onClose: () => void;
  open: boolean;
  orderInfo: RentalOrderInfo;
  createOrder?: () => Promise<void>;
  createOrderLabel?: string;
}

const DeliveryChallanDialog: FC<DeliveryChallanDialogProps> = ({
  onClose,
  open,
  orderInfo,
  createOrder,
  createOrderLabel,
}) => {
  const [whatsappRentalOrderDC] = usePostOrderDcAsWhatsappMessageMutation();
  const [updateRentalOrder] = useUpdateRentalOrderMutation();
  // const [patchRentalOrder] = usePatchRentalOrderMutation();

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
      const scale = 2; // Higher resolution

      // Render all pages and stack them vertically into one image
      const pageCanvases: HTMLCanvasElement[] = [];
      let totalHeight = 0;
      let maxWidth = 0;
      for (let p = 1; p <= pdfDoc.numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        pageCanvases.push(canvas);
        totalHeight += canvas.height;
        maxWidth = Math.max(maxWidth, canvas.width);
      }

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = maxWidth;
      finalCanvas.height = totalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return;
      let yOffset = 0;
      for (const c of pageCanvases) {
        finalCtx.drawImage(c, 0, yOffset);
        yOffset += c.height;
      }

      finalCanvas.toBlob((imageBlob) => {
        if (imageBlob) {
          saveAs(imageBlob, `DeliveryChallan_${orderInfo.order_id}.png`);
        }
      });
    } catch (error) {
      console.error('Error converting PDF to image:', error);
      toast.error('Failed to download as image');
    }
  };

  const handleCreateOrderClick = async () => {
    // Close the dialog first to unmount PDFViewer and avoid react-pdf renderer errors
    try {
      onClose();
      if (createOrder) await createOrder();
    } catch (error) {
      console.error('Error while creating order from dialog:', error);
      // swallow error to avoid breaking navigation/UI flow
    }
  };

  const handleWhatsappChallan = async (orderInfo: RentalOrderInfo) => {
    try {
      const pdfBlob = await pdf(<DeliveryChallanPDF data={orderInfo} />).toBlob();
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      const scale = 2; // Higher resolution

      // Render all pages and stack them vertically into one image
      const pageCanvases: HTMLCanvasElement[] = [];
      let totalHeight = 0;
      let maxWidth = 0;
      for (let p = 1; p <= pdfDoc.numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        pageCanvases.push(canvas);
        totalHeight += canvas.height;
        maxWidth = Math.max(maxWidth, canvas.width);
      }

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = maxWidth;
      finalCanvas.height = totalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return;
      let yOffset = 0;
      for (const c of pageCanvases) {
        finalCtx.drawImage(c, 0, yOffset);
        yOffset += c.height;
      }

      finalCanvas.toBlob(async (imageBlob) => {
        if (imageBlob) {
          const file = new File([imageBlob], 'DeliveryChallan.png', { type: 'image/png' });
          const messageDetails = {
            customerName: orderInfo.customer?.name || '',
            orderId: orderInfo.order_id,
            bill_type: 'Delivery Challan',
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
        }
      });

      // const payload: PatchOperation[] = [
      //   {
      //     op: 'replace',
      //     path: '/whatsapp_notifications',
      //     value: {
      //       delivery_challan: {
      //         is_sent: true,
      //         last_sent_date: new Date().toISOString(),
      //       },
      //     },
      //   },
      // ];

      await updateRentalOrder({
        ...orderInfo,
        whatsapp_notifications: {
          ...orderInfo.whatsapp_notifications,
          delivery_challan: {
            is_sent: true,
            last_sent_date: new Date().toISOString(),
          },
        },
      });
      // if (orderInfo._id) await patchRentalOrder({ id: orderInfo._id, payload: payload }).unwrap();
    } catch (error) {
      console.error('Error converting PDF to image for WhatsApp:', error);
      toast.error('Failed to send WhatsApp message');
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
        <div className="flex w-full gap-3 justify-end">
          <CustomButton onClick={handlePrintDeliveryChallan} label="Download as Image" />
          <CustomButton onClick={() => handleWhatsappChallan(orderInfo)} label="Send WhatsApp" />
        </div>
        <div className="flex flex-col gap-3 h-full w-full px-3 overflow-y-auto scrollbar-stable">
          <PDFViewer width="100%" height="700">
            <DeliveryChallanPDF data={orderInfo} />
          </PDFViewer>
        </div>
        <div className="flex w-full gap-3 justify-end">
          <CustomButton onClick={onClose} label="Close" variant="outlined" className="bg-white" />
          {createOrderLabel && createOrder && (
            <CustomButton label={createOrderLabel} onClick={handleCreateOrderClick} />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeliveryChallanDialog;
