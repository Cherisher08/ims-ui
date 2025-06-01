import CustomButton from "../../styled/CustomButtom";
import { LuPlus } from "react-icons/lu";
import CustomInput from "../../styled/CustomInput";
import { useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FormControl, Modal } from "@mui/material";

const inventory = () => {
  const [search, setSearch] = useState<string>("");
  const [addProductOpen, setAddProductOpen] = useState<boolean>(true);
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
  });

  const handleSearch = (searchText: string) => {
    console.log(searchText);
    setSearch(searchText);
  };

  const addProduct = () => {
    console.log("val");
  };

  const handleProductChange = (key: string, value: string | number) => {
    setNewproductData((prev) => ({ ...prev, [key]: value }));
  };

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
        <div className="flex flex-col gap-4 justify-center items-center bg-white rounded-lg p-4">
          <p className="text-primary text-xl font-semibold w-full text-start">
            New Product
          </p>
          <FormControl className="grid grid-cols-3 gap-3">
            <CustomInput
              label="Product Name"
              value={newproductData.product_name}
              onChange={(value) => handleProductChange("product_name", value)}
              placeholder="Enter Product Name"
            />
            <CustomInput
              label="Product Code"
              value={newproductData.product_code}
              onChange={(value) => handleProductChange("product_code", value)}
              placeholder="Enter Product Code"
            />
            <CustomInput
              label="Quantity"
              value={newproductData.quantity}
              onChange={(value) => handleProductChange("quantity", value)}
              placeholder="Enter Product Quantity"
            />

            <CustomInput
              label="Purchase Date"
              value={newproductData.purchase_date}
              onChange={(value) => handleProductChange("purchase_date", value)}
              placeholder="Enter Purchase Date"
            />
            <CustomInput
              label="Price"
              value={newproductData.price}
              onChange={(value) => handleProductChange("price", value)}
              placeholder="Enter Product Price"
            />

            <CustomInput
              label="Total"
              value={newproductData.total}
              onChange={(value) => handleProductChange("total", value)}
              placeholder="Rs. 0.0"
            />
          </FormControl>
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
    </div>
  );
};

export default inventory;
