import { useEffect, useState } from "react";
import CustomButton from "../../../styled/CustomButton";
import { LuPlus } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Box, Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RentalOrderTable from "./RentalOrderTable";
import { RentalOrderInfo, RentalOrderType } from "../../../types/order";
// import SalesOrderTable from "./SalesOrderTable";
// import ServiceOrderTable from "./ServiceOrderTable";
import { useGetRentalOrdersQuery } from "../../../services/OrderService";

const transformRentalOrderData = (
  rentalOrders: RentalOrderInfo[]
): RentalOrderType[] => {
  return rentalOrders.map((rentalOrder) => {
    return {
      _id: rentalOrder._id!,
      order_id: rentalOrder.order_id,
      in_date: rentalOrder.in_date,
      expected_date: rentalOrder.expected_date,
      out_date: rentalOrder.out_date,
      deposits: rentalOrder.deposits,
      contact_name: rentalOrder.customer.name,
      products: rentalOrder.product_details.reduce((names, product, index) => {
        if (index === 0) return product.name;
        return `${names}, ${product.name}`;
      }, ""),
      payment_status: rentalOrder.status,
    };
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();

  const [rentalOrders, setRentalOrders] = useState<RentalOrderType[]>([]);

  useEffect(() => {
    if (isRentalOrdersQuerySuccess) {
      setRentalOrders(transformRentalOrderData(rentalOrderData));
    }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

  return (
    <div className="h-fit flex gap-3 flex-col">
      {/* Header */}
      <div className="flex justify-between">
        <CustomButton
          onClick={() => navigate("new-rental-order")}
          label="New Order"
          icon={<LuPlus color="white" />}
        />
        <div className="flex gap-3">
          <CustomButton
            onClick={() => console.log("whatsapp")}
            label="Whatsapp"
            icon={<FaWhatsapp color="white" />}
          />
          <CustomButton
            onClick={() => console.log("email")}
            label="Email"
            icon={<MdOutlineMail color="white" />}
          />
        </div>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="basic tabs example"
        >
          <Tab label="Rental" value={1} />
          {/* <Tab label="Sales" value={2} />
          <Tab label="Service" value={3} /> */}
        </Tabs>
      </Box>
      <div role="tabpanel" hidden={activeTab !== 1}>
        <RentalOrderTable rentalOrders={rentalOrders} />
      </div>
      {/* <div role="tabpanel" hidden={activeTab !== 2}>
        <SalesOrderTable rentalOrders={rentalOrders} />
      </div>
      <div role="tabpanel" hidden={activeTab !== 3}>
        <ServiceOrderTable rentalOrders={rentalOrders} />
      </div> */}
    </div>
  );
};

export default Orders;
