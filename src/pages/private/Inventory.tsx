import CustomButton from "../../styled/CustomButtom";
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
import CustomDatePicker from "../../styled/CustomDatePicker";

interface ProductType {
  productName: string;
  productCode: string;
  category: string;
  unit?: string;
  availableStock: number;
  type: string;
  actions?: string;
}

interface AddProductType {
  productName: string;
  productCode: string;
  unit: string;
  category: string;
  type: {
    id: string;
    value: string;
  } | null;
  quantity: number;
  purchaseDate: string;
  price: number;
  rentalPrice: number;
  discount: number;
  discountType: string;
  total: number;
  availableStock: number;
  seller?: string;
  purchaseOrder?: boolean;
}

const inventory = () => {
  const [search, setSearch] = useState<string>("");
  const [newproductData, setNewproductData] = useState<AddProductType>({
    productCode: "",
    productName: "",
    quantity: 0,
    purchaseDate: "",
    price: 0,
    unit: "",
    category: "",
    total: 0,
    type: null,
    seller: "",
    rentalPrice: 0,
    discount: 0,
    discountType: "1",
    purchaseOrder: false,
    availableStock: 0,
  });
  const [deleteData, setDeleteData] = useState<ProductType | null>(null);
  const [updateData, setUpdateData] = useState<AddProductType | null>(null);

  const [addSellerOpen, setAddSellerOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);

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

  const [rowData, setRowData] = useState<ProductType[]>([
    {
      productName: "Wireless Mouse",
      productCode: "WM123",
      category: "Electronics",
      unit: "cm",
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

  const [filteredData, setFilteredData] = useState<ProductType[]>([]);

  const addProduct = () => {
    console.log("val");
  };

  const deleteProduct = () => {
    console.log("val");
  };

  const handleProductChange = (key: string, value: string | number) => {
    setNewproductData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setFilteredData(rowData);
  }, [rowData]);

  useEffect(() => {
    if (search.trim()) {
      setFilteredData(
        rowData.filter(
          (data) =>
            data.productName.toLowerCase().includes(search.toLowerCase()) ||
            data.productCode.toLowerCase().includes(search.toLowerCase()) ||
            data.type.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(rowData);
    }
  }, [search]);

  return (
    <div className="h-fit">
      <div className="flex justify-between">
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
        <CustomTable rowData={filteredData} colDefs={colDefs} />
      </div>

      {/* Add Product */}
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
                value={newproductData.productName}
                onChange={(value) => handleProductChange("productName", value)}
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
                value={newproductData.productCode}
                onChange={(value) => handleProductChange("productCode", value)}
                placeholder="Enter Product Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newproductData.purchaseDate}
                onChange={(value) => handleProductChange("purchaseDate", value)}
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
                value={newproductData.rentalPrice}
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
                  value={newproductData.discountType}
                  onChange={(value) =>
                    handleProductChange("discountType", value)
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
                name="purchaseOrder"
                id="purchaseOrder"
                className="w-fit h-fit"
                sx={{
                  color: "#000000",
                  "&.Mui-checked": {
                    color: "#000000",
                  },
                }}
                value={newproductData.purchaseOrder}
                onChange={(_, value) =>
                  setNewproductData((prev) => ({
                    ...prev,
                    purchaseOrder: value,
                  }))
                }
              />
              <label
                htmlFor="purchaseOrder"
                className="cursor-pointer select-none"
              >
                Mark as Purchase Order
              </label>
            </div>
            {newproductData.purchaseOrder && (
              <CustomSelect
                label="Seller"
                value={newproductData.seller ?? ""}
                options={sellers}
                onChange={(value) => handleProductChange("seller", value)}
              />
            )}
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

      {/* Update Stock */}
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
                value={newproductData.productName}
                onChange={(value) => handleProductChange("productName", value)}
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
                value={newproductData.type ?? { id: "", value: "" }}
                onChange={(value) => handleProductChange("type", value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Code"
                value={newproductData.productCode}
                onChange={(value) => handleProductChange("productCode", value)}
                placeholder="Enter Product Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newproductData.purchaseDate}
                onChange={(value) => handleProductChange("purchaseDate", value)}
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
                type="number"
                value={newproductData.rentalPrice}
                onChange={(value) =>
                  handleProductChange("rentalPrice", parseInt(value))
                }
                placeholder="Enter Rental Price"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                type="number"
                value={newproductData.quantity}
                onChange={(value) =>
                  handleProductChange("quantity", parseInt(value))
                }
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                type="number"
                value={newproductData.price}
                onChange={(value) =>
                  handleProductChange("price", parseInt(value))
                }
                placeholder="Enter Product Price"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Discount"
                  placeholder=""
                  value={newproductData.discount}
                  type="number"
                  onChange={(value) =>
                    handleProductChange("discount", parseInt(value))
                  }
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
                  value={newproductData.discountType ?? { id: "", value: "" }}
                  onChange={(value) =>
                    handleProductChange("discountType", value)
                  }
                />
              </div>

              <CustomInput
                label="Total"
                type="number"
                value={newproductData.total}
                onChange={(value) =>
                  handleProductChange("total", parseInt(value))
                }
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
                value={newproductData.purchaseOrder}
                onChange={(_, value) =>
                  setNewproductData((prev) => ({
                    ...prev,
                    purchaseOrder: value,
                  }))
                }
              />
              <label
                htmlFor="purchaseOrder"
                className="cursor-pointer select-none"
              >
                Mark as Purchase Order
              </label>
            </div>
            {newproductData.purchaseOrder && (
              <CustomSelect
                label="Seller"
                value={newproductData?.seller ?? { id: "", value: "" }}
                options={sellers}
                onChange={(value) => handleProductChange("seller", value)}
              />
            )}
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
            <p className="text-primary text-xl font-semibold w-full text-start">
              Update Product
            </p>
            <MdClose
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setUpdateData(null);
                setUpdateModalOpen(false);
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-4/5 px-3 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Name"
                value={updateData?.productName ?? ""}
                onChange={(value) => handleProductChange("product_name", value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={"cm"}
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
                value={updateData?.productCode ?? ""}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        productCode: value,
                      };
                    return prev;
                  })
                }
                placeholder="Enter Product Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={updateData?.purchaseDate ?? ""}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        purchaseDate: value,
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
                value={updateData?.category ?? ""}
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

                    setUpdateData((prev) => {
                      if (prev)
                        return {
                          ...prev,
                          category: value,
                        };
                      return prev;
                    });
                  }
                }}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        category: value,
                      };
                    return prev;
                  })
                }
              />
              <CustomInput
                label="Rental Price"
                value={updateData?.rentalPrice ?? 0}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        rentalPrice: parseInt(value),
                      };
                    return prev;
                  })
                }
                placeholder="Enter Rental Price"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                type="number"
                value={updateData?.quantity ?? 0}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    console.log(value);
                    // return;
                    if (prev)
                      return {
                        ...prev,
                        quantity: parseInt(value),
                      };
                    return prev;
                  })
                }
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                value={updateData?.price ?? 0}
                type="number"
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        price: parseInt(value),
                      };
                    return prev;
                  })
                }
                placeholder="Enter Product Price"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Discount"
                  placeholder=""
                  value={updateData?.discount ?? 0}
                  type="number"
                  onChange={(value) =>
                    setUpdateData((prev) => {
                      if (prev)
                        return {
                          ...prev,
                          discount: parseInt(value),
                        };
                      return prev;
                    })
                  }
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
                  value={updateData?.discountType ?? ""}
                  onChange={(value) =>
                    setUpdateData((prev) => {
                      if (prev)
                        return {
                          ...prev,
                          discountType: value,
                        };
                      return prev;
                    })
                  }
                />
              </div>

              <CustomInput
                label="Total"
                value={updateData?.total ?? 0}
                type="number"
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        total: parseInt(value),
                      };
                    return prev;
                  })
                }
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
                value={updateData?.purchaseOrder ?? false}
                onChange={(_, value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        purchaseOrder: value,
                      };
                    return prev;
                  })
                }
              />
              <label
                htmlFor="purchase_order"
                className="cursor-pointer select-none"
              >
                Mark as Purchase Order
              </label>
            </div>
            {updateData?.purchaseOrder && (
              <CustomSelect
                label="Seller"
                value={updateData?.seller ?? ""}
                options={sellers}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        seller: value,
                      };
                    return prev;
                  })
                }
              />
            )}
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

      {/* Delete Modal */}
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

export default inventory;
