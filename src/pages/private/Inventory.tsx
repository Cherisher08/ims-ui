import CustomButton from "../../styled/CustomButtom";
import { LuPlus } from "react-icons/lu";
import CustomInput from "../../styled/CustomInput";
import { useState } from "react";
import { BsSearch } from "react-icons/bs";
import { Modal } from "@mui/material";

const inventory = () => {
  const [search, setSearch] = useState<string>("");
  const [addProductOpen, setAddProductOpen] = useState<boolean>(false);

  const handleSearch = (searchText: string) => {
    console.log(searchText);
    setSearch(searchText);
  };

  const addProduct = () => {
    console.log("val");
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

          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => setAddProductOpen(false)}
              label="Discard"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton
              onClick={addProduct}
              label="Add Product"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default inventory;
