import type {
  CellEditingStoppedEvent,
  ColDef,
  GetRowIdParams,
  RowClassParams,
  RowStyle,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

type CustomTableProps<T> = {
  rowData: T[];
  colDefs: ColDef<T>[];
  isLoading: boolean;
  pagination?: boolean;
  rowHeight?: number;
  getRowStyle?: (params: RowClassParams<T, any>) => RowStyle | undefined;
  handleCellEditingStopped?: (params: CellEditingStoppedEvent) => void;
  onGetRowId?: (params: GetRowIdParams) => string;
};

const CustomTable = <T,>({
  rowData,
  colDefs,
  isLoading,
  rowHeight = 40,
  pagination = true,
  getRowStyle = () => {
    return {};
  },
  handleCellEditingStopped = () => {
    return;
  },
  onGetRowId = () => {
    return "";
  },
}: CustomTableProps<T>) => {
  const autoSizeStrategy = useMemo<
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy
  >(() => {
    return {
      type: "fitCellContents",
      defaultMinWidth: 150,
    };
  }, []);

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
        getRowStyle={(params) => getRowStyle(params)}
        domLayout="autoHeight"
        localeText={{ noRowsToShow: "No data Found..." }}
        loading={isLoading}
        autoSizeStrategy={autoSizeStrategy}
        onCellEditingStopped={handleCellEditingStopped}
        // getRowId={onGetRowId}
      />
    </div>
  );
};

export default CustomTable;
