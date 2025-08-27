import { useEffect, useState } from "react";
import CustomButton from "../../../styled/CustomButton";
import { LuPlus } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Box, Tab, Tabs } from "@mui/material";
import RentalOrderTable from "./RentalOrderTable";
// import SalesOrderTable from "./SalesOrderTable";
// import ServiceOrderTable from "./ServiceOrderTable";
import {
  useCreateRentalOrderMutation,
  useGetRentalOrdersQuery,
} from "../../../services/OrderService";
import { RentalOrderInfo, RentalOrderType } from "../../../types/order";
import { useGetContactsQuery } from "../../../services/ContactService";
import { getDefaultRentalOrder, getNewOrderId } from "./utils";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../../constants/constants";
import AddContactModal from "../Contacts/modals/AddContactModal";
import {
  useGetProductCategoriesQuery,
  useGetUnitsQuery,
} from "../../../services/ApiService";
import { transformIdNamePair } from "../Inventory";
import { CustomOptionProps } from "../../../styled/CustomAutoComplete";
import NewProductModal from "../../../components/NewProductModal.";

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
  const [activeTab, setActiveTab] = useState(1);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);
  const {
    data: productCategoryData,
    isSuccess: isProductCategoryQuerySuccess,
  } = useGetProductCategoriesQuery();
  const { data: rentalOrderData, isSuccess: isRentalOrdersQuerySuccess } =
    useGetRentalOrdersQuery();
  const { data: contactsQueryData, isSuccess: isGetContactsSuccess } =
    useGetContactsQuery();
  const [createRentalOrder] = useCreateRentalOrderMutation();

  const { data: unitData, isSuccess: isUnitQuerySuccess } = useGetUnitsQuery();
  const [productCategories, setProductCategories] = useState<
    CustomOptionProps[]
  >([]);

  const isCommunicationsFeatureDone: boolean = false;

  const [rentalOrders, setRentalOrders] = useState<RentalOrderType[]>([]);

  const handleNewRentalOrder = async () => {
    if (isRentalOrdersQuerySuccess && isGetContactsSuccess) {
      const orderId = getNewOrderId(rentalOrderData);
      const defaultCustomer = contactsQueryData[0];
      const newOrderData = getDefaultRentalOrder(orderId, defaultCustomer);
      try {
        const orderResponse = await createRentalOrder(newOrderData).unwrap();
        toast.success("Rental Order Created Successfully", {
          toastId: TOAST_IDS.SUCCESS_RENTAL_ORDER_CREATE,
        });
        console.log("✅ Order created successfully", orderResponse);
      } catch {
        toast.error("Rental Order was not Created Successfully", {
          toastId: TOAST_IDS.ERROR_RENTAL_ORDER_CREATE,
        });
      }
    }
  };

  useEffect(() => {
    if (isRentalOrdersQuerySuccess) {
      setRentalOrders(transformRentalOrderData(rentalOrderData));
    }
  }, [isRentalOrdersQuerySuccess, rentalOrderData]);

  useEffect(() => {
    if (isUnitQuerySuccess)
      setProductUnits(() => {
        return transformIdNamePair(unitData);
      });
  }, [isUnitQuerySuccess, unitData]);

  useEffect(() => {
    if (isProductCategoryQuerySuccess) {
      setProductCategories(() => {
        return transformIdNamePair(productCategoryData);
      });
    }
  }, [isProductCategoryQuerySuccess, productCategoryData]);

  return (
    <div className="h-full flex gap-3 flex-col">
      {/* Header */}
      <div className="flex justify-between">
        <CustomButton
          onClick={() => handleNewRentalOrder()}
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
          <CustomButton
            onClick={() => setAddProductOpen(true)}
            label="Add Product"
            icon={<LuPlus color="white" />}
          />
          <CustomButton
            onClick={() => setAddContactOpen(true)}
            label="Add Customer"
            icon={<LuPlus color="white" />}
          />
        </div>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          aria-label="order type"
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
      <AddContactModal
        addContactOpen={addContactOpen}
        setAddContactOpen={(value: boolean) => setAddContactOpen(value)}
      />

      <NewProductModal
        addProductOpen={addProductOpen}
        productCategories={productCategories}
        productUnits={productUnits}
        key="New Product"
        setAddProductOpen={setAddProductOpen}
      />
    </div>
  );
};

export default Orders;
