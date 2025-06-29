import { PDFViewer } from "@react-pdf/renderer";
import Invoice from "../../../components/Invoice";
import { OrderType } from "../../../types/order";

const OrderInvoice = () => {
  const data = {
    order_id: "asdad12",
    type: "rental",
    billingMode: "Business",
    status: "pending",
    payment_mode: "cash",
    out_date: "2025-06-29T17:42",
    expected_date: "2025-06-29T17:42",
    in_date: "2025-06-29T17:42",
    round_off: 10.22,
    product_details: [
      {
        _id: "p2",
        name: "Welding Machine",
        category: "EQUIPMENT",
        billing_unit: "days",
        product_unit: {
          _id: "u1",
          name: "kg",
        },
        in_date: "+0530-06-29T17:39",
        order_quantity: 10,
        order_repair_count: 0,
        out_date: "+0530-06-29T17:39",
        rent_per_unit: 300,
      },
      {
        _id: "p5",
        name: "Welding Machine",
        category: "EQUIPMENT",
        billing_unit: "days",
        product_unit: {
          _id: "u1",
          name: "kg",
        },
        in_date: "+0530-06-29T17:39",
        order_quantity: 10,
        order_repair_count: 0,
        out_date: "+0530-06-29T17:39",
        rent_per_unit: 300,
      },
      {
        _id: "p3",
        name: "Hammer",
        category: "TOOLS",
        billing_unit: "days",
        product_unit: {
          _id: "u3",
          name: "l",
        },
        in_date: "+0530-06-29T17:39",
        order_quantity: 20,
        order_repair_count: 0,
        out_date: "+0530-06-29T17:39",
        rent_per_unit: 1000,
      },
    ],
    deposit: [
      {
        amount: 100,
        date: "2025-06-29T18:06",
        product: {
          _id: "p2",
          name: "Welding Machine",
          category: "EQUIPMENT",
          billing_unit: "days",
          product_unit: {
            _id: "u3",
            name: "l",
          },
          in_date: "+0530-06-29T18:06",
          order_quantity: 10,
          order_repair_count: 0,
          out_date: "+0530-06-29T18:06",
          rent_per_unit: 300,
        },
        mode: "cash",
      },
    ],
    discount: 10.52,
    discount_amount: 241.96,
    customer: {
      id: "c2",
      name: "Anita Sharma",
      personalNumber: "9123456789",
      officeNumber: "01122446688",
      gstin: "07AAACB2233M1Z2",
      email: "anita.sharma@example.in",
      address: "Flat 9B, Green Heights, Dwarka, New Delhi",
      pincode: "110075",
      companyName: "Sharma Logistics",
      addressProof: "Electricity Bill",
    },
    eventAddress: "asdasd",
    eventPincode: "321112",
    remarks: "asdxasdasd",
  };

  return (
    <div className="flex flex-col w-full h-full">
      <p className="text-primary text-2xl font-bold mb-4">Order Invoice</p>
      {data.type === OrderType.RENTAL && (
        <PDFViewer className="w-full h-full">
          <Invoice data={data} />
        </PDFViewer>
      )}
    </div>
  );
};

export default OrderInvoice;
