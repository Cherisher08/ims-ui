import { Modal } from "@mui/material";
import { ProductDetails } from "../../../../types/order";
import { MdClose } from "react-icons/md";
import CustomButton from "../../../../styled/CustomButton";
import { useEffect, useState } from "react";
import { Product } from "../../../../types/common";
import CustomSelect from "../../../../styled/CustomSelect";
import dayjs from "dayjs";
import CustomInput from "../../../../styled/CustomInput";
import CustomDatePicker from "../../../../styled/CustomDatePicker";
import { getDuration } from "../../Orders/utils";

type AddProductModalOpen = {
  addProductOpen: boolean;
  products: Product[];
  setAddProductOpen: (value: boolean) => void;
  addProductToOrder: (product: ProductDetails) => void;
};

// const billingUnitOptions = Object.entries(BillingUnit).map(([key, value]) => ({
//   id: key,
//   value,
// }));

const initialProductState: ProductDetails = {
  _id: "",
  name: "",
  category: "",
  // billing_unit: BillingUnit.DAYS,
  product_unit: {
    _id: "",
    name: "",
  },
  in_date: "",
  order_quantity: 0,
  order_repair_count: 0,
  out_date: dayjs().format("YYYY-MM-DDTHH:mm"),
  duration: 1,
  damage: "",
  rent_per_unit: 0,
  product_code: "",
};

const formatProducts = (products: Product[]) => {
  return products.map((product) => ({
    id: product._id || "",
    value: product.name,
  }));
};

const AddProductModal = ({
  addProductOpen,
  products,
  setAddProductOpen,
  addProductToOrder,
}: AddProductModalOpen) => {
  const [newProduct, setNewProduct] = useState<ProductDetails>(initialProductState);

  const [currentAvailableStock, setCurrentAvailableStock] = useState<number>(0);

  const isDoneDisabled =
    newProduct.order_quantity <= 0 ||
    (currentAvailableStock ?? 0) < newProduct.order_quantity ||
    newProduct.order_quantity < newProduct.order_repair_count;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = (key: string, value: any) => {
    setNewProduct((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const duration = getDuration(
      newProduct.out_date,
      newProduct.in_date
      //  newProduct.billing_unit
    );
    handleValueChange("duration", duration);
  }, [newProduct.in_date, newProduct.out_date]);

  return (
    <Modal
      open={addProductOpen}
      onClose={() => {
        setAddProductOpen(false);
        setNewProduct(initialProductState);
        setCurrentAvailableStock(0);
      }}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4 justify-center items-center w-3/5 lg:w-4/5 xl:w-3/5 max-h-5/6 overflow-y-auto mt-2 bg-white rounded-lg p-4">
        <div className="flex flex-col gap-4 overflow-y-auto w-full max-h-[80vh]">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">Add Product</p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setAddProductOpen(false);
              }}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
            <CustomSelect
              label="Product"
              labelClass="w-[8rem]"
              options={formatProducts(products)}
              value={formatProducts(products).find((val) => val.id === newProduct?._id)?.id ?? ""}
              onChange={(id) => {
                const data = products.find((prod) => prod._id === id);
                if (data) {
                  handleValueChange("_id", data._id);
                  handleValueChange("name", data.name);
                  handleValueChange("category", data.category.name);
                  handleValueChange("product_unit", data.unit);
                  handleValueChange("rent_per_unit", data.rent_per_unit);
                  setCurrentAvailableStock(data.available_stock);
                }
              }}
            />
            <CustomInput
              label="Product Unit"
              className=""
              labelClass="w-[8rem]"
              value={newProduct.product_unit.name || ""}
              disabled={true}
              onChange={() => {}}
              placeholder={""}
            />
            {/* <CustomSelect
              label="Billing Unit"
              className=""
              labelClass="w-[8rem]"
              options={billingUnitOptions}
              value={
                billingUnitOptions.find((val) => val.value === newProduct?.billing_unit)?.id ?? ""
              }
              onChange={(id) => {
                handleValueChange(
                  "billing_unit",
                  billingUnitOptions.find((unit) => unit.id === id)?.value
                );
              }}
            /> */}
            <CustomInput
              label="Order Quantity"
              type="number"
              labelClass="w-[8rem]"
              placeholder="Enter Order Quantity"
              wrapperClass="h-fit"
              value={newProduct.order_quantity}
              error={(currentAvailableStock ?? 0) < newProduct.order_quantity}
              helperText="Quantity cannot be greater than Available Stock"
              onChange={(value) => handleValueChange("order_quantity", parseInt(value))}
            />
            <CustomDatePicker
              value={newProduct.out_date}
              labelClass="w-[8rem]"
              className=""
              label="Out Date"
              onChange={(value) => handleValueChange("out_date", value)}
            />
            <CustomDatePicker
              value={newProduct.in_date}
              labelClass="w-[8rem]"
              label="In Date"
              wrapperClass="w-full"
              className="max-w-full"
              onChange={(value) => handleValueChange("in_date", value)}
            />
            <CustomInput
              label="Order Repair Count"
              type="number"
              labelClass="w-[8rem]"
              placeholder="Enter Repair Count"
              value={newProduct.order_repair_count}
              onChange={(value) => handleValueChange("order_repair_count", parseInt(value))}
              error={newProduct.order_quantity < newProduct.order_repair_count}
              helperText="Repair Count cannot be higher than Order Quantity"
            />
            <CustomInput
              label="Duration"
              type="number"
              labelClass="w-[8rem]"
              placeholder="Enter Duration"
              value={newProduct.duration}
              onChange={(value) => handleValueChange("duration", parseInt(value))}
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
              onClick={() => {
                setAddProductOpen(false);
                setNewProduct(initialProductState);
                setCurrentAvailableStock(0);
              }}
              variant="outlined"
            />
            <CustomButton
              label="Done"
              onClick={() => {
                addProductToOrder(newProduct);
                setAddProductOpen(false);
                setNewProduct(initialProductState);
                setCurrentAvailableStock(0);
              }}
              disabled={isDoneDisabled}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddProductModal;
