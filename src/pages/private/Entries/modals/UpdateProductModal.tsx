import { Modal } from "@mui/material";
import { BillingUnit, ProductDetails } from "../../../../types/order";
import { MdClose } from "react-icons/md";
import CustomButton from "../../../../styled/CustomButton";
import { Product } from "../../../../types/common";
import CustomSelect from "../../../../styled/CustomSelect";
import CustomInput from "../../../../styled/CustomInput";
import CustomDatePicker from "../../../../styled/CustomDatePicker";
import { getDuration } from "../../Orders/utils";
import { useEffect } from "react";

type UpdateProductModalOpen = {
  updateProductOpen: boolean;
  products: Product[];
  updateProduct: ProductDetails;
  setUpdateProduct: React.Dispatch<React.SetStateAction<ProductDetails>>;
  setUpdateProductOpen: (value: boolean) => void;
  updateProductToOrder: () => void;
};

const billingUnitOptions = Object.entries(BillingUnit).map(([key, value]) => ({
  id: key,
  value,
}));

const formatProducts = (products: Product[]) => {
  return products.map((product) => ({
    id: product._id || "",
    value: product.name,
  }));
};

const UpdateProductModal = ({
  updateProductOpen,
  products,
  updateProduct,
  setUpdateProduct,
  setUpdateProductOpen,
  updateProductToOrder,
}: UpdateProductModalOpen) => {
  const currentAvailableStock =
    products.find((product) => product._id === updateProduct?._id)
      ?.available_stock || 0;

  const isDoneDisabled =
    updateProduct.order_quantity <= 0 ||
    (currentAvailableStock ?? 0) < updateProduct.order_quantity ||
    updateProduct.order_quantity < updateProduct.order_repair_count;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (key: string, value: any) => {
    setUpdateProduct((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const duration = getDuration(updateProduct.out_date, updateProduct.in_date);
    handleValueChange("duration", duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    updateProduct.billing_unit,
    updateProduct.in_date,
    updateProduct.out_date,
  ]);

  return (
    <Modal
      open={updateProductOpen}
      onClose={() => {
        setUpdateProductOpen(false);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-3/5 lg:w-4/5 xl:w-3/5 max-h-4/5 overflow-y-auto mt-2 bg-white rounded-lg p-4">
        <div className="flex flex-col gap-4 overflow-y-auto w-full max-h-[80vh]">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">
              Update Product
            </p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setUpdateProductOpen(false);
              }}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
            <CustomSelect
              label="Product"
              labelClass="w-[8rem]"
              options={formatProducts(products)}
              value={
                formatProducts(products).find(
                  (val) => val.id === updateProduct?._id
                )?.id ?? ""
              }
              onChange={(id) => {
                const data = products.find((prod) => prod._id === id);
                if (data) {
                  handleValueChange("_id", data._id);
                  handleValueChange("name", data.name);
                  handleValueChange("category", data.category.name);
                  handleValueChange("product_unit", data.unit);
                  handleValueChange("rent_per_unit", data.rent_per_unit);
                }
              }}
            />
            <CustomInput
              label="Product Unit"
              labelClass="w-[8rem]"
              disabled={true}
              value={updateProduct.product_unit.name || ""}
              onChange={() => {}}
              placeholder={""}
            />
            <CustomSelect
              label="Billing Unit"
              labelClass="w-[8rem]"
              options={billingUnitOptions}
              value={
                billingUnitOptions.find(
                  (val) => val.value === updateProduct?.billing_unit
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
              value={updateProduct.order_quantity}
              error={
                (currentAvailableStock ?? 0) < updateProduct.order_quantity
              }
              helperText="Quantity greater than Available Stock"
              onChange={(value) =>
                handleValueChange("order_quantity", parseInt(value))
              }
            />
            <CustomDatePicker
              value={updateProduct.out_date}
              labelClass="w-[8rem]"
              label="Out Date"
              onChange={(value) => handleValueChange("out_date", value)}
            />
            <CustomDatePicker
              value={updateProduct.in_date}
              labelClass="w-[8rem]"
              label="In Date"
              onChange={(value) => handleValueChange("in_date", value)}
            />
            <CustomInput
              label="Order Repair Count"
              type="number"
              labelClass="w-[8rem]"
              placeholder="Enter Repair Count"
              value={updateProduct.order_repair_count}
              onChange={(value) =>
                handleValueChange("order_repair_count", parseInt(value))
              }
              error={
                updateProduct.order_quantity < updateProduct.order_repair_count
              }
              helperText="Repair Count higher than Order Quantity"
            />
            <CustomInput
              label="Duration"
              type="number"
              labelClass="w-[8rem]"
              placeholder="Enter Duration"
              value={updateProduct.duration}
              onChange={(value) =>
                handleValueChange("duration", parseInt(value))
              }
            />
            <CustomInput
              label="Available Stock"
              type="number"
              labelClass="w-[8rem]"
              placeholder=""
              disabled
              value={currentAvailableStock || 0}
              onChange={() => {}}
            />
          </div>

          <div className="flex gap-4 my-3 w-full justify-end">
            <CustomButton
              label="Cancel"
              onClick={() => setUpdateProductOpen(false)}
              variant="outlined"
            />
            <CustomButton
              label="Done"
              onClick={() => {
                updateProductToOrder();
                setUpdateProductOpen(false);
              }}
              disabled={isDoneDisabled}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateProductModal;
