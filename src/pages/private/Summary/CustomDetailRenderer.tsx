import {
  CellEditingStoppedEvent,
  IDetailCellRendererParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { InDateCellEditor } from "../../../components/AgGridCellEditors/InDateCellEditor";
import { SelectCellEditor } from "../../../components/AgGridCellEditors/SelectCellEditor";
import { ProductDetails, RentalType } from "../../../types/order";
import { FaPlus } from "react-icons/fa";
import CustomButton from "../../../styled/CustomButton";
// import { usePatchRentalOrderMutation } from "../../../services/OrderService";

const CustomDetailRenderer = (
  props: IDetailCellRendererParams<RentalType, any>
) => {
  const orderData = { ...props.data };
  const productDetails = orderData.product_details?.map((product) => ({
    ...product,
  }));
  const deposits = orderData.deposits?.map((deposit) => ({ ...deposit }));
  // const [patchRentalOrder] = usePatchRentalOrderMutation();

  const handleCellEditingStopped = async (event: CellEditingStoppedEvent) => {
    const { data, colDef, oldValue, newValue } = event;
    const field = colDef.field;
    console.log(field, data);
    if (!field || newValue === oldValue) return;

    try {
      let value = newValue;

      console.log(value);

      // Special case for customer field
      // if (field === "customer") {
      //   if (!isGetContactsSuccess) {
      //     console.error("Customer query not retrieved yet");
      //     return;
      //   }
      //   const customer = contactsQueryData.find((c) => c._id === newValue._id);
      //   if (!customer) {
      //     console.error("Customer not found for ID:", newValue);
      //     return;
      //   }
      //   value = { ...customer };
      // }

      // const patchPayload: PatchOperation[] = [
      //   {
      //     op: "replace",
      //     path: `/${field}`,
      //     value,
      //   },
      // ];

      // await patchRentalOrder({ id: data._id, payload: patchPayload }).unwrap();
      console.log(`Successfully patched ${field} for order ${data._id}`);
    } catch (err) {
      console.error("Failed to patch rental order:", err);
      // Optional: revert or notify
    }
  };

  return (
    <div className="px-10 py-4 bg-gray-200 h-full overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg text-black">Products:</p>
        <CustomButton icon={<FaPlus />} onClick={() => {}} label="Product" />
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: 200, marginBottom: 20 }}
      >
        <AgGridReact
          rowData={productDetails}
          suppressMenuHide={false}
          columnDefs={[
            { field: "name", headerName: "Name", flex: 1 },
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
          onCellEditingStopped={handleCellEditingStopped}
        />
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg text-black">Deposits:</p>
        <CustomButton icon={<FaPlus />} onClick={() => {}} label="Deposit" />
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
              cellEditor: SelectCellEditor,
              cellEditorParams: {
                options: productDetails.map((p: ProductDetails) => p.name),
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
                options: ["Retail", "Business"],
              },
            },
          ]}
          onCellEditingStopped={handleCellEditingStopped}
        />
      </div>
    </div>
  );
};

export default CustomDetailRenderer;
