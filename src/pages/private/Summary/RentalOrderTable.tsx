import CustomTable from "../../../styled/CustomTable";
import type {
  CellEditingStoppedEvent,
  ColDef,
  ICellRendererParams,
  RowHeightParams,
  ValueFormatterParams,
  ValueGetterParams,
} from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import {
  BillingMode,
  DepositType,
  RentalOrderType,
  RentalType,
} from "../../../types/order";
import DeleteOrderModal from "../Contacts/modals/DeleteOrderModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import {
  calculateDiscountAmount,
  calculateProductRent,
} from "../../../services/utility_functions";
import { currencyFormatter } from "./utils";
import dayjs from "dayjs";

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

  const gridApiRef = useRef(null);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  const customerList = useRef<IdNamePair[]>([]);

  const expiredOrderIds = useMemo(
    () => new Set(expiredOrders.map((order) => order.order_id)),
    [expiredOrders]
  );

  const orderData = rentalOrders.map((order) => ({ ...order }));

  // Child passes grid API up
  const onGridReady = (api: null) => {
    gridApiRef.current = api;
  };

  const [deleteOrderOpen, setDeleteOrderOpen] = useState<boolean>(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string>("");

  const calculateTotalAmount = (orderInfo: RentalOrderType) => {
    if (orderInfo.type === ProductType.RENTAL && orderInfo.product_details) {
      let total = 0;
      if (orderInfo.billing_mode === BillingMode.B2C) {
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
    const ewayBillAmount = orderInfo.eway_amount || 0;
    const discountAmount = calculateDiscountAmount(
      orderInfo.discount || 0,
      finalAmount
    );
    const gstAmount = calculateDiscountAmount(
      orderInfo.gst || 0,
      finalAmount - discountAmount
    );
    return parseFloat(
      (
        finalAmount -
        discountAmount +
        gstAmount +
        roundOff +
        ewayBillAmount
      ).toFixed(2)
    );
  };

  // const calculateRentAfterGST = (
  //   rent: number,
  //   gst: number,
  //   orderInfo: RentalOrderType
  // ) => {
  //   if (orderInfo.billing_mode === BillingMode.B2C) {
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
      pinned: "left",
      filter: "agTextColumnFilter",
      cellRenderer: "agGroupCellRenderer",
      sort: "desc",
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
        return dayjs(date).format("DD-MMM-YYYY hh:mm A");
      },
    },
    {
      field: "rental_duration",
      headerName: "Rental Duration (Days)",
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
        const date = params.value ? new Date(params.value) : "";
        if (date) return dayjs(date).format("DD-MMM-YYYY hh:mm A");
        return "";
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
      filter: "agTextColumnFilter",
      cellEditor: AutocompleteCellEditor,
      cellEditorParams: {
        customerOptions: customerList.current,
      },
      valueParser: (params) => {
        return params.newValue;
      },
      valueFormatter: (params) => {
        return params.value.name ?? "";
      },
      filterValueGetter: (params: ValueGetterParams) => {
        return params.data.customer.name;
      },
    },
    {
      field: "event_name",
      headerName: "Event Name",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: AddressCellEditor,
    },
    {
      field: "event_venue",
      headerName: "Event Venue",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: AddressCellEditor,
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
        options: ["B2C", "B2B"],
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
    },
    {
      headerName: "GST Amount",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      maxWidth: 200,
      filter: "agTextColumnFilter",
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const gstPercent = parseFloat(params.data.gst ?? 0);
        const totalAmount = calculateTotalAmount(params.data);
        if (isNaN(gstPercent) || isNaN(totalAmount)) return 0;
        return (gstPercent / 100) * totalAmount;
      },
    },
    {
      field: "discount",
      headerName: "Discount(%)",
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
    },
    {
      field: "discount_amount",
      headerName: "Discount Amount",
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
      valueFormatter: (params) => {
        const data = params.data;
        if (data && data.type === ProductType.RENTAL && data.product_details) {
          const percent = data.discount;
          const total_amount = calculateTotalAmount(data);
          const discount_amount = parseFloat(
            (total_amount * percent * 0.01).toFixed(2)
          );
          return `₹${discount_amount.toFixed(2)}`;
        }
        return "0";
      },
    },
    {
      field: "round_off",
      headerName: "Round Off",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      maxWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      valueFormatter: currencyFormatter,
      singleClickEdit: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        step: 1,
      },
    },
    {
      field: "eway_amount",
      headerName: "Transport Amount",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      maxWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      valueFormatter: currencyFormatter,
      singleClickEdit: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        step: 1,
      },
    },
    {
      field: "eway_mode",
      headerName: "Transport Payment Mode",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ["cash", "account", "upi"],
      },
    },
    {
      headerName: "Amount (After Taxes)",
      flex: 1,
      minWidth: 200,
      headerClass: "ag-header-wrap",
      filter: "agNumberColumnFilter",
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const value = calculateFinalAmount(params.data);
        return isNaN(value) ? null : value;
      },
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        return <p>₹ {calculateFinalAmount(data)}</p>;
      },
    },
    {
      headerName: "Deposit Amount",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      maxWidth: 200,
      filter: "agNumberColumnFilter",
      valueFormatter: currencyFormatter,
      valueGetter: (params: ValueGetterParams) => {
        const depositData: DepositType[] = params.data.deposits ?? 0;
        return depositData.reduce(
          (total, deposit) => total + deposit.amount,
          0
        );
      },
    },
    {
      headerName: "Outstanding Amount",
      flex: 1,
      minWidth: 200,
      headerClass: "ag-header-wrap",
      filter: "agNumberColumnFilter",
      valueGetter: (params: ValueGetterParams) => {
        const depositData: DepositType[] = params.data.deposits ?? 0;
        const value =
          calculateFinalAmount(params.data) -
          depositData.reduce((total, deposit) => total + deposit.amount, 0);

        return isNaN(value) ? null : value;
      },
      cellRenderer: (params: ICellRendererParams) => {
        const data = params.data;
        const depositData: DepositType[] = params.data.deposits ?? 0;
        return (
          <p>
            ₹{" "}
            {(
              calculateFinalAmount(data) -
              depositData.reduce((total, deposit) => total + deposit.amount, 0)
            ).toFixed(2)}
          </p>
        );
      },
    },
    {
      field: "remarks",
      headerName: "Remarks",
      flex: 1,
      headerClass: "ag-header-wrap",
      minWidth: 200,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: AddressCellEditor,
      valueFormatter: (params) => {
        return params.value?.replace(/\n/g, " ") ?? "";
      },
    },
    {
      field: "payment_mode",
      headerName: "Payment Mode",
      headerClass: "ag-header-wrap",
      minWidth: 150,
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ["cash", "account", "upi"],
      },
    },
    {
      field: "status",
      headerName: "Payment Status",
      headerClass: "ag-header-wrap",
      minWidth: 120,
      pinned: "right",
      filter: "agTextColumnFilter",
      editable: true,
      singleClickEdit: true,
      valueFormatter: (params: ValueFormatterParams) => {
        const status = params.data.status;
        if (status === "paid") return "paid";
        if (status === "pending") {
          const data = params.data;
          const depositData: DepositType[] = params.data.deposits ?? 0;

          const total =
            calculateFinalAmount(data) -
            depositData.reduce((total, deposit) => total + deposit.amount, 0);

          return total > 0 ? "pending (customer)" : "pending (us)";
        }
        return status;
      },
      cellEditor: SelectCellEditor,
      cellEditorParams: {
        options: ["paid", "pending"],
      },
      cellStyle: (params) => {
        const data = params.data;
        if (data) {
          const depositData: DepositType[] = data.deposits ?? 0;

          const total =
            calculateFinalAmount(data) -
            depositData.reduce((total, deposit) => total + deposit.amount, 0);

          const status = data.status;

          if (status === "paid") {
            return { backgroundColor: "#bbf7d0", color: "#166534" }; // green
          }

          if (status === "pending") {
            if (total > 0) {
              return { backgroundColor: "#fca5a5", color: "#7f1d1d" }; // red for us
            } else {
              return { backgroundColor: "#fde68a", color: "#78350f" }; // yellow for customer
            }
          }
        }

        return { backgroundColor: "#bfdbfe", color: "#1e3a8a" }; // default blue or fallback
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
    let field = colDef.field;
    if (!field || newValue === oldValue) return;
    try {
      let value = newValue;

      //expandedRows
      const expanded: string[] = [];
      if (gridApiRef.current !== null) {
        gridApiRef.current.forEachNode((node) => {
          if (node.expanded) expanded.push(node.data._id);
        });
      }
      setExpandedRowIds(expanded);

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

      if (field === "status") {
        if (typeof newValue === "string" && newValue.includes("pending"))
          value = "pending";
      }

      if (field === "discount_amount") {
        field = "discount";
        if (calculateTotalAmount(data))
          value = ((newValue / calculateTotalAmount(data)) * 100).toFixed(2);
        else value = 0;
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

  const handleRowHeight = (params: RowHeightParams) => {
    if (params.node.detail) {
      return 300;
    }
    return 45;
  };

  const onRowDataUpdated = useCallback(() => {
    if (gridApiRef.current === null) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gridApiRef?.current?.forEachNode((node: any) => {
      if (expandedRowIds.includes(node.data._id)) {
        node.setExpanded(true);
      }
    });
  }, [expandedRowIds]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRowGroupOpened = (params: any) => {
    const rowId = params.node.data?._id;
    if (!rowId) return;

    setExpandedRowIds((prev) => {
      if (prev) {
        if (params.node.expanded) {
          return prev.includes(rowId) ? prev : [...prev, rowId];
        } else {
          return prev.filter((id) => id !== rowId);
        }
      } else {
        return [rowId];
      }
    });
  };

  useEffect(() => {
    console.log(orderData);
  }, [orderData]);

  return (
    <>
      <CustomTable
        isLoading={false}
        colDefs={rentalOrderColDef}
        rowData={orderData}
        onGridReady={onGridReady}
        getRowStyle={(params) => {
          const orderId = params.data?.order_id;
          if (orderId && expiredOrderIds.has(orderId)) {
            return {
              backgroundColor: "#D1D1D1",
            };
          }
          return {
            backGroundColor: "white",
          };
        }}
        onRowGroupOpened={onRowGroupOpened}
        masterDetail={true}
        handleCellEditingStopped={handleCellEditingStopped}
        getRowHeight={handleRowHeight}
        onRowDataUpdated={onRowDataUpdated}
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
