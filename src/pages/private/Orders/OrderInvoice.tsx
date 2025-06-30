import { PDFViewer } from "@react-pdf/renderer";
import Invoice from "../../../components/Invoice";
import { useGetRentalOrderByIdQuery } from "../../../services/OrderService";
import ErrorPage from "../../../components/ErrorPage/ErrorPage";
import Loader from "../../../components/Loader";
import { useParams } from "react-router-dom";
import { ProductType } from "../../../types/common";

const OrderInvoice = () => {
  const { rentalId } = useParams();
  const {
    data: existingRentalOrder,
    isLoading: isRentalOrderQueryByIdLoading,
  } = useGetRentalOrderByIdQuery(rentalId!, {
    skip: !rentalId,
  });

  if (!rentalId) {
    return <ErrorPage retry={undefined} />;
  }

  if (isRentalOrderQueryByIdLoading || !existingRentalOrder) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <p className="text-primary text-2xl font-bold mb-4">Order Invoice</p>
      {existingRentalOrder.type === ProductType.RENTAL && (
        <PDFViewer className="w-full h-full">
          <Invoice data={existingRentalOrder} />
        </PDFViewer>
      )}
    </div>
  );
};

export default OrderInvoice;
