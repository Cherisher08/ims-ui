import type {
  CellEditingStoppedEvent,
  ColDef,
  GetRowIdParams,
  RowClassParams,
  RowStyle,
  RowModelType,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  RowHeightParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  ModuleRegistry,
  AllCommunityModule,
  ClientSideRowModelModule,
  RowApiModule,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  MasterDetailModule,
} from "ag-grid-enterprise";
import { useCallback, useMemo } from "react";
import CustomDetailRenderer from "../pages/private/Summary/CustomDetailRenderer";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowApiModule,
  ColumnMenuModule,
  ContextMenuModule,
  ColumnsToolPanelModule,
  MasterDetailModule,
  AllCommunityModule,
]);

type CustomTableProps<T> = {
  rowData: T[];
  colDefs: ColDef<T>[];
  isLoading: boolean;
  pagination?: boolean;
  rowHeight?: number;
  masterDetail?: boolean;
  rowModelType?: RowModelType;
  onGridReady?: (api: { sizeColumnsToFit: () => void }) => void;
  onRowDataUpdated?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowStyle?: (params: RowClassParams<T, any>) => RowStyle | undefined;
  handleCellEditingStopped?: (params: CellEditingStoppedEvent) => void;
  onGetRowId?: (params: GetRowIdParams) => string;
  getRowHeight?: (params: RowHeightParams) => number | null;
  onRowGroupOpened?: () => null;
};

const CustomTable = <T,>({
  rowData,
  colDefs,
  isLoading,
  rowHeight = 40,
  masterDetail = false,
  rowModelType = "clientSide",
  pagination = true,
  onRowDataUpdated = () => {},
  onGridReady = (api: { sizeColumnsToFit: () => void }) => {
    api.sizeColumnsToFit();
  },
  getRowStyle = () => {
    return {};
  },
  handleCellEditingStopped = () => {
    return;
  },
  getRowHeight = () => null,
  onRowGroupOpened = () => {},
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

  const handleGridReady = useCallback(
    (params: { api: { sizeColumnsToFit: () => void } }) => {
      console.log(params.api);
      onGridReady(params.api);
    },
    [onGridReady]
  );

  return (
    <div
      className="ag-theme-quartz"
      style={{ height: "fit-content ", width: "100%", overflowY: "auto" }}
    >
      <AgGridReact<T>
        rowData={rowData}
        columnDefs={colDefs}
        suppressMenuHide={false}
        masterDetail={masterDetail}
        pagination={pagination}
        rowModelType={rowModelType}
        headerHeight={40}
        paginationPageSizeSelector={[10]}
        paginationPageSize={10}
        rowHeight={rowHeight}
        detailRowHeight={400}
        onRowDataUpdated={onRowDataUpdated}
        onRowGroupOpened={onRowGroupOpened}
        getRowHeight={getRowHeight}
        getRowStyle={(params) => getRowStyle(params)}
        components={{
          customDetailRenderer: CustomDetailRenderer,
        }}
        detailCellRenderer="customDetailRenderer"
        domLayout="autoHeight"
        localeText={{ noRowsToShow: "No data Found..." }}
        loading={isLoading}
        onGridReady={handleGridReady}
        autoSizeStrategy={autoSizeStrategy}
        onCellEditingStopped={handleCellEditingStopped}
      />
    </div>
  );
};

export default CustomTable;
