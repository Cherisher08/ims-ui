import type {
  CellEditingStoppedEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  RowClassParams,
  RowHeightParams,
  RowModelType,
  RowStyle,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  RowApiModule,
} from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  MasterDetailModule,
} from 'ag-grid-enterprise';
import { useCallback } from 'react';
import CustomDetailRenderer from '../pages/private/Orders/CustomDetailRenderer';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowApiModule,
  ColumnMenuModule,
  ContextMenuModule,
  ColumnsToolPanelModule,
  MasterDetailModule,
  AllCommunityModule,
  CellSelectionModule,
  ClipboardModule
]);

type CustomTableProps<T> = {
  rowData: T[];
  colDefs: ColDef<T>[];
  isLoading: boolean;
  pagination?: boolean;
  rowHeight?: number;
  masterDetail?: boolean;
  rowModelType?: RowModelType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onGridReady?: (api: GridApi<any>) => void;
  onRowDataUpdated?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowStyle?: (params: RowClassParams<T, any>) => RowStyle | undefined;
  handleCellEditingStopped?: (params: CellEditingStoppedEvent) => void;
  onGetRowId?: (params: GetRowIdParams) => string;
  getRowHeight?: (params: RowHeightParams) => number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowGroupOpened?: (params: any) => void;
  onFilterChanged?: () => void;
};

const CustomTable = <T,>({
  rowData,
  colDefs,
  isLoading,
  rowHeight = 40,
  masterDetail = false,
  rowModelType = 'clientSide',
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
  onRowGroupOpened = () => null,
  onFilterChanged = () => {},
}: CustomTableProps<T>) => {
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      onGridReady(params.api);
    },
    [onGridReady]
  );

  return (
    <div
      className="ag-theme-quartz"
      style={{ height: 'fit-content ', width: '100%', overflowY: 'auto' }}
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
        localeText={{ noRowsToShow: 'No data Found...' }}
        loading={isLoading}
        onGridReady={handleGridReady}
        onCellEditingStopped={handleCellEditingStopped}
        onFilterChanged={() => {
          onFilterChanged();
        }}
        cellSelection={true}
      />
    </div>
  );
};

export default CustomTable;
