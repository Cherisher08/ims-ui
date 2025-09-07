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
  const {
    data: existingRentalOrder,
    isLoading: isRentalOrderQueryByIdLoading,
  } = useGetRentalOrderByIdQuery(rentalId!, {
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
    const sortedOrders = rentalOrderData
      .filter((order) => order.in_date)
      .sort(
        (a, b) => new Date(a.in_date).getTime() - new Date(b.in_date).getTime()
      );

    const position =
      sortedOrders.findIndex((order) => order._id === existingRentalOrder._id) +
      1;

    const positionStr = position.toString().padStart(4, "0");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month < 4 ? year - 1 : year;
    const endYear = startYear + 1;
    const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;

    setInvoiceId(`INV/${fy}/${positionStr}`);
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
