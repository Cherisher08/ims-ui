import CustomTable from "../../../styled/CustomTable";
import type {
  CellEditingStoppedEvent,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import {
  BillingMode,
  // ProductDetails,
  RentalOrderType,
  RentalType,
} from "../../../types/order";
import DeleteOrderModal from "../Contacts/modals/DeleteOrderModal";
import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { PatchOperation, ProductType } from "../../../types/common";
import { usePatchRentalOrderMutation } from "../../../services/OrderService";
import { InDateCellEditor } from "../../../components/AgGridCellEditors/InDateCellEditor";
import { useGetContactsQuery } from "../../../services/ContactService";
import { IdNamePair } from "../Inventory";
import { AutocompleteCellEditor } from "../../../components/AgGridCellEditors/AutocompleteCellEditor";
import { AddressCellEditor } from "../../../components/AgGridCellEditors/AddressCellEditor";
import { SelectCellEditor } from "../../../components/AgGridCellEditors/SelectCellEditor";
import { gstPercentSetter } from "./utls";
import {
  calculateDiscountAmount,
  calculateProductRent,
} from "../../../services/utility_functions";

const RentalOrderTable = ({
  rentalOrders,
}: {
  rentalOrders: RentalOrderType[];
}) => {
  const navigate = useNavigate();
  const expiredOrders = useSelector(
    (state: RootState) => state.rentalOrder.data
  );
  const [patchRentalOrder] = usePatchRentalOrderMutation();
  const { data: contactsQueryData, isSuccess: isGetContactsSuccess } =
    useGetContactsQuery();

  const customerList = useRef<IdNamePair[]>([]);

  const expiredOrderIds = useMemo(
    () => new Set(expiredOrders.map((order) => order.order_id)),
    [expiredOrders]
  );

  const orderData = rentalOrders.map((order) => ({ ...order }));
  console.log("orderData: ", orderData);

  // const patchOrder = async (patchPayload: PatchPayload) => {
  //   // Call your API here (RTK Query, axios, fetch, etc.)
  //   console.log("Patching order", patchPayload);
  // };

  const [deleteOrderOpen, setDeleteOrderOpen] = useState<boolean>(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string>("");

  const calculateTotalAmount = (orderInfo: RentalOrderType) => {
    if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
      let total = 0;
      if (orderInfo.billing_mode === BillingMode.RETAIL) {
        total = orderInfo.product_details.reduce((sum, prod) => {
          const rent_per_unit = calculateProductRent(prod);
          const exclusiveAmount = rent_per_unit / (1 + orderInfo.gst / 100);
          return sum + exclusiveAmount;
        }, 0);
      } else {
        total = orderInfo.product_details.reduce((sum, prod) => {
          return sum + calculateProductRent(prod);
        }, 0);
      }

      return parseFloat(total.toFixed(2));
    }
    return 0;
  };

  const calculateFinalAmount = (orderInfo: RentalOrderType) => {
    const finalAmount = calculateTotalAmount(orderInfo);
    const roundOff = orderInfo.round_off || 0;
    const discountAmount = calculateDiscountAmount(
      orderInfo.discount || 0,
      finalAmount
    );
    const gstAmount = calculateDiscountAmount(
      orderInfo.gst || 0,
      finalAmount - discountAmount
    );
    return parseFloat(
      (finalAmount - discountAmount + gstAmount + roundOff).toFixed(2)
    );
  };

  // const calculateRentAfterGST = (
  //   rent: number,
  //   gst: number,
  //   orderInfo: RentalOrderType
  // ) => {
  //   if (orderInfo.billing_mode === BillingMode.RETAIL) {
  //     const exclusiveAmount = rent / (1 + gst / 100);
  //     return Math.round(exclusiveAmount * 100) / 100;
  //   } else {
  //     return rent;
  //   }
  // };

  const rentalOrderColDef: ColDef<RentalType>[] = [
    {
      field: "order_id",
      headerName: "Order Id",
      headerClass: "ag-header-wrap",
      minWidth: 100,
      filter: "agTextColumnFilter",
      cellRenderer: "agGroupCellRenderer",
    },
    {
      field: "out_date",
      headerName: "Order Out Date",
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
      editable: true,
      singleClickEdit: true,
      cellDataType: "text",
      cellEditor: AutocompleteCellEditor,
      cellEditorParams: {
        customerOptions: customerList.current,
      },
      valueFormatter: (params) => {
        return params.value.name ?? "";
      },
    },
    {
      field: "event_address",
      headerName: "Event Address",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: AddressCellEditor,
      autoHeight: true, // required to allow row to grow
      valueFormatter: (params) => {
        return params.value?.replace(/\n/g, " ") ?? "";
      },
    },
    {
      field: "billing_mode",
      headerName: "GST Mode",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ["Retail", "Business"],
      },
    },
    {
      field: "gst",
      headerName: "GST(%)",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      maxWidth: 200,
      filter: "agNumberColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        step: 1,
      },
      valueSetter: gstPercentSetter,
    },
    {
      field: "gst_amount",
      headerName: "GST Amount",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      maxWidth: 200,
      filter: "agNumberColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: "agTextCellEditor",
      cellEditorParams: {
        step: 1,
      },
    },
    {
      headerName: "Total Amount",
      flex: 1,
      minWidth: 150,
      headerClass: "ag-header-wrap",
      filter: "agNumberColumnFilter",
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        return <p>₹ {calculateFinalAmount(data)}</p>;
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
    const { data, colDef, oldValue, newValue } = event;
    const field = colDef.field;

    if (!field || newValue === oldValue) return;

    try {
      let value = newValue;

      // Special case for customer field
      if (field === "customer") {
        if (!isGetContactsSuccess) {
          console.error("Customer query not retrieved yet");
          return;
        }
        const customer = contactsQueryData.find((c) => c._id === newValue._id);
        if (!customer) {
          console.error("Customer not found for ID:", newValue);
          return;
        }
        value = { ...customer };
      }

      const patchPayload: PatchOperation[] = [
        {
          op: "replace",
          path: `/${field}`,
          value,
        },
      ];

      await patchRentalOrder({ id: data._id, payload: patchPayload }).unwrap();
      console.log(`Successfully patched ${field} for order ${data._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optional: revert or notify
    }
  };

  useEffect(() => {
    if (isGetContactsSuccess) {
      customerList.current = contactsQueryData.map((contact) => {
        return {
          _id: contact._id,
          name: `${contact.name}-${contact.personal_number}`,
        };
      });
    }
  }, [contactsQueryData, isGetContactsSuccess]);

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
