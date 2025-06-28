import CustomTable from "../../../styled/CustomTable";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { RentalOrderType, RentalType } from "../../../types/order";

const ServiceOrderTable = ({
  rentalOrders,
}: {
  rentalOrders: RentalOrderType[];
}) => {
  const rentalOrderColDef: ColDef<RentalType>[] = [
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
            <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              //   onClick={() => setDeleteOrderData(rowData)}
            />
            <IoPrintOutline
              size={20}
              className="cursor-pointer"
              onClick={() => console.log("print")}
            />
          </div>
        );
      },
    },
  ];

  return (
    <CustomTable
      isLoading={false}
      colDefs={rentalOrderColDef}
      rowData={rentalOrders}
    />
  );
};

export default ServiceOrderTable;
