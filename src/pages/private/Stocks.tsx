import { Modal } from '@mui/material';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useEffect, useMemo, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BsSearch } from 'react-icons/bs';
import { FiEdit } from 'react-icons/fi';
import { LuPlus } from 'react-icons/lu';
import { MdClose } from 'react-icons/md';
import { PiWarningFill } from 'react-icons/pi';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../constants/constants';
import {
  useCreateProductCategoryMutation,
  useCreateProductMutation,
  useCreateUnitMutation,
  useDeleteProductMutation,
  useGetProductCategoriesQuery,
  useGetProductsQuery,
  useGetUnitsQuery,
  useUpdateProductMutation,
} from '../../services/ApiService';
import { RootState } from '../../store/store';
import CustomAutoComplete, { CustomOptionProps } from '../../styled/CustomAutoComplete';
import CustomButton from '../../styled/CustomButton';
import CustomDatePicker from '../../styled/CustomDatePicker';
import CustomInput from '../../styled/CustomInput';
import CustomSelect from '../../styled/CustomSelect';
import CustomTable from '../../styled/CustomTable';
import { discountTypeValues, Product } from '../../types/common';
import { initialProductData, transformIdNamePair, transformIdValuePair } from './utils';

interface OneProduct {
  _id: string;
  name: string;
  product_code: string;
  category: string;
  available_stock: number;
  type: string;
  rent_per_unit: number;
  quantity: number;
  price: number;
  actions?: string;
}

export interface IdNamePair {
  _id?: string;
  name: string;
}

