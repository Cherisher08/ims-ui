import CustomButton from "../../styled/CustomButton";
import { LuPlus } from "react-icons/lu";
import CustomInput from "../../styled/CustomInput";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { Checkbox, Modal } from "@mui/material";
import CustomSelect from "../../styled/CustomSelect";
import CustomAutoComplete from "../../styled/CustomAutoComplete";
import CustomTable from "../../styled/CustomTable";
import type { ColDef } from "ag-grid-community";
import { FiEdit } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { MdClose, MdOutlineAddShoppingCart } from "react-icons/md";
import type { ICellRendererParams } from "ag-grid-community";
import { PiWarningFill } from "react-icons/pi";

interface Product {
  productName: string;
  productCode: string;
  category: string;
  availableStock: number;
  type: string;
  actions?: string;
}

const Inventory = () => {
  const [search, setSearch] = useState<string>("");
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [addSellerOpen, setAddSellerOpen] = useState<boolean>(false);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);
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
    setSearch(searchText);
  };

  const addProduct = () => {
    console.log("val");
  };

  const deleteProduct = () => {
    console.log("val");
  };

  const handleProductChange = (key: string, value: string | number) => {
    console.log(key, value);
    setNewproductData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    console.log(newproductData.discount_type);
  }, [newproductData]);

  const [rowData, setRowData] = useState<Product[]>([
    {
      productName: "Wireless Mouse",
      productCode: "WM123",
      category: "Electronics",
      availableStock: 45,
      type: "Accessory",
    },
    {
      productName: "Bluetooth Headphones",
      productCode: "BH456",
      category: "Electronics",
      availableStock: 25,
      type: "Audio",
    },
    {
      productName: "Laptop Stand",
      productCode: "LS789",
      category: "Office",
      availableStock: 60,
      type: "Furniture",
    },
    {
      productName: "Notebook",
      productCode: "NB321",
      category: "Stationery",
      availableStock: 100,
      type: "Paper",
    },
    {
      productName: "Desk Lamp",
      productCode: "DL654",
      category: "Lighting",
      availableStock: 35,
      type: "Electrical",
    },
    {
      productName: "USB-C Cable",
      productCode: "UC987",
      category: "Electronics",
      availableStock: 80,
      type: "Accessory",
    },
    {
      productName: "Water Bottle",
      productCode: "WB741",
      category: "Lifestyle",
      availableStock: 50,
      type: "Utility",
    },
    {
      productName: "Backpack",
      productCode: "BP852",
      category: "Bags",
      availableStock: 20,
      type: "Travel",
    },
    {
      productName: "Smart Watch",
      productCode: "SW963",
      category: "Wearables",
      availableStock: 15,
      type: "Electronics",
    },
    {
      productName: "Keyboard",
      productCode: "KB159",
      category: "Electronics",
      availableStock: 40,
      type: "Peripheral",
    },
    {
      productName: "Monitor",
      productCode: "MN753",
      category: "Electronics",
      availableStock: 10,
      type: "Display",
    },
    {
      productName: "Pen Set",
      productCode: "PS456",
      category: "Stationery",
      availableStock: 200,
      type: "Writing",
    },
    {
      productName: "File Organizer",
      productCode: "FO369",
      category: "Office",
      availableStock: 75,
      type: "Storage",
    },
    {
      productName: "Tablet",
      productCode: "TB147",
      category: "Electronics",
      availableStock: 18,
      type: "Mobile",
    },
    {
      productName: "Portable Charger",
      productCode: "PC258",
      category: "Electronics",
      availableStock: 90,
      type: "Battery",
    },
    {
      productName: "Chair",
      productCode: "CH369",
      category: "Furniture",
      availableStock: 12,
      type: "Office",
    },
    {
      productName: "Desk",
      productCode: "DK147",
      category: "Furniture",
      availableStock: 8,
      type: "Office",
    },
    {
      productName: "Ruler",
      productCode: "RL159",
      category: "Stationery",
      availableStock: 150,
      type: "Measuring",
    },
    {
      productName: "Stapler",
      productCode: "SP951",
      category: "Stationery",
      availableStock: 60,
      type: "Tool",
    },
    {
      productName: "Laptop",
      productCode: "LT123",
      category: "Electronics",
      availableStock: 22,
      type: "Computer",
    },
  ]);

  const [colDefs, setColDefs] = useState<ColDef<Product>[]>([
    { field: "productName", headerName: "Product Name", flex: 1 },
    { field: "productCode", headerName: "Product Code", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "availableStock", headerName: "Available Stock", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params: ICellRendererParams) => {
        const rowData = params.data;

        return (
          <div className="flex gap-2 h-[2rem] items-center">
            <FiEdit
              size={19}
              className="cursor-pointer"
              onClick={() => console.log("Edit", rowData)}
            />
            <AiOutlineDelete
              size={20}
              className="cursor-pointer"
              onClick={() => setDeleteData(rowData)}
            />
            <MdOutlineAddShoppingCart
              size={20}
              className="cursor-pointer"
              onClick={() => setAddStockOpen(true)}
            />
          </div>
        );
      },
    },
  ]);

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
          className=""
        />
      </div>
      <div className="w-full h-fit overflow-y-auto">
        <CustomTable rowData={rowData} colDefs={colDefs} />
      </div>

      <Modal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">
              New Product
            </p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => setAddProductOpen(false)}
            />
          </div>
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
        open={addStockOpen}
        onClose={() => setAddStockOpen(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-4/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">
              Add Stock
            </p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => setAddStockOpen(false)}
            />
          </div>
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
            <CustomButton onClick={addProduct} label="Save Product" />
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteData ? true : false}
        onClose={() => setDeleteData(null)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-2/5 max-h-4/5 bg-white rounded-lg p-4">
          <div className="flex justify-between w-full">
            <p className="text-primary text-xl font-semibold w-full text-start">
              Delete Product
            </p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => setDeleteData(null)}
            />
          </div>

          <div className="bg-yellow flex flex-col gap-2 p-2 rounded-sm">
            <div className="flex gap-2 items-center">
              <PiWarningFill size={25} />
              <span className="text-xl">Warning!</span>
            </div>
            <p>
              Deleting this product will make this stock quantity to zero and
              can negatively impact in the balance sheet
            </p>
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => setDeleteData(null)}
              label="Cancel"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={() => deleteProduct()} label="Delete" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
