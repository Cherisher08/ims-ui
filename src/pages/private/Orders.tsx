import { useState } from "react";
import CustomButton from "../../styled/CustomButton";
import { LuPlus } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Box, Tab, Tabs } from "@mui/material";
import CustomTable from "../../styled/CustomTable";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type RentalOrderType = {
  orderId: string;
  contact: string;
  deposit: number;
  orderInDate: string;
  orderOutDate: string;
  productId: string;
  productUnit: number;
  inDate: string;
  outDate: string;
};

interface RentalType {
  orderId: string;
  contact: string;
  deposit: number;
  orderInDate: string;
  orderOutDate: string;
  productId: string;
  productUnit: number;
  inDate: string;
  outDate: string;
  actions?: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [rentalOrders, setRentalOrders] = useState<RentalOrderType[]>([
    {
      orderId: "ORD001",
      contact: "9876543210",
      deposit: 500,
      orderInDate: "2025-06-01T10:15:00Z",
      orderOutDate: "2025-06-01T16:30:00Z",
      productId: "PROD001",
      productUnit: 10,
      inDate: "2025-06-01T10:20:00Z",
      outDate: "2025-06-01T16:25:00Z",
    },
    {
      orderId: "ORD002",
      contact: "9123456789",
      deposit: 800,
      orderInDate: "2025-06-02T09:00:00Z",
      orderOutDate: "2025-06-02T14:45:00Z",
      productId: "PROD002",
      productUnit: 5,
      inDate: "2025-06-02T09:05:00Z",
      outDate: "2025-06-02T14:40:00Z",
    },
    {
      orderId: "ORD003",
      contact: "9988776655",
      deposit: 1200,
      orderInDate: "2025-06-03T11:30:00Z",
      orderOutDate: "2025-06-03T17:30:00Z",
      productId: "PROD003",
      productUnit: 15,
      inDate: "2025-06-03T11:35:00Z",
      outDate: "2025-06-03T17:25:00Z",
    },
    {
      orderId: "ORD004",
      contact: "9001122334",
      deposit: 400,
      orderInDate: "2025-06-04T08:00:00Z",
      orderOutDate: "2025-06-04T12:15:00Z",
      productId: "PROD004",
      productUnit: 20,
      inDate: "2025-06-04T08:10:00Z",
      outDate: "2025-06-04T12:10:00Z",
    },
    {
      orderId: "ORD005",
      contact: "9112233445",
      deposit: 950,
      orderInDate: "2025-06-05T07:45:00Z",
      orderOutDate: "2025-06-05T13:00:00Z",
      productId: "PROD005",
      productUnit: 12,
      inDate: "2025-06-05T07:50:00Z",
      outDate: "2025-06-05T12:55:00Z",
    },
    {
      orderId: "ORD006",
      contact: "9090909090",
      deposit: 1100,
      orderInDate: "2025-06-06T13:15:00Z",
      orderOutDate: "2025-06-06T18:30:00Z",
      productId: "PROD006",
      productUnit: 8,
      inDate: "2025-06-06T13:20:00Z",
      outDate: "2025-06-06T18:25:00Z",
    },
    {
      orderId: "ORD007",
      contact: "8888777766",
      deposit: 300,
      orderInDate: "2025-06-07T06:45:00Z",
      orderOutDate: "2025-06-07T11:00:00Z",
      productId: "PROD007",
      productUnit: 30,
      inDate: "2025-06-07T06:50:00Z",
      outDate: "2025-06-07T10:55:00Z",
    },
    {
      orderId: "ORD008",
      contact: "7777666655",
      deposit: 650,
      orderInDate: "2025-06-08T15:30:00Z",
      orderOutDate: "2025-06-08T20:30:00Z",
      productId: "PROD008",
      productUnit: 14,
      inDate: "2025-06-08T15:35:00Z",
      outDate: "2025-06-08T20:25:00Z",
    },
    {
      orderId: "ORD009",
      contact: "9223344556",
      deposit: 700,
      orderInDate: "2025-06-09T09:45:00Z",
      orderOutDate: "2025-06-09T15:00:00Z",
      productId: "PROD009",
      productUnit: 11,
      inDate: "2025-06-09T09:50:00Z",
      outDate: "2025-06-09T14:55:00Z",
    },
    {
      orderId: "ORD010",
      contact: "9334455667",
      deposit: 480,
      orderInDate: "2025-06-10T11:00:00Z",
      orderOutDate: "2025-06-10T17:00:00Z",
      productId: "PROD010",
      productUnit: 18,
      inDate: "2025-06-10T11:05:00Z",
      outDate: "2025-06-10T16:55:00Z",
    },
    {
      orderId: "ORD011",
      contact: "9445566778",
      deposit: 560,
      orderInDate: "2025-06-11T10:30:00Z",
      orderOutDate: "2025-06-11T15:45:00Z",
      productId: "PROD011",
      productUnit: 7,
      inDate: "2025-06-11T10:35:00Z",
      outDate: "2025-06-11T15:40:00Z",
    },
    {
      orderId: "ORD012",
      contact: "9556677889",
      deposit: 890,
      orderInDate: "2025-06-12T08:45:00Z",
      orderOutDate: "2025-06-12T13:30:00Z",
      productId: "PROD012",
      productUnit: 6,
      inDate: "2025-06-12T08:50:00Z",
      outDate: "2025-06-12T13:25:00Z",
    },
    {
      orderId: "ORD013",
      contact: "9667788990",
      deposit: 950,
      orderInDate: "2025-06-13T07:15:00Z",
      orderOutDate: "2025-06-13T11:45:00Z",
      productId: "PROD013",
      productUnit: 13,
      inDate: "2025-06-13T07:20:00Z",
      outDate: "2025-06-13T11:40:00Z",
    },
    {
      orderId: "ORD014",
      contact: "9778899001",
      deposit: 610,
      orderInDate: "2025-06-14T13:45:00Z",
      orderOutDate: "2025-06-14T18:15:00Z",
      productId: "PROD014",
      productUnit: 9,
      inDate: "2025-06-14T13:50:00Z",
      outDate: "2025-06-14T18:10:00Z",
    },
    {
      orderId: "ORD015",
      contact: "9889900011",
      deposit: 990,
      orderInDate: "2025-06-15T12:00:00Z",
      orderOutDate: "2025-06-15T17:30:00Z",
      productId: "PROD015",
      productUnit: 16,
      inDate: "2025-06-15T12:05:00Z",
      outDate: "2025-06-15T17:25:00Z",
    },
    {
      orderId: "ORD016",
      contact: "9990011223",
      deposit: 450,
      orderInDate: "2025-06-16T09:30:00Z",
      orderOutDate: "2025-06-16T13:50:00Z",
      productId: "PROD016",
      productUnit: 4,
      inDate: "2025-06-16T09:35:00Z",
      outDate: "2025-06-16T13:45:00Z",
    },
    {
      orderId: "ORD017",
      contact: "9001122233",
      deposit: 620,
      orderInDate: "2025-06-17T14:30:00Z",
      orderOutDate: "2025-06-17T20:00:00Z",
      productId: "PROD017",
      productUnit: 20,
      inDate: "2025-06-17T14:35:00Z",
      outDate: "2025-06-17T19:55:00Z",
    },
    {
      orderId: "ORD018",
      contact: "9112233445",
      deposit: 700,
      orderInDate: "2025-06-18T10:00:00Z",
      orderOutDate: "2025-06-18T15:30:00Z",
      productId: "PROD018",
      productUnit: 11,
      inDate: "2025-06-18T10:05:00Z",
      outDate: "2025-06-18T15:25:00Z",
    },
    {
      orderId: "ORD019",
      contact: "9223344556",
      deposit: 770,
      orderInDate: "2025-06-19T11:45:00Z",
      orderOutDate: "2025-06-19T17:15:00Z",
      productId: "PROD019",
      productUnit: 17,
      inDate: "2025-06-19T11:50:00Z",
      outDate: "2025-06-19T17:10:00Z",
    },
    {
      orderId: "ORD020",
      contact: "9334455667",
      deposit: 870,
      orderInDate: "2025-06-20T09:00:00Z",
      orderOutDate: "2025-06-20T14:00:00Z",
      productId: "PROD020",
      productUnit: 10,
      inDate: "2025-06-20T09:05:00Z",
      outDate: "2025-06-20T13:55:00Z",
    },
  ]);

