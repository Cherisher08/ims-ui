import CustomButton from "../../styled/CustomButton";
import { LuPlus } from "react-icons/lu";
import CustomInput from "../../styled/CustomInput";
import { useEffect, useMemo, useState } from "react";
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
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../../services/ApiService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../constants/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Product } from "../../types/common";

interface ProductType {
  _id: string;
  name: string;
  product_code: string;
  category: string;
  quantity: number;
  type: string;
  actions?: string;
}

const Inventory = () => {
  const userEmail = useSelector((state: RootState) => state.user.email);
  const { data: productData, isLoading: isProductsLoading } =
    useGetProductsQuery();
  const [createProduct, { isSuccess: isProductCreated }] =
    useCreateProductMutation();
  const [updateProduct, { isSuccess: isProductUpdated }] =
    useUpdateProductMutation();
  const [deleteProduct, { isSuccess: isProductDeleted }] =
    useDeleteProductMutation();

  const [search, setSearch] = useState<string>("");
  const [newProductData, setNewProductData] = useState<Product>({
    product_code: "",
    name: "",
    quantity: 0,
    purchase_date: "",
    price: 0,
    unit: "",
    category: "",
    type: "",
    seller: "",
    rent_per_unit: 0,
    discount: 0,
    discount_type: "1",
    purchaseOrder: false,
  });
  const [deleteData, setDeleteData] = useState<ProductType | null>(null);
  const [updateData, setUpdateData] = useState<Product | null>(null);
  console.log("updateData: ", updateData);

  const [addSellerOpen, setAddSellerOpen] = useState<boolean>(false);
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState<boolean>(false);
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

  const rowData = useMemo<ProductType[]>(() => {
    return productData
      ? productData.map((product) => ({
          _id: product._id!,
          name: product.name,
          product_code: product.product_code,
          category: product.category,
          quantity: product.quantity,
          type: product.type,
        }))
      : [];
  }, [productData]);

  const [filteredData, setFilteredData] = useState<ProductType[]>([]);

  const colDefs = useMemo<ColDef<ProductType>[]>(
    () => [
      {
        field: "name",
        headerName: "Product Name",
        flex: 1,
        headerClass: "ag-header-wrap",
        minWidth: 100,
      },
      {
        field: "product_code",
        headerName: "Product Code",
        flex: 1,
        headerClass: "ag-header-wrap",
        minWidth: 80,
      },
      { field: "category", headerName: "Category", flex: 1, minWidth: 90 },
      {
        field: "quantity",
        headerName: "Available Stock",
        flex: 1,
        minWidth: 100,
        headerClass: "ag-header-wrap",
      },
      { field: "type", headerName: "Type", flex: 1, minWidth: 100 },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        minWidth: 100,
        maxWidth: 120,
        pinned: "right",
        cellRenderer: (params: ICellRendererParams<ProductType>) => {
          const rowData = params.data!;

          return (
            <div className="flex gap-2 h-[2rem] items-center">
              <FiEdit
                size={19}
                className="cursor-pointer"
                onClick={() => {
                  const currentRowData =
                    productData?.find(
                      (product) => product._id === rowData._id
                    ) ?? productData![0];
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
              <MdOutlineAddShoppingCart
                size={20}
                className="cursor-pointer"
                onClick={() => setAddStockOpen(true)}
              />
            </div>
          );
        },
      },
    ],
    [productData]
  );

  const addProduct = () => {
    createProduct({
      ...newProductData,
      created_by: userEmail,
      created_at: new Date().toISOString(),
    });
    setAddProductOpen(false);
  };

  const updateProductData = () => {
    updateProduct(updateData!);
    setUpdateModalOpen(false);
  };

  const deleteProductData = () => {
    deleteProduct(deleteData!._id);
    setDeleteProductOpen(false);
  };

  const calculateTotal = useMemo(() => {
    if (addProductOpen) {
      if (
        newProductData?.discount_type === "1" &&
        newProductData.price &&
        newProductData.quantity
      ) {
        const totalPrice = newProductData.price * newProductData.quantity;
        if (newProductData.discount === 0 || isNaN(newProductData.discount))
          return `₹${totalPrice}`;
        const value =
          totalPrice -
          +((newProductData.discount / 100) * totalPrice).toFixed(2);
        return `₹${value}`;
      }
      if (
        newProductData?.discount_type === "2" &&
        newProductData.price &&
        newProductData.quantity
      ) {
        const value =
          newProductData.price * newProductData.quantity -
          newProductData.discount;
        return `₹${value}`;
      }
    }
    if (updateModalOpen) {
      if (
        updateData?.discount_type === "1" &&
        updateData.price &&
        updateData.quantity
      ) {
        const totalPrice = updateData.price * updateData.quantity;
        if (updateData.discount === 0 || isNaN(updateData.discount))
          return `₹${totalPrice}`;
        const value =
          totalPrice - +((updateData.discount / 100) * totalPrice).toFixed(2);
        return `₹${value}`;
      }
      if (
        updateData?.discount_type === "2" &&
        updateData.price &&
        updateData.quantity
      ) {
        const value =
          updateData.price * updateData.quantity - updateData.discount;
        return `₹${value}`;
      }
    }
    return `₹0`;
  }, [
    addProductOpen,
    newProductData.discount,
    newProductData?.discount_type,
    newProductData.price,
    newProductData.quantity,
    updateData?.discount,
    updateData?.discount_type,
    updateData?.price,
    updateData?.quantity,
    updateModalOpen,
  ]);

  const handleProductChange = (key: string, value: string | number) => {
    setNewProductData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateProduct = (key: string, value: string | number) => {
    setUpdateData((prev) => ({ ...prev!, [key]: value }));
  };

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
            data.type.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredData(rowData);
    }
  }, [rowData, search]);

  useEffect(() => {
    if (isProductCreated) {
      toast.success("Product Created Successfully", {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_CREATE,
      });
    }
    if (isProductUpdated) {
      toast.success("Product Updated Successfully", {
        toastId: TOAST_IDS.SUCCESS_PRODUCT_UPDATE,
      });
    }
  }, [isProductCreated, isProductUpdated]);

  return (
    <div className="h-screen">
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
        <CustomTable
          rowData={filteredData}
          colDefs={colDefs}
          loading={isProductsLoading}
        />
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
                value={newProductData.name}
                onChange={(value) => handleProductChange("name", value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={newProductData.unit}
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
                value={newProductData.type}
                onChange={(value) => handleProductChange("type", value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Code"
                value={newProductData.product_code}
                onChange={(value) => handleProductChange("product_code", value)}
                placeholder="Enter Product Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newProductData.purchase_date}
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
                value={newProductData.category}
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
                value={newProductData.rent_per_unit}
                onChange={(value) =>
                  handleProductChange("rent_per_unit", value)
                }
                placeholder="Enter Rental Price"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                type="number"
                value={newProductData.quantity}
                onChange={(value) =>
                  handleProductChange("quantity", value ? parseInt(value) : "")
                }
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                value={newProductData.price}
                type="number"
                onChange={(value) =>
                  handleProductChange("price", value ? parseInt(value) : "")
                }
                placeholder="Enter Product Price"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Discount"
                  placeholder=""
                  value={newProductData.discount}
                  type="number"
                  onChange={(value) =>
                    handleProductChange(
                      "discount",
                      value ? parseInt(value) : ""
                    )
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
                  value={newProductData.discount_type}
                  onChange={(value) =>
                    handleProductChange("discount_type", value)
                  }
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
                value={newProductData.purchaseOrder}
                onChange={(_, value) =>
                  setNewProductData((prev) => ({
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
            {newProductData.purchaseOrder && (
              <CustomSelect
                label="Seller"
                value={newProductData.seller ?? ""}
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
                value={newProductData.name}
                onChange={(value) => handleProductChange("name", value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={newProductData.unit}
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
                value={newProductData.type}
                onChange={(value) => handleProductChange("type", value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Code"
                value={newProductData.product_code}
                onChange={(value) => handleProductChange("product_code", value)}
                placeholder="Enter Product Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={newProductData.purchase_date}
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
                value={newProductData.category}
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
                value={newProductData.rent_per_unit}
                onChange={(value) =>
                  handleProductChange("rent_per_unit", parseInt(value))
                }
                placeholder="Enter Rental Price"
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Quantity"
                type="number"
                value={newProductData.quantity}
                onChange={(value) =>
                  handleProductChange("quantity", parseInt(value))
                }
                placeholder="Enter Product Quantity"
              />

              <CustomInput
                label="Price"
                type="number"
                value={newProductData.price}
                onChange={(value) =>
                  handleProductChange("price", parseInt(value))
                }
                placeholder="Enter Product Price"
              />

              <div className="grid grid-cols-[3fr_1fr] gap-2 w-full">
                <CustomInput
                  label="Discount"
                  placeholder=""
                  value={newProductData.discount}
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
                  value={newProductData.discount_type}
                  onChange={(value) =>
                    handleProductChange("discount_type", value)
                  }
                />
              </div>

              <CustomInput
                label="Total"
                type="number"
                value={calculateTotal}
                placeholder="Rs. 0.0"
                onChange={() => {}}
                disabled
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
                value={newProductData.purchaseOrder}
                onChange={(_, value) =>
                  setNewProductData((prev) => ({
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
            {newProductData.purchaseOrder && (
              <CustomSelect
                label="Seller"
                value={newProductData?.seller ?? ""}
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
                value={updateData?.name ?? ""}
                onChange={(value) => handleUpdateProduct("product_name", value)}
                placeholder="Enter Product Name"
              />
              <CustomAutoComplete
                label="Unit"
                error={false}
                placeholder="Select Unit"
                helperText="Please Select The Unit"
                value={updateData?.unit ?? ""}
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
                    handleUpdateProduct("unit", value);
                  }
                }}
                onChange={(value) => handleUpdateProduct("unit", value)}
              />
              <CustomSelect
                label="Type"
                options={productType}
                value={newProductData.type}
                onChange={(value) => {
                  handleUpdateProduct("type", value);
                }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <CustomInput
                label="Product Code"
                value={updateData?.product_code ?? ""}
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
                placeholder="Enter Product Code"
              />
              <CustomDatePicker
                label="Purchase Date"
                value={updateData?.purchase_date ?? ""}
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
                value={updateData?.rent_per_unit ?? 0}
                onChange={(value) =>
                  setUpdateData((prev) => {
                    if (prev)
                      return {
                        ...prev,
                        rent_per_unit: parseInt(value),
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
                  value={updateData?.discount_type ?? ""}
                  onChange={(value) =>
                    setUpdateData((prev) => {
                      if (prev)
                        return {
                          ...prev,
                          discount_type: value,
                        };
                      return prev;
                    })
                  }
                />
              </div>

              <CustomInput
                label="Total"
                value={calculateTotal}
                type="number"
                onChange={() => {}}
                placeholder="Rs. 0.0"
                disabled
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
              onClick={() => setUpdateModalOpen(false)}
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
            <p className="text-primary text-xl font-semibold w-full text-start">
              Delete Product
            </p>
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
              Deleting this product will make this stock quantity to zero and
              can negatively impact in the balance sheet
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
