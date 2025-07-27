import {
  CellEditingStoppedEvent,
  IDetailCellRendererParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { InDateCellEditor } from "../../../components/AgGridCellEditors/InDateCellEditor";
import { SelectCellEditor } from "../../../components/AgGridCellEditors/SelectCellEditor";
import { RentalType } from "../../../types/order";
import { FaPlus } from "react-icons/fa";
import CustomButton from "../../../styled/CustomButton";
import { PatchOperation } from "../../../types/common";
import { usePatchRentalOrderMutation } from "../../../services/OrderService";
import { AutocompleteCellEditor } from "../../../components/AgGridCellEditors/AutocompleteCellEditor";
import { getDefaultDeposit, getDefaultProduct } from "./utils";
// import { usePatchRentalOrderMutation } from "../../../services/OrderService";

const CustomDetailRenderer = (
  props: IDetailCellRendererParams<RentalType, any>
) => {
  const [patchRentalOrder] = usePatchRentalOrderMutation();
  const orderData = { ...props.data };
  const productDetails =
    orderData.product_details?.map((product) => ({
      ...product,
    })) || [];
  const deposits = orderData.deposits?.map((deposit) => ({ ...deposit })) || [];
  const productPairs =
    orderData.product_details?.map((product) => {
      return {
        _id: product._id,
        name: product.name,
      };
    }) || [];
  // const [patchRentalOrder] = usePatchRentalOrderMutation();

  const handleProductCellEditing = async (event: CellEditingStoppedEvent) => {
    const { rowIndex, colDef, oldValue, newValue } = event;
    const field = colDef.field;
    if (!field || newValue === oldValue) return;

    try {
      let value = newValue;
      const patchPayload: PatchOperation[] = [];
      if (field === "name") {
        value = newValue.name;
        patchPayload.push({
          op: "replace",
          path: `/product_details/${rowIndex}/_id`,
          value: newValue._id,
        });
      }
      patchPayload.push({
        op: "replace",
        path: `/product_details/${rowIndex}/${field}`,
        value,
      });

      await patchRentalOrder({
        id: orderData._id!,
        payload: patchPayload,
      }).unwrap();
      console.log(`Successfully patched ${field} for order ${orderData._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optional: revert or notify
    }
  };

  const handleDepositCellEditing = async (event: CellEditingStoppedEvent) => {
    const { rowIndex, colDef, oldValue, newValue } = event;
    const field = colDef.field;
    if (!field || newValue === oldValue) return;

    try {
      const value = newValue;
      const patchPayload: PatchOperation[] = [
        {
          op: "replace",
          path: `/deposits/${rowIndex}/${field}`,
          value,
        },
      ];

      await patchRentalOrder({
        id: orderData._id!,
        payload: patchPayload,
      }).unwrap();
      console.log(`Successfully patched ${field} for order ${orderData._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optional: revert or notify
    }
  };

  const handleNewProduct = async () => {
    const product = getDefaultProduct();
    const patchPayload: PatchOperation[] = [
      {
        op: "add",
        path: `/product_details`,
        value: product,
      },
    ];
    try {
      await patchRentalOrder({
        id: orderData._id!,
        payload: patchPayload,
      }).unwrap();
      console.log(`Successfully patched for order ${orderData._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optional: revert or notify
    }
  };

  const handleNewDeposit = async () => {
    const deposit = getDefaultDeposit(productPairs);
    const patchPayload: PatchOperation[] = [
      {
        op: "add",
        path: `/deposits`,
        value: deposit,
      },
    ];
    try {
      await patchRentalOrder({
        id: orderData._id!,
        payload: patchPayload,
      }).unwrap();
      console.log(`Successfully patched ${deposit} for order ${orderData._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optional: revert or notify
    }
  };

  return (
    <div className="px-10 py-4 bg-gray-200 h-full overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg text-black">Products:</p>
        <CustomButton
          icon={<FaPlus />}
          onClick={() => handleNewProduct()}
          label="Product"
        />
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: 200, marginBottom: 20 }}
      >
        <AgGridReact
          rowData={productDetails}
          suppressMenuHide={false}
          columnDefs={[
            {
              field: "name",
              headerName: "Name",
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: AutocompleteCellEditor,
              cellEditorParams: {
                customerOptions: productPairs,
              },
            },
            {
              field: "billing_unit",
              headerName: "Billing Unit",
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: SelectCellEditor,
              cellEditorParams: {
                options: ["shift", "days", "weeks", "months"],
              },
            },
            {
              field: "out_date",
              headerName: "Out Date",
              flex: 1,
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
              headerName: "In Date",
              flex: 1,
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
              field: "order_quantity",
              headerName: "Order Quantity",
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: "agTextCellEditor",
              cellEditorParams: {
                step: 1,
              },
            },
            {
              field: "order_repair_count",
              headerName: "Order Repair Count",
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: "agTextCellEditor",
              cellEditorParams: {
                step: 1,
              },
            },
          ]}
          onCellEditingStopped={handleProductCellEditing}
        />
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg text-black">Deposits:</p>
        <CustomButton
          icon={<FaPlus />}
          onClick={() => handleNewDeposit()}
          label="Deposit"
        />
      </div>
      <div className="ag-theme-alpine" style={{ height: 150 }}>
        <AgGridReact
          rowData={deposits}
          suppressMenuHide={false}
          columnDefs={[
            {
              field: "amount",
              headerName: "Amount",
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: "agTextCellEditor",
              cellEditorParams: {
                step: 1,
              },
            },
            {
              field: "date",
              headerName: "Date",
              flex: 1,
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
              field: "product",
              headerName: "Product",
              valueFormatter: (params) => {
                const product = params.value || {};
                return product.name || " ";
              },
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: AutocompleteCellEditor,
              cellEditorParams: {
                customerOptions: productPairs,
              },
            },
            {
              field: "mode",
              headerName: "Mode",
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: SelectCellEditor,
              cellEditorParams: {
                options: ["cash", "account", "upi"],
              },
            },
          ]}
          onCellEditingStopped={handleDepositCellEditing}
        />
      </div>
    </div>
  );
};

export default CustomDetailRenderer;
