import { Modal } from '@mui/material';
import { useMemo, useState } from 'react';
import { MdClose } from 'react-icons/md';
import CustomInput from '../styled/CustomInput';
import CustomAutoComplete, { CustomOptionProps } from '../styled/CustomAutoComplete';
import { IdNamePair } from '../pages/private/Stocks';
import CustomSelect from '../styled/CustomSelect';
import CustomDatePicker from '../styled/CustomDatePicker';
import { DiscountType, discountTypeValues, Product } from '../types/common';
import {
  useCreateProductCategoryMutation,
  useCreateProductMutation,
  useCreateUnitMutation,
} from '../services/ApiService';
import CustomButton from '../styled/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { initialProductData, transformIdValuePair } from '../pages/private/utils';

const productTypes = [
  { id: 'rental', value: 'RENTAL' },
  { id: 'sales', value: 'SALES' },
  { id: 'service', value: 'SERVICE' },
];

type NewProductType = {
  addProductOpen: boolean;
  setAddProductOpen: (val: boolean) => void;
  productCategories: CustomOptionProps[];
  productUnits: CustomOptionProps[];
};

const NewProductModal = ({
  addProductOpen,
  setAddProductOpen,
  productCategories,
  productUnits,
}: NewProductType) => {
  const [newProductData, setNewProductData] = useState<Product>(initialProductData);
  const [createUnit] = useCreateUnitMutation();
  const [createProductCategory] = useCreateProductCategoryMutation();
  const [createProduct] = useCreateProductMutation();
  const userEmail = useSelector((state: RootState) => state.user.email);
  const calculateTotal = useMemo(() => {
    if (addProductOpen) {
      if (
        newProductData?.discount_type === DiscountType.PERCENT &&
        newProductData.price &&
        newProductData.quantity
      ) {
        const totalPrice = newProductData.price * newProductData.quantity;
        if (newProductData.discount === 0 || isNaN(newProductData.discount))
          return `₹${totalPrice}`;
        const value = totalPrice - +((newProductData.discount / 100) * totalPrice).toFixed(2);
        return `₹${value}`;
      }
      if (
        newProductData?.discount_type === DiscountType.RUPEES &&
        newProductData.price &&
        newProductData.quantity
      ) {
        const value = newProductData.price * newProductData.quantity - newProductData.discount;
        return `₹${value}`;
      }
    }
    return '₹0';
  }, [
    addProductOpen,
    newProductData.discount,
    newProductData?.discount_type,
    newProductData.price,
    newProductData.quantity,
  ]);

  const handleProductChange = (key: string, value: string | number | IdNamePair | undefined) => {
    setNewProductData((prev) => ({ ...prev, [key]: value }));
  };

  const addProduct = () => {
    createProduct({
      ...newProductData,
      created_by: userEmail,
      created_at: new Date().toISOString(),
    });
    setAddProductOpen(false);
  };

  return (
    <Modal
      open={addProductOpen}
      onClose={() => setAddProductOpen(false)}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full pb-4">
          <p className="text-primary text-2xl font-semibold w-full text-start">New Product</p>
          <MdClose size={25} className="cursor-pointer" onClick={() => setAddProductOpen(false)} />
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
              label="Rental Price"
              value={newProductData.rent_per_unit}
              onChange={(value) => handleProductChange('rent_per_unit', value)}
              placeholder="Enter Rental Price"
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

            <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
              <CustomInput
                label="Discount"
                placeholder=""
                value={newProductData.discount}
                type="number"
                onChange={(value) => handleProductChange('discount', value ? parseInt(value) : '')}
              />
              <CustomSelect
                label=""
                wrapperClass="mt-6"
                options={discountTypeValues}
                value={
                  discountTypeValues.find(
                    (discountType) => newProductData.discount_type === discountType.id
                  )?.id ?? discountTypeValues[0].id
                }
                onChange={(value) => handleProductChange('discount_type', value)}
              />
            </div>

            <CustomInput
              label="Total"
              value={calculateTotal}
              onChange={() => {}}
              placeholder="Rs. 0.0"
              disabled
            />
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
  );
};

export default NewProductModal;
