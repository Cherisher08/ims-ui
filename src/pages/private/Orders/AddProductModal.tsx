import { Modal } from "@mui/material";
import { BillingUnit, ProductDetails } from "../../../types/order";
import { MdClose } from "react-icons/md";
import CustomButton from "../../../styled/CustomButton";
import { useEffect, useState } from "react";
import { Product, Unit } from "../../../types/common";
import CustomSelect from "../../../styled/CustomSelect";
import dayjs from "dayjs";
import CustomInput from "../../../styled/CustomInput";

type AddProductModalOpen = {
  addProductOpen: boolean;
  products: Product[];
  units: Unit[];
  setAddProductOpen: (value: boolean) => void;
  addProductToOrder: (product: ProductDetails) => void;
};

const billingUnitOptions = Object.entries(BillingUnit).map(([key, value]) => ({
  id: key,
  value,
}));

const initialProductState: ProductDetails = {
  _id: "",
  name: "",
  category: "",
  billing_unit: BillingUnit.DAYS,
  product_unit: {
    _id: "",
    name: "",
  },
  inDate: dayjs().format("YYY-MM-DDTHH:mm"),
  order_quantity: 0,
  order_repair_count: 0,
  outDate: dayjs().format("YYY-MM-DDTHH:mm"),
  rent_per_unit: 0,
};

const formatProducts = (products: Product[]) => {
  return products.map((product) => ({
    id: product._id || "",
    value: product.name,
  }));
};

const formatUnits = (units: Unit[]) => {
  return units.map((unit) => ({
    id: unit._id || "",
    value: unit.name,
  }));
};

const AddProductModal = ({
  addProductOpen,
  products,
  units,
  setAddProductOpen,
  addProductToOrder,
}: AddProductModalOpen) => {
  const [newProduct, setNewProduct] =
    useState<ProductDetails>(initialProductState);

  const handleValueChange = (key: string, value: any) => {
    setNewProduct((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Modal
      open={addProductOpen}
      onClose={() => {
        setAddProductOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-3/5 max-h-4/5 bg-white rounded-lg p-4">
        <div className="flex justify-between w-full">
          <p className="text-primary text-xl font-semibold w-full text-start">
            Add Product
          </p>
          <MdClose
            size={25}
            className="cursor-pointer"
            onClick={() => {
              setAddProductOpen(false);
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <CustomSelect
            label="Product"
            wrapperClass="col-span-2"
            className="w-[19rem]"
            labelClass="w-[8rem]"
            options={formatProducts(products)}
            value={
              formatProducts(products).find((val) => val.id === newProduct?._id)
                ?.id ?? ""
            }
            onChange={(id) => {
              const data = products.find((prod) => prod._id === id);
              if (data) {
                handleValueChange("_id", data._id);
                handleValueChange("name", data.name);
                handleValueChange("category", data.category.name);
              }
            }}
          />
          <CustomSelect
            label="Product Unit"
            className="w-[19rem]"
            labelClass="w-[8rem]"
            options={formatUnits(units)}
            value={
              formatUnits(units).find(
                (val) => val.id === newProduct?.product_unit._id
              )?.id ?? ""
            }
            onChange={(id) => {
              const data = units.find((unit) => unit._id === id);
              if (data) {
                handleValueChange("product_unit", data);
              }
            }}
          />
          <CustomSelect
            label="Billing Unit"
            className="w-[19rem]"
            labelClass="w-[8rem]"
            options={billingUnitOptions}
            value={
              billingUnitOptions.find(
                (val) => val.value === newProduct?.billing_unit
              )?.id ?? ""
            }
            onChange={(id) => {
              handleValueChange(
                "billing_unit",
                billingUnitOptions.find((unit) => unit.id === id)?.value
              );
            }}
          />
          <CustomInput
            label="Order Quantity"
            type="number"
            labelClass="w-[8rem]"
            placeholder="Enter Order Quantity"
            value={newProduct.order_quantity}
            onChange={(value) =>
              handleValueChange("order_quantity", parseInt(value))
            }
          />
          <CustomInput
            label="Order Repair Count"
            type="number"
            labelClass="w-[8rem]"
            placeholder="Enter Repair Count"
            value={newProduct.order_repair_count}
            onChange={(value) =>
              handleValueChange("order_repair_count", parseInt(value))
            }
          />
        </div>

        <div className="flex gap-4 my-3 w-full justify-end">
          <CustomButton
            label="Cancel"
            onClick={() => setAddProductOpen(false)}
            variant="outlined"
          />
          <CustomButton
            label="Done"
            onClick={() => {
              addProductToOrder(newProduct);
              setAddProductOpen(false);
              setNewProduct(initialProductState);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddProductModal;