  const [rentalOrderColDefs, setRentalOrderColDefs] = useState<
    ColDef<RentalType>[]
  >([
    {
      field: "orderId",
      headerName: "Id",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 100,
    },
    {
      field: "contact",
      headerName: "Customer",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 80,
    },
    { field: "productId", headerName: "Product", flex: 1, minWidth: 90 },
    {
      field: "orderInDate",
      headerName: "M/C InDate",
      flex: 1,
      minWidth: 100,
      headerClass: "ag-header-wrap",
    },
    {
      field: "orderOutDate",
      headerName: "M/C OutDate",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams) => {
        const rowData = params.data;

        return (
          <div className="flex gap-2 h-[2rem] items-center">
            <FiEdit size={19} className="cursor-pointer" onClick={() => {}} />
            {/* <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              onClick={() => setDeleteOrderData(rowData)}
            /> */}
            <IoPrintOutline
              size={20}
              className="cursor-pointer"
              onClick={() => console.log("print")}
            />
          </div>
        );
      },
    },
  ]);

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
          <Tab label="Sales" value={2} />
          <Tab label="Service" value={3} />
        </Tabs>
      </Box>
      <div role="tabpanel" hidden={activeTab !== 1}>
        <CustomTable colDefs={rentalOrderColDefs} rowData={rentalOrders} />
      </div>
      <div role="tabpanel" hidden={activeTab !== 2}>
        Item Two
      </div>
      <div role="tabpanel" hidden={activeTab !== 3}>
        Item Three
      </div>
    </div>
  );
};

export default Orders;
