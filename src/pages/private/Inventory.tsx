import CustomButton from "../../styled/CustomButtom";
import { LuPlus } from "react-icons/lu";
import CustomInput from "../../styled/CustomInput";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { Checkbox, Modal } from "@mui/material";
import CustomSelect from "../../styled/CustomSelect";
import CustomAutoComplete from "../../styled/CustomAutoComplete";

const inventory = () => {
  const [search, setSearch] = useState<string>("");
  const [addProductOpen, setAddProductOpen] = useState<boolean>(true);
  const [addSellerOpen, setAddSellerOpen] = useState<boolean>(false);
  const [newproductData, setNewproductData] = useState({
    product_code: "",
    product_name: "",
    quantity: "",
    purchase_date: "",
    price: "",
    unit: "",
    category: "",
    total: "",
    type: "",
    seller: "",
    rental_price: "",
    discount: "",
    discount_type: "1",
    purchase_order: false,
  });

  const [productCategories, setProductCategories] = useState([
    {
      id: 1,
      value: "heavy machineries",
    },
    {
      id: 2,
      value: "light machineries",
    },
  ]);

  const [productUnits, setProductUnits] = useState([
    {
      id: 1,
      value: "Kg",
    },
    {
      id: 2,
      value: "g",
    },
    {
      id: 3,
      value: "cm",
    },
    {
      id: 4,
      value: "M",
    },
  ]);

  const [sellers, setSellers] = useState([
    {
      id: "1",
      value: "Ajay Devan",
    },
    {
      id: "2",
      value: "VigneshShivaram",
    },
    {
      id: "3",
      value: "Gnanesh",
    },
    {
      id: "4",
      value: "Surya",
    },
  ]);

  const [productType, setProductType] = useState([
    { id: "1", value: "Rental" },
    { id: "2", value: "Sales" },
    { id: "3", value: "Service" },
  ]);

  const handleSearch = (searchText: string) => {
    console.log(searchText);
    setSearch(searchText);
  };

  const addProduct = () => {
    console.log("val");
  };

  const handleProductChange = (key: string, value: string | number) => {
    console.log(key, value);
    setNewproductData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    console.log(newproductData.discount_type);
  }, [newproductData]);
  return (
    <div className="h-screen">
      <div className="flex justify-between">
        <CustomButton
          onClick={() => setAddProductOpen(true)}
          label="Add Product"
          icon={<LuPlus color="white" />}
        />
        <CustomInput
          label=""
          value={search}
          onChange={handleSearch}
          startIcon={<BsSearch />}
          placeholder="Search Product"
          className="w-60"
        />
      </div>
      <div className="bg-red-200 "></div>

      <Modal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
          <p className="text-primary text-xl font-semibold w-full text-start">
            New Product
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-4/5 px-3 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Name"
                value={newproductData.product_name}
                onChange={(value) => handleProductChange("product_name", value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={newproductData.unit}
                options={productUnits}
                className=""
                addNewValue={(value) => {
                  const exists =
                    productUnits.filter(
                      (option) =>
                        option.value.toLocaleLowerCase() ===
                        value.toLocaleLowerCase()
                    ).length > 0;
                  if (!exists && value.length > 0) {
                    setProductUnits((prev) => [
                      ...prev,
                      { id: productUnits.length, value: value },
                    ]);
                    handleProductChange("unit", value);
                  }
                }}
                onChange={(value) => handleProductChange("unit", value)}
              />
              <CustomSelect
                label="Type"
                options={productType}
                value={newproductData.type}
                onChange={(value) => handleProductChange("type", value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Code"
                value={newproductData.product_code}
                onChange={(value) => handleProductChange("product_code", value)}
                placeholder="Enter Product Code"
              />
              <CustomInput
                label="Purchase Date"
                value={newproductData.purchase_date}
                onChange={(value) =>
                  handleProductChange("purchase_date", value)
                }
                placeholder="Enter Purchase Date"
              />
              <CustomAutoComplete
                label="Category"
                error={false}
                placeholder="Select Category"
                helperText="Please Select The Category"
                value={newproductData.category}
                options={productCategories}
                className=""
                addNewValue={(value) => {
                  const exists =
                    productCategories.filter(
                      (option) =>
                        option.value.toLocaleLowerCase() ===
                        value.toLocaleLowerCase()
                    ).length > 0;
                  if (!exists && value.length > 0) {
                    setProductCategories((prev) => [
                      ...prev,
                      { id: productCategories.length, value: value },
                    ]);
                    handleProductChange("category", value);
                  }
                }}
                onChange={(value) => handleProductChange("category", value)}
              />
              <CustomInput
                label="Rental Price"
                value={newproductData.rental_price}
                onChange={(value) => handleProductChange("rental_price", value)}
                placeholder="Enter Rental Price"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                value={newproductData.quantity}
                onChange={(value) => handleProductChange("quantity", value)}
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                value={newproductData.price}
                onChange={(value) => handleProductChange("price", value)}
                placeholder="Enter Product Price"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Discount"
                  placeholder=""
                  value={newproductData.discount}
                  type="number"
                  onChange={(value) => handleProductChange("discount", value)}
                />
                <CustomSelect
                  label=""
                  options={[
                    {
                      id: "1",
                      value: "%",
                    },
                    {
                      id: "2",
                      value: "₹",
                    },
                  ]}
                  defaultValue="%"
                  value={newproductData.discount_type}
                  onChange={(value) =>
                    handleProductChange("discount_type", value)
                  }
                />
              </div>

              <CustomInput
                label="Total"
                value={newproductData.total}
                onChange={(value) => handleProductChange("total", value)}
                placeholder="Rs. 0.0"
              />
            </div>

            <div className="flex gap-2 items-center font-semibold h-fit">
              <Checkbox
                name="purchase_order"
                id="purchase_order"
                className="w-fit h-fit"
                sx={{
                  color: "#000000",
                  "&.Mui-checked": {
                    color: "#000000",
                  },
                }}
                value={newproductData.purchase_order}
                onChange={(_, value) =>
                  setNewproductData((prev) => ({
                    ...prev,
                    purchase_order: value,
                  }))
                }
              />
              <label
                htmlFor="purchase_order"
                className="cursor-pointer select-none"
              >
                Mark as Purchase Order
              </label>
            </div>
            <CustomSelect
              label="Seller"
              value={newproductData.seller}
              options={sellers}
              onChange={(value) => handleProductChange("seller", value)}
            />
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => setAddProductOpen(false)}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={addProduct} label="Add Product" />
          </div>
        </div>
      </Modal>

      <Modal
        open={addSellerOpen}
        onClose={() => setAddSellerOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div></div>
      </Modal>
    </div>
  );
};

export default inventory;
