import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

type CustomTableProps<T> = {
  rowData: T[];
  colDefs: ColDef<T>[];
  isLoading: boolean;
  pagination?: boolean;
  rowHeight?: number;
};

const CustomTable = <T,>({
  rowData,
  colDefs,
  isLoading,
  rowHeight = 40,
  pagination = true,
}: CustomTableProps<T>) => {
  return (
    <div
      className="ag-theme-alpine"
      style={{ height: "fit-content ", width: "100%", overflowY: "auto" }}
    >
      <AgGridReact<T>
        rowData={rowData}
        columnDefs={colDefs}
        pagination={pagination}
        headerHeight={40}
        paginationPageSize={10}
        rowHeight={rowHeight}
        domLayout="autoHeight"
        localeText={{ noRowsToShow: "No data Found..." }}
        loading={isLoading}
      />
    </div>
  );
};

export default CustomTable;
