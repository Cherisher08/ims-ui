import CustomTable from "../../../styled/CustomTable";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { RentalOrderType, RentalType } from "../../../types/order";
import DeleteOrderModal from "../Contacts/modals/DeleteOrderModal";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

const RentalOrderTable = ({
  rentalOrders,
}: {
  rentalOrders: RentalOrderType[];
}) => {
  const navigate = useNavigate();
  const expiredOrders = useSelector(
    (state: RootState) => state.rentalOrder.data
  );

  // make a Set of IDs for fast lookup
  const expiredOrderIds = useMemo(
    () => new Set(expiredOrders.map((order) => order.order_id)),
    [expiredOrders]
  );

  const [deleteOrderOpen, setDeleteOrderOpen] = useState<boolean>(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string>("");

  const rentalOrderColDef: ColDef<RentalType>[] = [
    {
      field: "order_id",
      headerName: "Order Id",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 100,
      filter: "agTextColumnFilter",
    },
    {
      field: "contact_name",
      headerName: "Customer",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 200,
      filter: "agTextColumnFilter",
    },
    { field: "products", headerName: "Products", flex: 1, minWidth: 90 },
    {
      field: "in_date",
      headerName: "Order In Date",
      flex: 1,
      minWidth: 150,
      headerClass: "ag-header-wrap",
      filter: "agDateColumnFilter",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      field: "out_date",
      headerName: "Order Out Date",
      flex: 1,
      minWidth: 100,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      pinned: "right",
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams<RentalType>) => {
        const rowData = params.data;
        return (
          <div className="flex gap-2 h-[2rem] items-center">
            <FiEdit
              size={19}
              className="cursor-pointer"
              onClick={() => {
                navigate(`/orders/rentals/${rowData?._id}`);
              }}
            />
            <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              onClick={() => {
                setDeleteOrderOpen(true);
                setDeleteOrderId(rowData?._id || "");
              }}
            />
            <IoPrintOutline
              size={20}
              className="cursor-pointer"
              onClick={() => navigate(`/orders/invoice/${rowData?._id}`)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <CustomTable
        isLoading={false}
        colDefs={rentalOrderColDef}
        rowData={rentalOrders}
        getRowStyle={(params) => {
          const orderId = params.data?.order_id;
          if (orderId && expiredOrderIds.has(orderId)) {
            return {
              backgroundColor: "red",
              color: "white",
            };
          }
          return undefined;
        }}
      />
      <DeleteOrderModal
        deleteOrderOpen={deleteOrderOpen}
        setDeleteOrderOpen={(value) => setDeleteOrderOpen(value)}
        deleteOrderId={deleteOrderId}
        setDeleteOrderId={(value) => setDeleteOrderId(value)}
      />
    </>
  );
};

export default RentalOrderTable;
