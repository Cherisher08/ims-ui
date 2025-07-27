import { useEffect, useState } from "react";
import CustomButton from "../../../styled/CustomButton";
import { LuPlus } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Box, Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RentalOrderTable from "./RentalOrderTable";
// import SalesOrderTable from "./SalesOrderTable";
// import ServiceOrderTable from "./ServiceOrderTable";
import { useGetRentalOrdersQuery } from "../../../services/OrderService";
import { RentalOrderInfo, RentalOrderType } from "../../../types/order";

const transformRentalOrderData = (
  rentalOrders: RentalOrderInfo[]
): RentalOrderType[] => {
  return rentalOrders.map((rentalOrder) => {
    return {
      ...rentalOrder,
      customer: {
        _id: rentalOrder.customer._id,
        name: `${rentalOrder.customer.name}-${rentalOrder.customer.personal_number}`,
      },
    };
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();
  const isCommunicationsFeatureDone: boolean = false;

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
          {isCommunicationsFeatureDone && (
            <>
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
            </>
          )}
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
