import CustomTable from "../../../styled/CustomTable";
import type {
  CellEditingStoppedEvent,
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
} from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import {
  RentalOrderInfo,
  RentalType,
} from "../../../types/order";
import DeleteOrderModal from "../Contacts/modals/DeleteOrderModal";
import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { PatchOperation } from "../../../types/common";
import { usePatchRentalOrderMutation } from "../../../services/OrderService";
import { InDateCellEditor } from "../../../components/AgGridCellEditors/InDateCellEditor";

const RentalOrderTable = ({
  rentalOrders,
}: {
  rentalOrders: RentalOrderInfo[];
}) => {
  const navigate = useNavigate();
  const expiredOrders = useSelector(
    (state: RootState) => state.rentalOrder.data
  );
  const [patchRentalOrder] = usePatchRentalOrderMutation();

  const expiredOrderIds = useMemo(
    () => new Set(expiredOrders.map((order) => order.order_id)),
    [expiredOrders]
  );

  const orderData = rentalOrders.map((order) => ({ ...order }));

  // const patchOrder = async (patchPayload: PatchPayload) => {
  //   // Call your API here (RTK Query, axios, fetch, etc.)
  //   console.log("Patching order", patchPayload);
  // };

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
      cellRenderer: "agGroupCellRenderer",
    },
    {
      field: "out_date",
      headerName: "Order Out Date",
      flex: 1,
      minWidth: 100,
      filter: "agDateColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellDataType: "dateTime",
      cellEditor: InDateCellEditor,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "expected_date",
      headerName: "Order Expected Date",
      flex: 1,
      minWidth: 100,
      filter: "agDateColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellDataType: "dateTime",
      cellEditor: InDateCellEditor,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "in_date",
      headerName: "Order In Date",
      flex: 1,
      minWidth: 150,
      headerClass: "ag-header-wrap",
      filter: "agDateColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellDataType: "dateTime",
      cellEditor: InDateCellEditor,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      cellDataType: "object",
      valueFormatter: (params) => {
        const customer = params.value;
        return customer.name || " ";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
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

  const handleCellEditingStopped = async (event: CellEditingStoppedEvent) => {
    console.log("event: ", event);
    const { data, colDef, oldValue, newValue } = event;

    const field = colDef.field;
    if (!field || newValue === oldValue) return;

    try {
      const patchPayload: PatchOperation[] = [
        {
          op: "replace",
          path: `/${field}`,
          value: newValue,
        },
      ];

      await patchRentalOrder({ id: data._id, payload: patchPayload }).unwrap();
      // patchOrder({ id: data._id, payload: patchPayload });
      console.log(`Successfully patched ${field} for order ${data._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optionally revert the value or show a toast
    }
  };

  const handleGetRowId = useCallback((params: GetRowIdParams) => {
    return params.data.rowId;
  }, []);

  // const detailCellRendererParams: IDetailCellRendererParams<
  //   RentalOrderInfo,
  //   ProductDetails
  // > = {
  //   detailGridOptions: {
  //     columnDefs: [
  //       { field: "name", headerName: "Name" },
  //       { field: "price", headerName: "Price" },
  //     ] as ColDef<ProductDetails>[],
  //   },
  //   getDetailRowData: (params) => {
  //     console.log("DETAIL ROW DATA:", params.data);
  //     params.successCallback(params.data.product_details || []);
  //   },
  // };

  return (
    <>
      <CustomTable
        isLoading={false}
        colDefs={rentalOrderColDef}
        rowData={orderData}
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
        masterDetail={true}
        handleCellEditingStopped={handleCellEditingStopped}
        onGetRowId={handleGetRowId}
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
