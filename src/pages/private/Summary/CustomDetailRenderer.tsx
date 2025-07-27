import { IDetailCellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

const CustomDetailRenderer = (props: IDetailCellRendererParams<any, any>) => {
  const productDetails = props.data.product_details || [];
  const deposits = props.data.deposits || [];
  console.log("deposits: ", deposits);

  return (
    <div className="px-10 py-4 bg-gray-200 h-full overflow-auto">
      <p className="font-semibold text-lg text-black">Products:</p>
      <div
        className="ag-theme-alpine"
        style={{ height: 200, marginBottom: 20 }}
      >
        <AgGridReact
          rowData={productDetails}
          suppressMenuHide={false}
          columnDefs={[
            { field: "name", headerName: "Name", flex: 1 },
            { field: "billing_unit", headerName: "Billing Unit", flex: 1 },
            { field: "out_date", headerName: "Out Date", flex: 1 },
            { field: "in_date", headerName: "In Date", flex: 1 },
            { field: "order_quantity", headerName: "Order Quantity", flex: 1 },
            {
              field: "order_repair_count",
              headerName: "Order Repair Count",
              flex: 1,
            },
          ]}
        />
      </div>

      <p className="font-semibold text-lg text-black">Deposits:</p>
      <div className="ag-theme-alpine" style={{ height: 150 }}>
        <AgGridReact
          rowData={deposits}
          suppressMenuHide={false}
          columnDefs={[
            { field: "amount", headerName: "Amount", flex: 1 },
            { field: "date", headerName: "Date", flex: 1 },
            {
              field: "product",
              headerName: "Product",
              valueFormatter: (params) => {
                const product = params.value || {};
                return product.name || " ";
              },
              flex: 1,
            },
            { field: "mode", headerName: "Mode", flex: 1 },
          ]}
        />
      </div>
    </div>
  );
};

export default CustomDetailRenderer;
