import type {
  CellEditingStoppedEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  PaginationChangedEvent,
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
  PaginationModule,
} from 'ag-grid-community';
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  MasterDetailModule,
  SetFilterModule,
} from 'ag-grid-enterprise';
import { useCallback, useState } from 'react';
import CustomDetailRenderer from '../pages/private/Orders/CustomDetailRenderer';
import { AutocompleteCellEditor } from '../components/AgGridCellEditors/AutocompleteCellEditor';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowApiModule,
  ColumnMenuModule,
  ContextMenuModule,
  ColumnsToolPanelModule,
  MasterDetailModule,
  AllCommunityModule,
  CellSelectionModule,
  ClipboardModule,
  PaginationModule,
  SetFilterModule,
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
  paginationPageSize?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pinnedBottomRowData?: any[];
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
  paginationPageSize = 10,
  pinnedBottomRowData = [],
}: CustomTableProps<T>) => {
  const [showPinnedBottomRow, setShowPinnedBottomRow] = useState<boolean>(() => !pagination);
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      onGridReady(params.api);
      // determine whether to show pinned bottom row initially
      if (pagination) {
        try {
          const isLast =
            params.api.paginationGetCurrentPage() === params.api.paginationGetTotalPages() - 1;
          setShowPinnedBottomRow(isLast);
        } catch (e) {
          console.log(e);
          setShowPinnedBottomRow(false);
        }
      } else {
        setShowPinnedBottomRow(true);
      }
    },
    [onGridReady, pagination]
  );
  const onPaginationChanged = useCallback(
    (params: PaginationChangedEvent) => {
      if (!pagination) {
        setShowPinnedBottomRow(true);
        return;
      }
      try {
        const isLast =
          params.api.paginationGetCurrentPage() === params.api.paginationGetTotalPages() - 1;
        setShowPinnedBottomRow(isLast);
      } catch (e) {
        console.log(e);
        setShowPinnedBottomRow(false);
      }
    },
    [pagination]
  );

  return (
    <div
      className="ag-theme-quartz"
      style={{ height: 'fit-content ', width: '100%', overflowY: 'auto' }}
    >
      <AgGridReact<T>
        rowData={rowData}
        columnDefs={colDefs}
        pinnedBottomRowData={showPinnedBottomRow ? pinnedBottomRowData : []}
        onPaginationChanged={onPaginationChanged}
        suppressMenuHide={false}
        masterDetail={masterDetail}
        pagination={pagination}
        rowModelType={rowModelType}
        headerHeight={40}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        paginationPageSize={paginationPageSize}
        rowHeight={rowHeight}
        detailRowHeight={400}
        onRowDataUpdated={onRowDataUpdated}
        onRowGroupOpened={onRowGroupOpened}
        getRowHeight={getRowHeight}
        getRowStyle={(params) => getRowStyle(params)}
        components={{
          customDetailRenderer: CustomDetailRenderer,
          AutocompleteCellEditor: AutocompleteCellEditor,
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
