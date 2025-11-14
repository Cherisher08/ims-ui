import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ErrorPage from '../../../components/ErrorPage/ErrorPage';
import Invoice from '../../../components/Invoice';
import Loader from '../../../components/Loader';
import CustomButton from '../../../styled/CustomButton';
import { pdfElementToPngFile, sendImageViaWhatsapp } from './pdfWhatsappUtils';
import {
  usePostOrderDcAsWhatsappMessageMutation,
  useUpdateRentalOrderMutation,
  useGetRentalOrderByIdQuery,
  useGetRentalOrdersQuery,
} from '../../../services/OrderService';
import { ProductType } from '../../../types/common';
import { PaymentStatus } from '../../../types/order';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../../constants/constants';
const OrderInvoice = () => {
  const { rentalId } = useParams();
  const { data: existingRentalOrder, isLoading: isRentalOrderQueryByIdLoading } =
    useGetRentalOrderByIdQuery(rentalId!, {
      skip: !rentalId,
    });

  const [invoiceId, setInvoiceId] = useState<string>('');

  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();

  const [sendDcWhatsapp] = usePostOrderDcAsWhatsappMessageMutation();
  const [updateRentalOrder] = useUpdateRentalOrderMutation();
  const [isSending, setIsSending] = useState(false);

  if (!rentalId) {
    return <ErrorPage retry={undefined} />;
  }

  if (isRentalOrderQueryByIdLoading || !existingRentalOrder) {
    return <Loader />;
  }

  if (isRentalOrdersQuerySuccess && rentalOrderData && invoiceId === '') {
    const sortedOrders = rentalOrderData
      .filter((order) => order.in_date && order.status === PaymentStatus.PAID)
      .sort((a, b) => new Date(a.in_date).getTime() - new Date(b.in_date).getTime());

    const position = sortedOrders.findIndex((order) => order._id === existingRentalOrder._id) + 1;

    if (!position) {
      setInvoiceId('-');
      return;
    }

    const positionStr = position.toString().padStart(4, '0');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month < 4 ? year - 1 : year;
    const endYear = startYear + 1;
    const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;

    setInvoiceId(`INV/${fy}/${positionStr}`);
  }

  const handleSendInvoiceViaWhatsapp = async () => {
    if (!existingRentalOrder) return;
    try {
      setIsSending(true);
      const file = await pdfElementToPngFile(
        <Invoice data={existingRentalOrder} invoiceId={invoiceId} />,
        `${existingRentalOrder.customer?.name || 'Invoice'}.png`
      );

      await sendImageViaWhatsapp({
        file,
        order: existingRentalOrder,
        sendDcWhatsapp,
        updateRentalOrder,
      });

      toast.success('Invoice sent via WhatsApp', {
        toastId: TOAST_IDS.SUCCESS_WHATSAPP_ORDER_DC,
      });
    } catch (error) {
      console.error('Error converting PDF to image for WhatsApp:', error);
      toast.error('Failed to send invoice via WhatsApp', {
        toastId: TOAST_IDS.ERROR_WHATSAPP_ORDER_DC,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-primary text-2xl font-bold">Order Invoice</p>
        <div className="flex gap-2">
          {existingRentalOrder && invoiceId && (
            <PDFDownloadLink
              document={<Invoice data={existingRentalOrder} invoiceId={invoiceId} />}
              fileName={`${existingRentalOrder.customer?.name || 'Customer'}_${invoiceId}.pdf`}
            >
              {({ loading }) => (
                <CustomButton
                  label={loading ? 'Generating...' : 'Download Invoice'}
                  disabled={loading || !existingRentalOrder || !invoiceId}
                  variant="outlined"
                  onClick={() => {}}
                />
              )}
            </PDFDownloadLink>
          )}
          <CustomButton
            label={isSending ? 'Sending...' : 'Send via WhatsApp'}
            onClick={handleSendInvoiceViaWhatsapp}
            disabled={isSending || !existingRentalOrder || !invoiceId}
          />
        </div>
      </div>
      {existingRentalOrder.type === ProductType.RENTAL && (
        <PDFViewer className="w-full h-full">
          {/* <DeliveryChallan data={existingRentalOrder} /> */}
          <Invoice data={existingRentalOrder} invoiceId={invoiceId} />
        </PDFViewer>
      )}
    </div>
  );
};

export default OrderInvoice;