const Inventory = () => {
  const userEmail = useSelector((state: RootState) => state.user.email);
  const { data: productData, isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: productCategoryData, isSuccess: isProductCategoryQuerySuccess } =
    useGetProductCategoriesQuery();
  const [createProductCategory, { isSuccess: isProductCategoryCreateSuccess }] =
    useCreateProductCategoryMutation();
  const { data: unitData, isSuccess: isUnitQuerySuccess } = useGetUnitsQuery();
  const [createUnit, { isSuccess: isUnitCreateSuccess }] = useCreateUnitMutation();
  const [createProduct, { isSuccess: isProductCreated, isError: isProductCreateError }] =
    useCreateProductMutation();
  const [updateProduct, { isSuccess: isProductUpdated, isError: isProductUpdateError }] =
    useUpdateProductMutation();
  const [deleteProduct, { isSuccess: isProductDeleted, isError: isProductDeleteError }] =
    useDeleteProductMutation();

  const [search, setSearch] = useState<string>('');
  const [newProductData, setNewProductData] = useState<Product>(initialProductData);
  const [deleteData, setDeleteData] = useState<OneProduct | null>(null);
  const [updateData, setUpdateData] = useState<Product | null>(null);

  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);

  const [productCategories, setProductCategories] = useState<CustomOptionProps[]>([]);

  const [productUnits, setProductUnits] = useState<CustomOptionProps[]>([]);

  const productTypes = [
    { id: 'rental', value: 'RENTAL' },
    { id: 'sales', value: 'SALES' },
  ];

  const rowData = useMemo<OneProduct[]>(() => {
    return productData
      ? productData.map((product) => ({
          _id: product._id!,
          name: product.name,
          product_code: product.product_code,
          category: product.category.name,
          available_stock: product.available_stock,
          type: product.type,
          rent_per_unit: product.rent_per_unit,
          quantity: product.quantity,
          price: product.price,
        }))
      : [];
  }, [productData]);

  const [filteredData, setFilteredData] = useState<OneProduct[]>([]);

  const colDefs = useMemo<ColDef<OneProduct>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Product Name',
        flex: 1,
        headerClass: 'ag-header-wrap',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'product_code',
        headerName: 'HSN Code',
        flex: 1,
        headerClass: 'ag-header-wrap',
        minWidth: 100,
        filter: 'agTextColumnFilter',
      },
      { field: 'category', headerName: 'Category', flex: 1, minWidth: 300 },
      {
        field: 'quantity',
        headerName: 'Purchased Quantity',
        flex: 1,
        minWidth: 100,
        headerClass: 'ag-header-wrap',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'available_stock',
        headerName: 'Available Stock',
        flex: 1,
        minWidth: 100,
        headerClass: 'ag-header-wrap',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'rent_per_unit',
        headerName: 'Price (per unit)',
        flex: 1,
        minWidth: 100,
        headerClass: 'ag-header-wrap',
        filter: 'agNumberColumnFilter',
        cellRenderer: (params: ICellRendererParams<OneProduct>) => {
          const rowData = params.data!;
          if (rowData.type === 'sales') {
            return `₹${rowData.price}.00`;
          }
          return `₹${rowData.rent_per_unit}.00`;
        },
      },
      { field: 'type', headerName: 'Type', flex: 1, minWidth: 100 },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        minWidth: 100,
        maxWidth: 120,
        pinned: 'right',
        cellRenderer: (params: ICellRendererParams<OneProduct>) => {
          const rowData = params.data!;

          return (
            <div className="flex gap-2 h-8 items-center">
              <FiEdit
                size={19}
                className="cursor-pointer"
                onClick={() => {
                  const currentRowData =
                    productData?.find((product) => product._id === rowData._id) ?? productData![0];
                  setUpdateData({
                    ...currentRowData,
                    purchase_date: new Date(currentRowData.purchase_date)
                      .toISOString()
                      .slice(0, 16),
                  });
                  setUpdateModalOpen(true);
                }}
              />
              <AiOutlineDelete
                size={20}
                className="cursor-pointer"
                onClick={() => {
                  setDeleteProductOpen(true);
                  setDeleteData(rowData);
                }}
              />
            </div>
          );
        },
      },
    ],
    [productData]
  );

  const addProduct = () => {
    const productDataToCreate = { ...newProductData };

    // Calculate rent_per_unit for sales type products
    if (newProductData.type === 'sales') {
      const price = Number(newProductData.price || 0);
      const gstPerc = Number(newProductData.gst_percentage || 0);
      const profit = Number(newProductData.profit || 0);
      const profitType = newProductData.profit_type || 'percent';
      const actualPrice = price * (1 + gstPerc / 100);
      const profitAmt = profitType === 'percent' ? (actualPrice * profit) / 100 : profit;
      productDataToCreate.rent_per_unit = actualPrice + profitAmt;
    }

    createProduct({
      ...productDataToCreate,
      created_by: userEmail,
      created_at: new Date().toISOString(),
    });
    setAddProductOpen(false);
  };

  const updateProductData = () => {
    if (!updateData || !updateData.name) {
      toast.error('Product name is required', {
        toastId: TOAST_IDS.ERROR_PRODUCT_UPDATE,
      });
      return;
    }

    const productDataToUpdate = {
      ...updateData,
      name: updateData.name,
    };

    // Calculate rent_per_unit for sales type products
    if (updateData.type === 'sales') {
      const price = Number(updateData.price || 0);
      const gstPerc = Number(updateData.gst_percentage || 0);
      const profit = Number(updateData.profit || 0);
      const profitType = updateData.profit_type || 'percent';
      const actualPrice = price * (1 + gstPerc / 100);
      const profitAmt = profitType === 'percent' ? (actualPrice * profit) / 100 : profit;
      productDataToUpdate.rent_per_unit = actualPrice + profitAmt;
    }

    updateProduct(productDataToUpdate as Product);
    setUpdateModalOpen(false);
  };

  const deleteProductData = () => {
    deleteProduct(deleteData!._id);
    setDeleteProductOpen(false);
  };

  const handleProductChange = (key: string, value: string | number | IdNamePair | undefined) => {
    setNewProductData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateProduct = (key: string, value: string | number | IdNamePair | undefined) => {
    setUpdateData((prev) => ({ ...prev!, [key]: value }));
  };

  useEffect(() => {
    if (isProductCategoryQuerySuccess) {
      setProductCategories(() => {
        return transformIdNamePair(productCategoryData);
      });
    }
    if (isProductCategoryCreateSuccess)
      toast.success('Product Category created successfully', {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_CATEGORY_CREATE,
      });
  }, [isProductCategoryCreateSuccess, isProductCategoryQuerySuccess, productCategoryData]);

  useEffect(() => {
    if (isUnitQuerySuccess)
      setProductUnits(() => {
        return transformIdNamePair(unitData);
      });
    if (isUnitCreateSuccess)
      toast.success('Product Unit created successfully', {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_UNIT_CREATE,
      });
  }, [isUnitCreateSuccess, isUnitQuerySuccess, unitData]);

  useEffect(() => {
    setFilteredData(rowData);
  }, [rowData]);

  useEffect(() => {
    if (search.trim()) {
      setFilteredData(
        rowData.filter(
          (data) =>
            data.name.toLowerCase().includes(search.toLowerCase()) ||
            data.product_code.toLowerCase().includes(search.toLowerCase()) ||
            data.type.toLowerCase().includes(search.toLowerCase()) ||
            data.category.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(rowData);
    }
  }, [rowData, search]);

  useEffect(() => {
    if (isProductCreated) {
      toast.success('Product Created Successfully', {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_CREATE,
      });
    }
    if (isProductUpdated) {
      toast.success('Product Updated Successfully', {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_UPDATE,
      });
    }
    if (isProductDeleted) {
      toast.success('Product Deleted Successfully', {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_DELETE,
      });
    }
    if (isProductCreateError) {
      toast.error('Error in Creating Product', {
        toastId: TOAST_IDS.ERROR_PRODUCT_CREATE,
      });
    }
    if (isProductUpdateError) {
      toast.error('Error in Updating Product', {
        toastId: TOAST_IDS.ERROR_PRODUCT_UPDATE,
      });
    }
    if (isProductDeleteError) {
      toast.error('Error in Deleting Product', {
        toastId: TOAST_IDS.ERROR_PRODUCT_DELETE,
      });
    }
  }, [
    isProductCreateError,
    isProductCreated,
    isProductDeleteError,
    isProductDeleted,
    isProductUpdateError,
    isProductUpdated,
  ]);

  return (
    <div className="h-fit">
      <div className="flex justify-between mb-3">
        <CustomButton
          onClick={() => setAddProductOpen(true)}
          label="Add Product"
          icon={<LuPlus color="white" />}
        />
        <div className="w-[20rem]">
          <CustomInput
            label=""
            value={search}
            onChange={(value) => setSearch(value)}
            startIcon={<BsSearch />}
            placeholder="Search Product"
          />
        </div>
      </div>
      <div className="w-full h-fit overflow-y-auto">
        <CustomTable<OneProduct>
          rowData={filteredData}
          colDefs={colDefs}
          isLoading={isProductsLoading}
        />
      </div>

      {/* Add Product */}
      <Modal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full pb-4">
            <p className="text-primary text-2xl font-semibold w-full text-start">New Product</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => setAddProductOpen(false)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 h-4/5 px-3 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Name"
                value={newProductData.name}
                onChange={(value) => handleProductChange('name', value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={newProductData.unit?.name ?? ''}
                options={productUnits}
                className=""
                addNewValue={(value) => {
                  const exists =
                    productUnits.filter(
                      (option) => option.value.toLocaleLowerCase() === value.toLocaleLowerCase()
                    ).length > 0;
                  if (!exists && value.length > 0) {
                    createUnit({
                      name: value,
                    });
                    handleProductChange(
                      'unit',
                      transformIdValuePair(
                        value
                          ? productUnits.find((productUnit) => productUnit.value === value) ??
                              productUnits[0]
                          : productUnits[0]
                      )
                    );
                  }
                }}
                onChange={(value) =>
                  handleProductChange(
                    'unit',
                    transformIdValuePair(
                      value
                        ? productUnits.find((productUnit) => productUnit.value === value) ??
                            productUnits[0]
                        : productUnits[0]
                    )
                  )
                }
              />
              <CustomSelect
                label="Type"
                options={productTypes}
                value={
                  productTypes.find((productType) => newProductData.type === productType.id)?.id ??
                  productTypes[0].id
                }
                onChange={(value) => handleProductChange('type', value)}
              />
              <CustomInput
                label="Available Stock"
                value={newProductData.available_stock}
                onChange={() => {}}
                disabled
                placeholder="Enter Available Stock"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="HSN Code"
                value={newProductData.product_code}
                onChange={(value) => handleProductChange('product_code', value)}
                placeholder="Enter HSN Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newProductData.purchase_date}
                onChange={(value) => handleProductChange('purchase_date', value)}
                placeholder="Enter Purchase Date"
              />
              <CustomAutoComplete
                label="Category"
                error={false}
                placeholder="Select Category"
                helperText="Please Select The Category"
                value={newProductData.category?.name ?? ''}
                options={productCategories}
                className=""
                addNewValue={(value) => {
                  const exists =
                    productCategories.filter(
                      (option) => option.value.toLocaleLowerCase() === value.toLocaleLowerCase()
                    ).length > 0;
                  if (!exists && value.length > 0) {
                    createProductCategory({
                      name: value,
                    });
                    handleProductChange('category', value);
                  }
                }}
                onChange={(value) =>
                  handleProductChange(
                    'category',
                    transformIdValuePair(
                      value
                        ? productCategories.find(
                            (productCategory) => productCategory.value === value
                          ) ?? productCategories[0]
                        : productCategories[0]
                    )
                  )
                }
              />
              <CustomInput
                label={newProductData.type === 'sales' ? 'Sales Price' : 'Rental Price'}
                type="number"
                value={
                  newProductData.type === 'sales'
                    ? (() => {
                        const price = Number(newProductData.price || 0);
                        const gstPerc = Number(newProductData.gst_percentage || 0);
                        const profit = Number(newProductData.profit || 0);
                        const profitType = newProductData.profit_type || 'percent';
                        const actualPrice = price * (1 + gstPerc / 100);
                        const profitAmt =
                          profitType === 'percent' ? (actualPrice * profit) / 100 : profit;
                        return (actualPrice + profitAmt).toFixed(2);
                      })()
                    : newProductData.rent_per_unit || 0
                }
                onChange={(value) =>
                  newProductData.type === 'sales'
                    ? () => {}
                    : handleProductChange('rent_per_unit', value)
                }
                disabled={newProductData.type === 'sales'}
                placeholder={
                  newProductData.type === 'sales' ? 'Calculated Sales Price' : 'Enter Rental Price'
                }
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                type="number"
                value={newProductData.quantity}
                onChange={(value) => {
                  handleProductChange('quantity', value ? parseInt(value) : '');
                  handleProductChange('available_stock', value ? parseInt(value) : '');
                }}
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                value={newProductData.price}
                type="number"
                onChange={(value) => handleProductChange('price', value ? parseInt(value) : '')}
                placeholder="Enter Product Price"
              />

              <CustomInput
                label="GST %"
                value={newProductData.gst_percentage}
                type="number"
                onChange={(value) =>
                  handleProductChange('gst_percentage', value ? parseFloat(value) : '')
                }
                placeholder="Enter GST Percentage"
              />

              <CustomInput
                label="Price with GST"
                value={
                  newProductData.price && newProductData.gst_percentage
                    ? (
                        Number(newProductData.price) *
                        (1 + Number(newProductData.gst_percentage) / 100)
                      ).toFixed(2)
                    : newProductData.price || ''
                }
                onChange={() => {}}
                disabled
                placeholder="Calculated Price with GST"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Profit"
                  placeholder=""
                  value={newProductData.profit}
                  type="number"
                  onChange={(value) => handleProductChange('profit', value ? parseInt(value) : '')}
                />
                <CustomSelect
                  label=""
                  wrapperClass="mt-6"
                  options={discountTypeValues}
                  value={
                    discountTypeValues.find(
                      (discountType) => newProductData.profit_type === discountType.id
                    )?.id ?? discountTypeValues[0].id
                  }
                  onChange={(value) => handleProductChange('profit_type', value)}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => {
                setAddProductOpen(false);
                setNewProductData(initialProductData);
              }}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={addProduct} label="Add Product" />
          </div>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal
        open={updateModalOpen}
        onClose={() => {
          setUpdateData(null);
          setUpdateModalOpen(false);
        }}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">Update Product</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setUpdateData(null);
                setUpdateModalOpen(false);
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 h-4/5 px-3 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Name"
                value={updateData?.name ?? ''}
                onChange={(value) => handleUpdateProduct('product_name', value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={updateData?.unit?.name ?? ''}
                options={productUnits}
                className=""
                addNewValue={(value) => {
                  const exists =
                    productUnits.filter(
                      (option) => option.value.toLocaleLowerCase() === value.toLocaleLowerCase()
                    ).length > 0;
                  if (!exists && value.length > 0) {
                    createUnit({
                      name: value,
                    });
                    handleUpdateProduct('unit', value);
                  }
                }}
                onChange={(value) =>
                  handleUpdateProduct(
                    'unit',
                    transformIdValuePair(
                      value
                        ? productUnits.find((productUnit) => productUnit.value === value) ??
                            productUnits[0]
                        : productUnits[0]
                    )
                  )
                }
              />
              <CustomSelect
                label="Type"
                options={productTypes}
                value={
                  productTypes.find((productType) => updateData?.type === productType.id)?.id ??
                  productTypes[0].id
                }
                onChange={(value) => {
                  handleUpdateProduct('type', value);
                }}
              />
              <CustomInput
                label="Available Stock"
                value={updateData?.available_stock || 0}
                onChange={() => {}}
                disabled
                placeholder="Enter Available Stock"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="HSN Code"
                value={updateData?.product_code ?? ''}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        product_code: value,
                      };
                    return prev;
                  })
                }
                placeholder="Enter HSN Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={updateData?.purchase_date ?? ''}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        purchase_date: value,
                      };
                    return prev;
                  })
                }
                placeholder="Enter Purchase Date"
              />
              <CustomAutoComplete
                label="Category"
                error={false}
                placeholder="Select Category"
                helperText="Please Select The Category"
                value={updateData?.category.name ?? ''}
                options={productCategories}
                className=""
                addNewValue={(value) => {
                  const exists =
                    productCategories.filter(
                      (option) => option.value.toLocaleLowerCase() === value.toLocaleLowerCase()
                    ).length > 0;
                  if (!exists && value.length > 0) {
                    createProductCategory({
                      name: value,
                    });
                    handleUpdateProduct('category', value);
                  }
                }}
                onChange={(value) =>
                  handleUpdateProduct(
                    'category',
                    transformIdValuePair(
                      value
                        ? productCategories.find(
                            (productCategory) => productCategory.value === value
                          ) ?? productCategories[0]
                        : productCategories[0]
                    )
                  )
                }
              />
              <CustomInput
                label={updateData?.type === 'sales' ? 'Sales Price' : 'Rental Price'}
                type="number"
                value={
                  updateData?.type === 'sales'
                    ? (() => {
                        const price = Number(updateData?.price || 0);
                        const gstPerc = Number(updateData?.gst_percentage || 0);
                        const profit = Number(updateData?.profit || 0);
                        const profitType = updateData?.profit_type || 'percent';
                        const actualPrice = price * (1 + gstPerc / 100);
                        const profitAmt =
                          profitType === 'percent' ? (actualPrice * profit) / 100 : profit;
                        return (actualPrice + profitAmt).toFixed(2);
                      })()
                    : updateData?.rent_per_unit ?? 0
                }
                onChange={(value) =>
                  updateData?.type === 'sales'
                    ? () => {}
                    : setUpdateData((prev) => {
                        if (prev)
                          return {
                            ...prev,
                            rent_per_unit: parseInt(value),
                          };
                        return prev;
                      })
                }
                disabled={updateData?.type === 'sales'}
                placeholder={
                  updateData?.type === 'sales' ? 'Calculated Sales Price' : 'Enter Rental Price'
                }
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                type="number"
                value={updateData?.quantity ?? 0}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev) {
                      const quantityDelta =
                        (productData?.find((product) => product._id === updateData?._id)
                          ?.quantity || 0) - parseInt(value);
                      return {
                        ...prev,
                        quantity: parseInt(value),
                        available_stock:
                          (productData?.find((product) => product._id === updateData?._id)
                            ?.available_stock || 0) - quantityDelta,
                      };
                    }
                    return prev;
                  })
                }
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                value={
                  updateData?.price && updateData?.gst_percentage
                    ? (
                        Number(updateData.price) *
                        (1 + Number(updateData.gst_percentage) / 100)
                      ).toFixed(2)
                    : updateData?.price || ''
                }
                onChange={() => {}}
                disabled
                placeholder="Calculated Price with GST"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Profit"
                  placeholder=""
                  value={updateData?.profit ?? 0}
                  type="number"
                  onChange={(value) =>
                    setUpdateData((prev) => {
                      if (prev)
                        return {
                          ...prev,
                          profit: parseInt(value),
                        };
                      return prev;
                    })
                  }
                />
                <CustomSelect
                  label=""
                  wrapperClass="mt-6"
                  options={discountTypeValues}
                  value={
                    discountTypeValues.find(
                      (discountType) => updateData?.profit_type === discountType.id
                    )?.id ?? discountTypeValues[0].id
                  }
                  onChange={(value) => handleUpdateProduct('profit_type', value)}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => {
                setUpdateModalOpen(false);
              }}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={updateProductData} label="Save Product" />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteProductOpen}
        onClose={() => setDeleteProductOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-2/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">Delete Product</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setDeleteProductOpen(false);
                setDeleteData(null);
              }}
            />
          </div>

          <div className="bg-yellow flex flex-col gap-2 p-2 rounded-sm">
            <div className="flex gap-2 items-center">
              <PiWarningFill size={25} />
              <span className="text-xl">Warning!</span>
            </div>
            <p>
              Deleting this product will make this stock quantity to zero and can negatively impact
              in the balance sheet
            </p>
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => {
                setDeleteProductOpen(false);
                setDeleteData(null);
              }}
              label="Cancel"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={() => deleteProductData()} label="Delete" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
