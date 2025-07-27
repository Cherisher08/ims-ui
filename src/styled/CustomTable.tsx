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
  IDetailCellRendererParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
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
import { useMemo } from "react";
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
  getRowStyle?: (params: RowClassParams<T, any>) => RowStyle | undefined;
  handleCellEditingStopped?: (params: CellEditingStoppedEvent) => void;
  onGetRowId?: (params: GetRowIdParams) => string;
  detailCellRendererParams?: IDetailCellRendererParams;
};

const CustomTable = <T,>({
  rowData,
  colDefs,
  isLoading,
  rowHeight = 40,
  masterDetail = false,
  rowModelType = "clientSide",
  pagination = true,
  getRowStyle = () => {
    return {};
  },
  handleCellEditingStopped = () => {
    return;
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
        suppressMenuHide={false}
        masterDetail={masterDetail}
        pagination={pagination}
        rowModelType={rowModelType}
        headerHeight={40}
        paginationPageSize={10}
        rowHeight={rowHeight}
        detailRowHeight={400}
        getRowHeight={(params) => {
          if (params.node.detail) {
            const productCount = params.data?.product_details?.length || 0;
            const depositsCount = params.data?.deposits?.length || 0;
            return (productCount + depositsCount) * 80 + 100;
          }
          return 50;
        }}
        getRowStyle={(params) => getRowStyle(params)}
        components={{
          customDetailRenderer: CustomDetailRenderer,
        }}
        detailCellRenderer="customDetailRenderer"
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
