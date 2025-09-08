import {
  CellEditingStoppedEvent,
  ICellRendererParams,
  IDetailCellRendererParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import { AutocompleteCellEditor } from '../../../components/AgGridCellEditors/AutocompleteCellEditor';
import { InDateCellEditor } from '../../../components/AgGridCellEditors/InDateCellEditor';
import { SelectCellEditor } from '../../../components/AgGridCellEditors/SelectCellEditor';
import { useGetProductsQuery } from '../../../services/ApiService';
import { usePatchRentalOrderMutation } from '../../../services/OrderService';
import { calculateProductRent } from '../../../services/utility_functions';
import CustomButton from '../../../styled/CustomButton';
import { PatchOperation, Product } from '../../../types/common';
import { RentalType } from '../../../types/order';
import { IdNamePair } from '../Stocks';
import { currencyFormatter, getDefaultDeposit, getDefaultProduct } from './utils';
// import { usePatchRentalOrderMutation } from "../../../services/OrderService";

const CustomDetailRenderer = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: IDetailCellRendererParams<RentalType, any>
) => {
  const { data: productsData, isSuccess: isProductsQuerySuccess } = useGetProductsQuery();
  const productList = useRef<Product[]>([]);
  const [productListPairs, setProductListPairs] = useState<IdNamePair[]>([]);
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
      if (field === 'name') {
        const newProduct = productList.current.find((product) => product._id === newValue._id);
        value = newValue.name;
        patchPayload.push({
          op: 'replace',
          path: `/product_details/${rowIndex}/_id`,
          value: newValue._id,
        });
        patchPayload.push({
          op: 'replace',
          path: `/product_details/${rowIndex}/rent_per_unit`,
          value: newProduct?.rent_per_unit,
        });
        patchPayload.push({
          op: 'replace',
          path: `/product_details/${rowIndex}/product_unit`,
          value: newProduct?.unit,
        });
        patchPayload.push({
          op: 'replace',
          path: `/product_details/${rowIndex}/product_code`,
          value: newProduct?.product_code,
        });
      }
      if (field === 'billing_unit' || field === 'out_date' || field === 'in_date') {
        if (rowIndex !== null && !isNaN(rowIndex)) {
          const currentProduct = productDetails[rowIndex];
          const duration = calculateProductRent(currentProduct, true);
          patchPayload.push({
            op: 'replace',
            path: `/product_details/${rowIndex}/duration`,
            value: duration,
          });
        }
      }

      patchPayload.push({
        op: 'replace',
        path: `/product_details/${rowIndex}/${field}`,
        value,
      });
      await patchRentalOrder({
        id: orderData._id!,
        payload: patchPayload,
      }).unwrap();
      console.log(`Successfully patched ${field} for order ${orderData._id}`);
    } catch (err) {
      console.error('Failed to patch rental order:', err);
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
          op: 'replace',
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
      console.error('Failed to patch rental order:', err);
      // Optional: revert or notify
    }
  };

  const handleNewProduct = async () => {
    const outDate = new Date(orderData.out_date || '');
    const expectedDate = new Date(outDate);
    expectedDate.setDate(outDate.getDate() + (orderData.rental_duration ?? 0));
    const product = getDefaultProduct(orderData.out_date || '', expectedDate.toISOString());
    const patchPayload: PatchOperation[] = [
      {
        op: 'add',
        path: '/product_details',
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
      console.error('Failed to patch rental order:', err);
      // Optional: revert or notify
    }
  };

  const deleteSubItem = async (rowId: number | null, target: string) => {
    if (rowId !== null) {
      const patchPayload: PatchOperation[] = [
        {
          op: 'remove',
          path: `/${target}/${rowId}`,
        },
      ];
      try {
        await patchRentalOrder({
          id: orderData._id!,
          payload: patchPayload,
        }).unwrap();
        console.log(`Successfully patched for order ${orderData._id}`);
      } catch (err) {
        console.error('Failed to patch rental order:', err);
        // Optional: revert or notify
      }
    }
  };

  const handleNewDeposit = async () => {
    const deposit = getDefaultDeposit(productPairs);
    const patchPayload: PatchOperation[] = [
      {
        op: 'add',
        path: '/deposits',
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
      console.error('Failed to patch rental order:', err);
    }
  };

  useEffect(() => {
    if (isProductsQuerySuccess) {
      productList.current = productsData;
      setProductListPairs(() => {
        return productsData.map((product) => {
          return { _id: product._id, name: product.name };
        });
      });
    }
  }, [isProductsQuerySuccess, productsData]);

  return (
    <div className="px-10 py-4 bg-gray-200 h-full overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg text-black">Products:</p>
        <CustomButton icon={<FaPlus />} onClick={() => handleNewProduct()} label="Product" />
      </div>
      <div className="ag-theme-alpine" style={{ height: 200, marginBottom: 20 }}>
        <AgGridReact
          rowData={productDetails}
          suppressMenuHide={false}
          onCellEditingStopped={handleProductCellEditing}
          columnDefs={[
            {
              field: 'name',
              headerName: 'Name',
              minWidth: 150,
              editable: true,
              singleClickEdit: true,
              cellEditor: AutocompleteCellEditor,
              cellEditorParams: {
                customerOptions: productListPairs,
              },
            },
            {
              field: 'billing_unit',
              headerName: 'Billing Unit',
              flex: 1,
              minWidth: 150,
              editable: true,
              singleClickEdit: true,
              cellEditor: SelectCellEditor,
              cellEditorParams: {
                options: ['shift', 'days', 'weeks', 'months'],
              },
            },
            {
              field: 'out_date',
              headerName: 'Out Date',
              minWidth: 100,
              editable: true,
              singleClickEdit: true,
              cellDataType: 'dateTime',
              cellEditor: InDateCellEditor,
              // cellEditorParams: {
              // format: "DD/MM/YYYY",
              // },
              valueFormatter: (params) => {
                const date = new Date(params.value);
                return dayjs(date).format('DD-MMM-YYYY');
              },
            },
            {
              field: 'in_date',
              headerName: 'In Date',
              editable: true,
              minWidth: 100,
              singleClickEdit: true,
              cellDataType: 'dateTime',
              cellEditor: InDateCellEditor,
              // cellEditorParams: {
              // format: "DD/MM/YYYY",
              // },
              valueFormatter: (params) => {
                const date = new Date(params.value);
                return dayjs(date).format('DD-MMM-YYYY');
              },
            },
            {
              field: 'duration',
              headerName: 'Total Duration',
              minWidth: 100,
              editable: true,
              singleClickEdit: true,
            },
            {
              headerName: 'Available Quantity',
              flex: 1,
              minWidth: 150,
              valueGetter: (params: ValueGetterParams) => {
                const product = productList.current.find((prod) => prod._id === params.data._id);
                return product?.available_stock;
              },
            },
            {
              field: 'order_quantity',
              headerName: 'Order Quantity',
              flex: 1,
              minWidth: 180,
              editable: true,
              singleClickEdit: true,
              cellEditor: 'agTextCellEditor',
              cellEditorParams: {
                step: 1,
              },
            },
            {
              field: 'order_repair_count',
              headerName: 'Order Repair Count',
              flex: 1,
              minWidth: 150,
              editable: true,
              singleClickEdit: true,
              cellEditor: 'agTextCellEditor',
              cellEditorParams: {
                step: 1,
              },
            },
            {
              field: 'rent_per_unit',
              headerName: 'Rent Per Unit',
              flex: 1,
              minWidth: 150,
              editable: true,
              singleClickEdit: true,
              cellEditor: 'agTextCellEditor',
              valueFormatter: currencyFormatter,
            },
            {
              headerName: 'Actions',
              pinned: 'right',
              maxWidth: 120,
              cellRenderer: (params: ICellRendererParams<RentalType>) => {
                const rowNode = params.node;
                return (
                  <div className="flex gap-2 h-[2rem] items-center">
                    <AiOutlineDelete
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        deleteSubItem(rowNode.rowIndex, 'product_details');
                      }}
                    />
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-lg text-black">Deposits:</p>
        <CustomButton icon={<FaPlus />} onClick={() => handleNewDeposit()} label="Deposit" />
      </div>
      <div className="ag-theme-alpine" style={{ height: 150 }}>
        <AgGridReact
          rowData={deposits}
          suppressMenuHide={false}
          columnDefs={[
            {
              field: 'amount',
              headerName: 'Amount',
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: 'agTextCellEditor',
              cellEditorParams: {
                step: 1,
              },
            },
            {
              field: 'date',
              headerName: 'Date',
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellDataType: 'dateTime',
              cellEditor: InDateCellEditor,
              valueFormatter: (params) => {
                const date = new Date(params.value);
                return dayjs(date).format('DD-MMM-YYYY hh:mm A');
              },
            },
            {
              field: 'product',
              headerName: 'Product',
              valueFormatter: (params) => {
                const product = params.value || {};
                return product.name || ' ';
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
              field: 'mode',
              headerName: 'Mode',
              flex: 1,
              editable: true,
              singleClickEdit: true,
              cellEditor: SelectCellEditor,
              cellEditorParams: {
                options: ['cash', 'account', 'upi'],
              },
            },
            {
              headerName: 'Actions',
              pinned: 'right',
              maxWidth: 120,
              cellRenderer: (params: ICellRendererParams<RentalType>) => {
                const rowNode = params.node;
                return (
                  <div className="flex gap-2 h-[2rem] items-center">
                    <AiOutlineDelete
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        deleteSubItem(rowNode.rowIndex, 'deposits');
                      }}
                    />
                  </div>
                );
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
