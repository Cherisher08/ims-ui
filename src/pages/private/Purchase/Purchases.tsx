import { Modal } from '@mui/material';
import type { ColDef, GridApi, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { MdClose, MdDelete, MdEdit, MdRemoveRedEye } from 'react-icons/md';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../../constants/constants';
import {
  useGetProductCategoriesQuery,
  useGetProductsQuery,
  useGetUnitsQuery,
} from '../../../services/ApiService';
import {
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchasesQuery,
  useUpdatePurchaseMutation,
} from '../../../services/PurchaseService';
import CustomAutoComplete, { CustomOptionProps } from '../../../styled/CustomAutoComplete';
import CustomButton from '../../../styled/CustomButton';
import CustomDatePicker from '../../../styled/CustomDatePicker';
import CustomFileInput from '../../../styled/CustomFileInput';
import CustomInput from '../../../styled/CustomInput';
import CustomSelect from '../../../styled/CustomSelect';
import CustomTable from '../../../styled/CustomTable';
import { DiscountType, discountTypeValues, Product, ProductType } from '../../../types/common';
import { PurchaseOrderInfo } from '../../../types/order';
import { transformIdNamePair, transformIdValuePair } from '../utils';
import ViewPdfModal from './ViewPdfModal';
import { dateFilterParams, parseDateFromString } from '../Orders/utils';

interface PurchaseRow {
  _id: string;
  order_id: string;
  purchase_date: string;
  supplier_name: string;
  total_products: number;
  total_amount: number;
  invoice_pdf_path?: string | null;
  actions?: string;
}

const Purchases = () => {
  const { data: purchaseData, isLoading: isPurchasesLoading } = useGetPurchasesQuery();
  const { data: productData } = useGetProductsQuery();
  const { data: productCategoryData, isSuccess: isProductCategoryQuerySuccess } =
    useGetProductCategoriesQuery();
  const { data: unitData, isSuccess: isUnitQuerySuccess } = useGetUnitsQuery();

  const [createPurchase, { isSuccess: isPurchaseCreated, isError: isPurchaseCreateError }] =
    useCreatePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();
  const [deletePurchase] = useDeletePurchaseMutation();
  const [newPurchaseData, setNewPurchaseData] = useState<Partial<PurchaseOrderInfo>>({
    order_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    products: [],
    invoice_id: '',
    supplier: {
      name: '',
      personal_number: '',
      gstin: '',
      office_number: '',
      email: '',
      address: '',
      pincode: '',
      address_proof: '',
      company_name: '',
    },
  });
  const [newProductData, setNewProductData] = useState<Partial<Product>>({
    _id: '',
    name: '',
    product_code: '',
    category: { _id: '', name: '' },
    unit: { _id: '', name: '' },
    type: ProductType.RENTAL,
    quantity: 0,
    price: 0,
    gst_percentage: 0,
    profit: 0,
    profit_type: DiscountType.PERCENT,
    rent_per_unit: 0,
    available_stock: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const [addPurchaseOpen, setAddPurchaseOpen] = useState<boolean>(false);
  const [editPurchaseOpen, setEditPurchaseOpen] = useState<boolean>(false);
  const [productCategories, setProductCategories] = useState<CustomOptionProps[]>([]);
  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState<boolean>(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const gridApiRef = useRef<GridApi | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [filteredData, setFilteredData] = useState<PurchaseRow[]>([]);

  const productTypes = [
    { id: ProductType.RENTAL, value: 'RENTAL' },
    { id: ProductType.SALES, value: 'SALES' },
  ];

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = useMemo(() => {
    if (!purchaseData) return [];
    const uniqueYears = new Set(purchaseData.map((p) => dayjs(p.purchase_date).year()));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [purchaseData]);

  const months = useMemo(() => {
    if (!selectedYear || !purchaseData) return [];
    const uniqueMonths = new Set(
      purchaseData
        .filter((p) => dayjs(p.purchase_date).year() === parseInt(selectedYear))
        .map((p) => dayjs(p.purchase_date).month() + 1)
    );
    return Array.from(uniqueMonths).sort((a, b) => a - b);
  }, [purchaseData, selectedYear]);

  const rowData = useMemo<PurchaseRow[]>(() => {
    return purchaseData
      ? purchaseData.map((purchase) => ({
          _id: purchase._id!,
          order_id: purchase.order_id,
          purchase_date: purchase.purchase_date,
          supplier_name: purchase.supplier?.name || 'N/A',
          total_products: purchase.products.length,
          total_amount: purchase.products.reduce((sum, p) => {
            const priceWithGst = +(
              Number(p.price || 0) *
              (1 + Number(p.gst_percentage || 0) / 100)
            ).toFixed(2);
            return sum + p.quantity * priceWithGst;
          }, 0),
          invoice_pdf_path: purchase.invoice_pdf_path || null,
        }))
      : [];
  }, [purchaseData]);

  const handleGridReady = useCallback((api: GridApi) => {
    gridApiRef.current = api;
  }, []);

  const handleFilterChanged = useCallback(() => {
    if (gridApiRef.current) {
      let sum = 0;
      gridApiRef.current.forEachNodeAfterFilter((node) => {
        sum += node.data.total_amount;
      });
      setTotalAmount(sum);
    }
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this purchase?')) {
        try {
          await deletePurchase(id).unwrap();
          toast.success('Purchase deleted successfully', {
            toastId: TOAST_IDS.SUCCESS_PURCHASE_DELETE,
          });
        } catch (error) {
          console.error('Error deleting purchase:', error);
          toast.error('Error deleting purchase', { toastId: TOAST_IDS.ERROR_PURCHASE_DELETE });
        }
      }
    },
    [deletePurchase]
  );

  const colDefs = useMemo<ColDef<PurchaseRow>[]>(
    () => [
      {
        field: 'order_id',
        headerName: 'Order ID',
        flex: 1,
        headerClass: 'ag-header-wrap',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'purchase_date',
        headerName: 'Purchase Date',
        flex: 1,
        headerClass: 'ag-header-wrap',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        filterValueGetter: (tableData: ValueGetterParams) => {
          const date = tableData.data.purchase_date ? tableData.data.purchase_date : null;
          const formattedDate = parseDateFromString(date);
          return formattedDate;
        },
        filterParams: dateFilterParams,
        cellRenderer: (params: ICellRendererParams<PurchaseRow>) => {
          return dayjs(params.value).format('DD-MM-YYYY HH:mm');
        },
      },
      {
        field: 'supplier_name',
        headerName: 'Supplier',
        flex: 1,
        headerClass: 'ag-header-wrap',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'total_products',
        headerName: 'Total Products',
        flex: 1,
        minWidth: 120,
        headerClass: 'ag-header-wrap',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'total_amount',
        headerName: 'Total Amount',
        flex: 1,
        minWidth: 120,
        headerClass: 'ag-header-wrap',
        filter: 'agNumberColumnFilter',
        cellRenderer: (params: ICellRendererParams<PurchaseRow>) => {
          return `₹${Number(params.value).toFixed(2)}`;
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<PurchaseRow>) => {
          const hasPdf = params.data?.invoice_pdf_path;
          return (
            <div className="flex gap-2">
              <MdEdit
                size={20}
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={() => {
                  const purchase = purchaseData?.find((p) => p._id === params.data?._id);
                  console.log('purchase: ', purchase);
                  console.log('params.data: ', params.data);
                  if (purchase) handleEdit(purchase);
                }}
              />
              <MdDelete
                size={20}
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => {
                  const purchase = purchaseData?.find((p) => p._id === params.data?._id);
                  if (purchase) handleDelete(purchase._id!);
                }}
              />
              <MdRemoveRedEye
                size={20}
                className={`cursor-pointer ${
                  hasPdf
                    ? 'text-green-500 hover:text-green-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (hasPdf) {
                    setSelectedPdf(hasPdf);
                    setPdfViewerOpen(true);
                  }
                }}
              />
            </div>
          );
        },
      },
    ],
    [handleDelete, purchaseData]
  );

  const addPurchase = async () => {
    if (!newPurchaseData.products || newPurchaseData.products.length === 0) {
      toast.error('Please add at least one product', { toastId: TOAST_IDS.ERROR_PURCHASE_CREATE });
      return;
    }

    try {
      // Check if all products have IDs; if not, remove empty IDs from products that don't have them
      const allProductsHaveIds = newPurchaseData.products.every(
        (p) => p._id && p._id.trim() !== ''
      );
      const purchaseToCreate = { ...newPurchaseData };
      if (!allProductsHaveIds) {
        purchaseToCreate.products = newPurchaseData.products.map((p) =>
          !p._id || p._id.trim() === '' ? { ...p, _id: undefined } : p
        );
      }
      // Create purchase order
      await createPurchase(purchaseToCreate as PurchaseOrderInfo).unwrap();
      setAddPurchaseOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Error creating purchase', { toastId: TOAST_IDS.ERROR_PURCHASE_CREATE });
    }
  };

  const getNewPurchaseId = (purchases: PurchaseOrderInfo[] | undefined) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month < 4 ? year - 1 : year;
    const endYear = startYear + 1;
    const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;

    const suffixes = (purchases || [])
      .map((p) => {
        const match = p.order_id?.match(/PO\/\d{2}-\d{2}\/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const maxSuffix = suffixes.length > 0 ? Math.max(...suffixes) : 0;
    const nextSuffix = (maxSuffix + 1).toString().padStart(4, '0');

    return `PO/${fy}/${nextSuffix}`;
  };

  const resetForm = () => {
    setNewPurchaseData({
      order_id: '',
      purchase_date: new Date().toISOString().split('T')[0],
      products: [],
      invoice_id: '',
      invoice_pdf: null,
      invoice_pdf_path: null,
    });
    setNewProductData({
      _id: '',
      name: '',
      product_code: '',
      category: { _id: '', name: '' },
      unit: { _id: '', name: '' },
      type: ProductType.RENTAL,
      quantity: 0,
      price: 0,
      gst_percentage: 0,
      profit: 0,
      profit_type: DiscountType.PERCENT,
      rent_per_unit: 0,
      available_stock: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    });
    setSelectedProduct(null);
    setIsNewProduct(false);
  };

  const handlePurchaseChange = (key: string, value: string | number | Date | File | null) => {
    setNewPurchaseData((prev) => {
      if (key.startsWith('supplier.')) {
        const supplierKey = key.split('.')[1];
        return {
          ...prev,
          supplier: {
            ...(prev.supplier || {
              name: '',
              personal_number: '',
              gstin: '',
              office_number: '',
              email: '',
              address: '',
              pincode: '',
              address_proof: '',
              company_name: '',
            }),
            [supplierKey]: value != null ? value.toString() : '',
          },
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleProductChange = (
    key: string,
    value: string | number | { _id: string; name: string } | ProductType | DiscountType | undefined
  ) => {
    setNewProductData((prev) => ({ ...prev, [key]: value }));
  };

  const addProductToPurchase = () => {
    if (!selectedProduct && !isNewProduct) {
      toast.error('Please select a product or choose to create a new one');
      return;
    }

    const productToAdd = selectedProduct || (newProductData as Product);

    // Calculate rent_per_unit for sales type products
    let rentPerUnit = productToAdd.rent_per_unit;
    if (productToAdd.type === ProductType.SALES) {
      const price = Number(newProductData.price || 0);
      const gstPerc = Number(newProductData.gst_percentage || 0);
      const profit = Number(newProductData.profit || 0);
      const profitType = newProductData.profit_type || DiscountType.PERCENT;
      const actualPrice = price * (1 + gstPerc / 100);
      const profitAmt = profitType === DiscountType.PERCENT ? (actualPrice * profit) / 100 : profit;
      rentPerUnit = +(actualPrice + profitAmt).toFixed(2);
    }

    const purchaseProduct = {
      _id: productToAdd._id,
      name: productToAdd.name,
      product_code: productToAdd.product_code,
      category: productToAdd.category,
      unit: productToAdd.unit,
      type: productToAdd.type,
      rent_per_unit: rentPerUnit,
      quantity: newProductData.quantity || 0,
      price: newProductData.price || 0,
      gst_percentage: newProductData.gst_percentage || 0,
      profit: newProductData.profit || 0,
      profit_type: newProductData.profit_type || DiscountType.PERCENT,
    };

    setNewPurchaseData((prev) => ({
      ...prev,
      products: [...(prev.products || []), purchaseProduct],
    }));

    // Reset product form
    setNewProductData({
      _id: '',
      name: '',
      product_code: '',
      category: { _id: '', name: '' },
      unit: { _id: '', name: '' },
      type: ProductType.RENTAL,
      quantity: 0,
      price: 0,
      gst_percentage: 0,
      profit: 0,
      profit_type: DiscountType.PERCENT,
      rent_per_unit: 0,
      available_stock: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    });
    setSelectedProduct(null);
    setIsNewProduct(false);
  };

  const removeProductFromPurchase = (index: number) => {
    setNewPurchaseData((prev) => ({
      ...prev,
      products: prev.products?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleEdit = (purchase: PurchaseOrderInfo) => {
    console.log('purchase: ', purchase);
    setNewPurchaseData({
      ...purchase,
      products: purchase.products || [],
    });
    setEditPurchaseOpen(true);
  };

  const editPurchase = async () => {
    if (!newPurchaseData.products || newPurchaseData.products.length === 0) {
      toast.error('Please add at least one product', { toastId: TOAST_IDS.ERROR_PURCHASE_UPDATE });
      return;
    }

    try {
      // Check if all products have IDs; if not, remove empty IDs from products that don't have them
      const allProductsHaveIds = newPurchaseData.products.every(
        (p) => p._id && p._id.trim() !== ''
      );
      const purchaseToUpdate = { ...newPurchaseData };
      if (!allProductsHaveIds) {
        purchaseToUpdate.products = newPurchaseData.products.map((p) =>
          !p._id || p._id.trim() === '' ? { ...p, _id: undefined } : p
        );
      }
      await updatePurchase(purchaseToUpdate as PurchaseOrderInfo).unwrap();
      setEditPurchaseOpen(false);
      resetForm();
      toast.success('Purchase updated successfully', {
        toastId: TOAST_IDS.SUCCESS_PURCHASE_UPDATE,
      });
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast.error('Error updating purchase', { toastId: TOAST_IDS.ERROR_PURCHASE_UPDATE });
    }
  };

  useEffect(() => {
    if (isProductCategoryQuerySuccess) {
      setProductCategories(transformIdNamePair(productCategoryData));
    }
  }, [isProductCategoryQuerySuccess, productCategoryData]);

  useEffect(() => {
    if (isUnitQuerySuccess) {
      setProductUnits(transformIdNamePair(unitData));
    }
  }, [isUnitQuerySuccess, unitData]);

  useEffect(() => {
    let filtered = rowData;
    if (selectedYear) {
      filtered = filtered.filter((r) => dayjs(r.purchase_date).year() === parseInt(selectedYear));
      if (selectedMonth) {
        filtered = filtered.filter(
          (r) => dayjs(r.purchase_date).month() + 1 === parseInt(selectedMonth)
        );
      }
    }
    setFilteredData(filtered);
    const total = filtered.reduce((sum, row) => sum + row.total_amount, 0);
    setTotalAmount(total);
  }, [rowData, selectedYear, selectedMonth]);

  useEffect(() => {
    if (isPurchaseCreated) {
      toast.success('Purchase Created Successfully', {
        toastId: TOAST_IDS.SUCCESS_PURCHASE_CREATE,
      });
    }
    if (isPurchaseCreateError) {
      toast.error('Error in Creating Purchase', {
        toastId: TOAST_IDS.ERROR_PURCHASE_CREATE,
      });
    }
  }, [isPurchaseCreateError, isPurchaseCreated]);

  return (
    <div className="h-fit">
      <div className="flex justify-between items-end mb-3">
        <CustomButton
          onClick={() => {
            const newId = getNewPurchaseId(purchaseData as PurchaseOrderInfo[] | undefined);
            setNewPurchaseData((prev) => ({ ...prev, order_id: newId }));
            setAddPurchaseOpen(true);
          }}
          label="New Purchase"
          icon={<LuPlus color="white" />}
        />
        <div className="flex gap-3 items-end">
          <CustomSelect
            label="Year"
            options={years.map((y) => ({ id: y.toString(), value: y.toString() }))}
            value={selectedYear}
            onChange={(value) => {
              setSelectedYear(value);
              setSelectedMonth(''); // Reset month when year changes
            }}
          />
          <CustomSelect
            label="Month"
            options={months.map((m) => ({ id: m.toString(), value: monthNames[m - 1] }))}
            value={selectedMonth}
            onChange={setSelectedMonth}
            disabled={!selectedYear}
          />
          <CustomButton
            onClick={() => {
              setSelectedYear('');
              setSelectedMonth('');
            }}
            label="Clear Filters"
            variant="outlined"
          />
        </div>
      </div>
      <div className="w-full h-fit overflow-y-auto">
        <CustomTable<PurchaseRow>
          rowData={filteredData}
          colDefs={colDefs}
          isLoading={isPurchasesLoading}
          onGridReady={handleGridReady}
          onFilterChanged={handleFilterChanged}
        />
      </div>
      <div className="mt-4 text-right">
        <p className="text-lg font-semibold">
          Total Purchases
          {selectedYear
            ? ` for ${
                selectedMonth ? `${monthNames[parseInt(selectedMonth) - 1]} ` : ''
              }${selectedYear}`
            : ''}
          : ₹{totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Add Purchase Modal */}
      <Modal
        open={addPurchaseOpen}
        onClose={() => setAddPurchaseOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-6xl h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full h-8">
            <p className="text-primary text-2xl font-semibold w-full text-start">New Purchase</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => setAddPurchaseOpen(false)}
            />
          </div>
          <div className="flex flex-col  items-center overflow-y-auto gap-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
              <CustomInput
                label="Order ID"
                value={newPurchaseData.order_id || ''}
                onChange={() => {}}
                disabled
                placeholder="Order ID (auto-generated)"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newPurchaseData.purchase_date || ''}
                onChange={(value) => handlePurchaseChange('purchase_date', value)}
                placeholder="Enter Purchase Date"
              />
              <CustomInput
                label="Invoice ID"
                value={newPurchaseData.invoice_id || ''}
                onChange={(value) => handlePurchaseChange('invoice_id', value)}
                placeholder="Enter Invoice ID"
              />
              <CustomFileInput
                label="Invoice PDF"
                accept=".pdf"
                onChange={(file) => handlePurchaseChange('invoice_pdf', file)}
                helperText="Upload invoice PDF (optional)"
                value={newPurchaseData.invoice_pdf}
                existingFilePath={newPurchaseData.invoice_pdf_path}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <CustomInput
                label="Supplier Name"
                value={newPurchaseData.supplier?.name || ''}
                onChange={(value) => handlePurchaseChange('supplier.name', value)}
                placeholder="Enter Supplier Name"
              />
              <CustomInput
                label="Supplier Number"
                value={newPurchaseData.supplier?.personal_number || ''}
                onChange={(value) => handlePurchaseChange('supplier.personal_number', value)}
                placeholder="Enter Supplier Number"
              />
              <CustomInput
                label="GST Number"
                value={newPurchaseData.supplier?.gstin || ''}
                onChange={(value) => handlePurchaseChange('supplier.gstin', value)}
                placeholder="Enter GST Number"
              />
            </div>

            <div className="w-full border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Add Products</h3>

              <div className="flex gap-4 mb-4">
                <CustomButton
                  onClick={() => {
                    setIsNewProduct(false);
                    setSelectedProduct(null);
                  }}
                  label="Select Existing Product"
                  variant={!isNewProduct ? 'contained' : 'outlined'}
                />
                <CustomButton
                  onClick={() => {
                    setIsNewProduct(true);
                    setSelectedProduct(null);
                  }}
                  label="Create New Product"
                  variant={isNewProduct ? 'contained' : 'outlined'}
                />
              </div>

              {!isNewProduct ? (
                <CustomAutoComplete
                  label="Select Product"
                  error={false}
                  placeholder="Select Product"
                  helperText="Choose an existing product"
                  value={selectedProduct?.name || ''}
                  options={productData?.map((p) => ({ id: p._id!, value: p.name })) || []}
                  onChange={(value) => {
                    const product = productData?.find((p) => p.name === value);
                    setSelectedProduct(product || null);
                    if (product) {
                      setNewProductData({
                        ...newProductData,
                        quantity: 1,
                        price: product.price,
                      });
                    }
                  }}
                  addNewValue={() => {}}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  <CustomInput
                    label="Product Name"
                    value={newProductData.name || ''}
                    onChange={(value) => handleProductChange('name', value)}
                    placeholder="Enter Product Name"
                  />
                  <CustomInput
                    label="HSN Code"
                    value={newProductData.product_code || ''}
                    onChange={(value) => handleProductChange('product_code', value)}
                    placeholder="Enter HSN Code"
                  />
                  <CustomAutoComplete
                    label="Category"
                    error={false}
                    placeholder="Select Category"
                    helperText="Please Select The Category"
                    value={newProductData.category?.name || ''}
                    options={productCategories}
                    addNewValue={() => {}}
                    onChange={(value) =>
                      handleProductChange(
                        'category',
                        transformIdValuePair(
                          productCategories.find((c) => c.value === value) || productCategories[0]
                        )
                      )
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                <CustomInput
                  label="Quantity"
                  type="number"
                  value={newProductData.quantity || 0}
                  onChange={(value) => handleProductChange('quantity', parseInt(value))}
                  placeholder="Enter Quantity"
                />
                <CustomInput
                  label="Price"
                  type="number"
                  value={newProductData.price || 0}
                  onChange={(value) => handleProductChange('price', parseInt(value))}
                  placeholder="Enter Price"
                />
                <CustomInput
                  label="GST Percentage"
                  type="number"
                  value={newProductData.gst_percentage || 0}
                  onChange={(value) => handleProductChange('gst_percentage', parseFloat(value))}
                  placeholder="Enter GST %"
                />
                <CustomInput
                  label="Actual Price"
                  type="number"
                  value={(
                    (newProductData.price || 0) *
                    (1 + (newProductData.gst_percentage || 0) / 100)
                  ).toFixed(2)}
                  onChange={() => {}}
                  disabled
                  placeholder="Calculated Price"
                />
              </div>

              {isNewProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                  <CustomAutoComplete
                    label="Unit"
                    error={false}
                    placeholder="Select Unit"
                    helperText="Please Select The Unit"
                    value={newProductData.unit?.name || ''}
                    options={productUnits}
                    addNewValue={() => {}}
                    onChange={(value) =>
                      handleProductChange(
                        'unit',
                        transformIdValuePair(
                          productUnits.find((u) => u.value === value) || productUnits[0]
                        )
                      )
                    }
                  />
                  <CustomSelect
                    label="Type"
                    options={productTypes}
                    value={
                      productTypes.find((t) => newProductData.type === t.id)?.id ||
                      productTypes[0].id
                    }
                    onChange={(value) => handleProductChange('type', value)}
                  />
                  <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                    <CustomInput
                      label="Profit"
                      type="number"
                      value={newProductData.profit || 0}
                      onChange={(value) => handleProductChange('profit', parseFloat(value))}
                      placeholder="Enter Profit"
                      disabled={newProductData.type === ProductType.RENTAL}
                    />
                    <CustomSelect
                      label=""
                      wrapperClass="mt-6"
                      options={discountTypeValues}
                      value={
                        discountTypeValues.find(
                          (discountType) => newProductData?.profit_type === discountType.id
                        )?.id ?? discountTypeValues[0].id
                      }
                      onChange={(value) => handleProductChange('profit_type', value)}
                    />
                  </div>
                  <CustomInput
                    label={
                      newProductData.type === ProductType.RENTAL ? 'Rental Price' : 'Sales Price'
                    }
                    type="number"
                    value={
                      newProductData.type === ProductType.RENTAL
                        ? newProductData.rent_per_unit || 0
                        : (() => {
                            const price = Number(newProductData.price || 0);
                            const gstPerc = Number(newProductData.gst_percentage || 0);
                            const profit = Number(newProductData.profit || 0);
                            const profitType = newProductData.profit_type || DiscountType.PERCENT;
                            const actualPrice = price * (1 + gstPerc / 100);
                            const profitAmt =
                              profitType === DiscountType.PERCENT
                                ? (actualPrice * profit) / 100
                                : profit;
                            return (actualPrice + profitAmt).toFixed(2);
                          })()
                    }
                    onChange={(value) =>
                      newProductData.type === ProductType.RENTAL
                        ? handleProductChange('rent_per_unit', parseFloat(value))
                        : () => {}
                    }
                    disabled={newProductData.type === ProductType.SALES}
                    placeholder={
                      newProductData.type === ProductType.RENTAL
                        ? 'Enter Rental Price'
                        : 'Calculated Sales Price'
                    }
                  />
                </div>
              )}

              <CustomButton
                onClick={addProductToPurchase}
                label="Add Product to Purchase"
                className="mt-4"
              />
            </div>

            {/* Products List */}
            <div className="w-full border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Products in Purchase</h3>
              {newPurchaseData.products?.map((p, index) => {
                const priceWithGst =
                  Number(p.price || 0) * (1 + Number(p.gst_percentage || 0) / 100);
                const totalAmount = p.quantity * priceWithGst;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center p-2 border-b gap-2"
                  >
                    <span className="wrap-break-word">{p.name}</span>
                    <span className="wrap-break-word">Qty: {p.quantity}</span>
                    <span className="wrap-break-word">Price: ₹{priceWithGst.toFixed(2)}</span>
                    <span className="wrap-break-word">Total: ₹{totalAmount.toFixed(2)}</span>
                    <MdDelete
                      size={20}
                      className={`${
                        editPurchaseOpen
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'cursor-pointer text-red-500 hover:text-red-700'
                      }`}
                      onClick={
                        editPurchaseOpen ? undefined : () => removeProductFromPurchase(index)
                      }
                    />
                  </div>
                );
              })}
              {newPurchaseData.products && newPurchaseData.products.length > 0 && (
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center p-2 border-t-2 border-b gap-2 font-semibold bg-gray-50">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span className="wrap-break-word">
                    Grand Total: ₹
                    {newPurchaseData.products
                      .reduce((sum, p) => {
                        const priceWithGst =
                          Number(p.price || 0) * (1 + Number(p.gst_percentage || 0) / 100);
                        const totalAmount = p.quantity * priceWithGst;
                        return sum + totalAmount;
                      }, 0)
                      .toFixed(2)}
                  </span>
                  <span></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full gap-3 justify-end h-10">
            <CustomButton
              onClick={() => {
                setAddPurchaseOpen(false);
                resetForm();
              }}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={addPurchase} label="Create Purchase" />
          </div>
        </div>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal
        open={editPurchaseOpen}
        onClose={() => setEditPurchaseOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-6xl h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full h-8">
            <p className="text-primary text-2xl font-semibold w-full text-start">Edit Purchase</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => setEditPurchaseOpen(false)}
            />
          </div>
          <div className="flex flex-col  items-center overflow-y-auto gap-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
              <CustomInput
                label="Order ID"
                value={newPurchaseData.order_id || ''}
                onChange={() => {}}
                disabled
                placeholder="Order ID (auto-generated)"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newPurchaseData.purchase_date || ''}
                onChange={(value) => handlePurchaseChange('purchase_date', value)}
                placeholder="Enter Purchase Date"
              />
              <CustomInput
                label="Invoice ID"
                value={newPurchaseData.invoice_id || ''}
                onChange={(value) => handlePurchaseChange('invoice_id', value)}
                placeholder="Enter Invoice ID"
              />
              <CustomFileInput
                label="Invoice PDF"
                accept=".pdf"
                onChange={(file) => handlePurchaseChange('invoice_pdf', file)}
                helperText="Upload invoice PDF (optional)"
                value={newPurchaseData.invoice_pdf}
                existingFilePath={newPurchaseData.invoice_pdf_path}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <CustomInput
                label="Supplier Name"
                value={newPurchaseData.supplier?.name || ''}
                onChange={(value) => handlePurchaseChange('supplier.name', value)}
                placeholder="Enter Supplier Name"
              />
              <CustomInput
                label="Supplier Number"
                value={newPurchaseData.supplier?.personal_number || ''}
                onChange={(value) => handlePurchaseChange('supplier.personal_number', value)}
                placeholder="Enter Supplier Number"
              />
              <CustomInput
                label="GST Number"
                value={newPurchaseData.supplier?.gstin || ''}
                onChange={(value) => handlePurchaseChange('supplier.gstin', value)}
                placeholder="Enter GST Number"
              />
            </div>

            <div className="w-full border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Edit Products</h3>

              <div className="flex gap-4 mb-4">
                <CustomButton
                  onClick={() => {
                    setIsNewProduct(false);
                    setSelectedProduct(null);
                  }}
                  label="Select Existing Product"
                  variant={!isNewProduct ? 'contained' : 'outlined'}
                />
                <CustomButton
                  onClick={() => {
                    setIsNewProduct(true);
                    setSelectedProduct(null);
                  }}
                  label="Create New Product"
                  variant={isNewProduct ? 'contained' : 'outlined'}
                />
              </div>

              {!isNewProduct ? (
                <CustomAutoComplete
                  label="Select Product"
                  error={false}
                  placeholder="Select Product"
                  helperText="Choose an existing product"
                  value={selectedProduct?.name || ''}
                  options={productData?.map((p) => ({ id: p._id!, value: p.name })) || []}
                  addNewValue={() => {}}
                  onChange={(value) => {
                    const product = productData?.find((p) => p.name === value);
                    setSelectedProduct(product || null);
                    if (product) {
                      setNewProductData({
                        ...newProductData,
                        _id: product._id,
                        quantity: 1,
                        price: product.price,
                      });
                    }
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  <CustomInput
                    label="Product Name"
                    value={newProductData.name || ''}
                    onChange={(value) => handleProductChange('name', value)}
                    placeholder="Enter Product Name"
                  />
                  <CustomInput
                    label="HSN Code"
                    value={newProductData.product_code || ''}
                    onChange={(value) => handleProductChange('product_code', value)}
                    placeholder="Enter HSN Code"
                  />
                  <CustomAutoComplete
                    label="Category"
                    error={false}
                    placeholder="Select Category"
                    helperText="Please Select The Category"
                    value={newProductData.category?.name || ''}
                    options={productCategories}
                    addNewValue={() => {}}
                    onChange={(value) =>
                      handleProductChange(
                        'category',
                        transformIdValuePair(
                          productCategories.find((c) => c.value === value) || productCategories[0]
                        )
                      )
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                <CustomInput
                  label="Quantity"
                  type="number"
                  value={newProductData.quantity || 0}
                  onChange={(value) => handleProductChange('quantity', parseInt(value))}
                  placeholder="Enter Quantity"
                />
                <CustomInput
                  label="Price"
                  type="number"
                  value={newProductData.price || 0}
                  onChange={(value) => handleProductChange('price', parseInt(value))}
                  placeholder="Enter Price"
                />
                <CustomInput
                  label="GST Percentage"
                  type="number"
                  value={newProductData.gst_percentage || 0}
                  onChange={(value) => handleProductChange('gst_percentage', parseFloat(value))}
                  placeholder="Enter GST %"
                />
                <CustomInput
                  label="Actual Price"
                  type="number"
                  value={(
                    (newProductData.price || 0) *
                    (1 + (newProductData.gst_percentage || 0) / 100)
                  ).toFixed(2)}
                  onChange={() => {}}
                  disabled
                  placeholder="Calculated Price"
                />
              </div>

              {isNewProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                  <CustomAutoComplete
                    label="Unit"
                    error={false}
                    placeholder="Select Unit"
                    helperText="Please Select The Unit"
                    value={newProductData.unit?.name || ''}
                    options={productUnits}
                    addNewValue={() => {}}
                    onChange={(value) =>
                      handleProductChange(
                        'unit',
                        transformIdValuePair(
                          productUnits.find((u) => u.value === value) || productUnits[0]
                        )
                      )
                    }
                  />
                  <CustomSelect
                    label="Type"
                    options={productTypes}
                    value={
                      productTypes.find((t) => newProductData.type === t.id)?.id ||
                      productTypes[0].id
                    }
                    onChange={(value) => handleProductChange('type', value)}
                  />
                  <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                    <CustomInput
                      label="Profit"
                      type="number"
                      value={newProductData.profit || 0}
                      onChange={(value) => handleProductChange('profit', parseFloat(value))}
                      placeholder="Enter Profit"
                      disabled={newProductData.type === ProductType.RENTAL}
                    />
                    <CustomSelect
                      label=""
                      wrapperClass="mt-6"
                      options={discountTypeValues}
                      value={
                        discountTypeValues.find(
                          (discountType) => newProductData?.profit_type === discountType.id
                        )?.id ?? discountTypeValues[0].id
                      }
                      onChange={(value) => handleProductChange('profit_type', value)}
                    />
                  </div>
                  <CustomInput
                    label={
                      newProductData.type === ProductType.RENTAL ? 'Rental Price' : 'Sales Price'
                    }
                    type="number"
                    value={
                      newProductData.type === ProductType.RENTAL
                        ? newProductData.rent_per_unit || 0
                        : (() => {
                            const price = Number(newProductData.price || 0);
                            const gstPerc = Number(newProductData.gst_percentage || 0);
                            const profit = Number(newProductData.profit || 0);
                            const profitType = newProductData.profit_type || DiscountType.PERCENT;
                            const actualPrice = price * (1 + gstPerc / 100);
                            const profitAmt =
                              profitType === DiscountType.PERCENT
                                ? (actualPrice * profit) / 100
                                : profit;
                            return (actualPrice + profitAmt).toFixed(2);
                          })()
                    }
                    onChange={(value) =>
                      newProductData.type === ProductType.RENTAL
                        ? handleProductChange('rent_per_unit', parseFloat(value))
                        : () => {}
                    }
                    disabled={newProductData.type === ProductType.SALES}
                    placeholder={
                      newProductData.type === ProductType.RENTAL
                        ? 'Enter Rental Price'
                        : 'Calculated Sales Price'
                    }
                  />
                </div>
              )}

              <CustomButton
                onClick={addProductToPurchase}
                label="Add Product to Purchase"
                className="mt-4"
              />
            </div>

            {/* Products List */}
            <div className="w-full border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Products in Purchase</h3>
              {newPurchaseData.products?.map((p, index) => {
                const priceWithGst =
                  Number(p.price || 0) * (1 + Number(p.gst_percentage || 0) / 100);
                const totalAmount = p.quantity * priceWithGst;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center p-2 border-b gap-2"
                  >
                    <span className="wrap-break-word">{p.name}</span>
                    <span className="wrap-break-word">Qty: {p.quantity}</span>
                    <span className="wrap-break-word">Price: ₹{priceWithGst.toFixed(2)}</span>
                    <span className="wrap-break-word">Total: ₹{totalAmount.toFixed(2)}</span>
                    <MdDelete
                      size={20}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                      onClick={() => removeProductFromPurchase(index)}
                    />
                  </div>
                );
              })}
              {newPurchaseData.products && newPurchaseData.products.length > 0 && (
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center p-2 border-t-2 border-b gap-2 font-semibold bg-gray-50">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span className="wrap-break-word">
                    Grand Total: ₹
                    {newPurchaseData.products
                      .reduce((sum, p) => {
                        const priceWithGst =
                          Number(p.price || 0) * (1 + Number(p.gst_percentage || 0) / 100);
                        const totalAmount = p.quantity * priceWithGst;
                        return sum + totalAmount;
                      }, 0)
                      .toFixed(2)}
                  </span>
                  <span></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full gap-3 justify-end h-10">
            <CustomButton
              onClick={() => {
                setEditPurchaseOpen(false);
                resetForm();
              }}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={editPurchase} label="Update Purchase" />
          </div>
        </div>
      </Modal>

      {/* PDF Viewer Modal */}
      <ViewPdfModal
        open={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        selectedPdf={selectedPdf}
      />
    </div>
  );
};

export default Purchases;
