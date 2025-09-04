import { PDFViewer } from "@react-pdf/renderer";
import Invoice from "../../../components/Invoice";
import {
  useGetRentalOrderByIdQuery,
  useGetRentalOrdersQuery,
} from "../../../services/OrderService";
import ErrorPage from "../../../components/ErrorPage/ErrorPage";
import Loader from "../../../components/Loader";
import { useParams } from "react-router-dom";
import { ProductType } from "../../../types/common";
import { useState } from "react";
const OrderInvoice = () => {
  const { rentalId } = useParams();
  const { data: existingRentalOrder, isLoading: isRentalOrderQueryByIdLoading } =
    useGetRentalOrderByIdQuery(rentalId!, {
      skip: !rentalId,
    });

  const [invoiceId, setInvoiceId] = useState<string>("");

  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();

  if (!rentalId) {
    return <ErrorPage retry={undefined} />;
  }

  if (isRentalOrderQueryByIdLoading || !existingRentalOrder) {
    return <Loader />;
  }

  if (isRentalOrdersQuerySuccess && rentalOrderData && invoiceId === "") {
    // const newInvoiceId =
    //   rentalOrderData.filter((order) => order.status === PaymentStatus.PAID).length + 1;
    const newInvoiceId = rentalOrderData.filter((order) => order.in_date).length + 1;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month < 4 ? year - 1 : year;
    const endYear = startYear + 1;
    const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;

    setInvoiceId(`RO/${fy}/${newInvoiceId}`);
  }

  return (
    <div className="flex flex-col w-full h-full">
      <p className="text-primary text-2xl font-bold mb-4">Order Invoice</p>
      {existingRentalOrder.type === ProductType.RENTAL && (
        <PDFViewer className="w-full h-full">
          <Invoice data={existingRentalOrder} invoiceId={invoiceId} />
        </PDFViewer>
      )}
    </div>
  );
};

export default OrderInvoice;
