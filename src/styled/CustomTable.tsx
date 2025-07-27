import "ag-grid-community/styles/ag-theme-alpine.css";
import { useMemo } from "react";
import type {
  CellEditingStoppedEvent,
  ColDef,
  GetRowIdParams,
  RowClassParams,
  RowHeightParams,
  RowStyle,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  RowApiModule,
  AllCommunityModule,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  MasterDetailModule,
} from "ag-grid-enterprise";
ModuleRegistry.registerModules([
  RowApiModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  MasterDetailModule,
  ColumnMenuModule,
  ContextMenuModule,
  AllCommunityModule,
]);

type CustomTableProps<T> = {
  rowData: T[];
  colDefs: ColDef<T>[];
  isLoading: boolean;
  pagination?: boolean;
  rowHeight?: number;
  getRowStyle?: (params: RowClassParams<T, any>) => RowStyle | undefined;
  handleCellEditingStopped?: (params: CellEditingStoppedEvent) => void;
  getRowHeight?: (params: RowHeightParams) => number | null;
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
  getRowHeight = (params) => null,
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
        getRowHeight={getRowHeight}
      />
    </div>
  );
};

export default CustomTable;
