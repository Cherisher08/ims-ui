import CustomButton from "../../styled/CustomButtom";
import { LuPlus } from "react-icons/lu";
import CustomInput from "../../styled/CustomInput";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";

const inventory = () => {
  const [search, setSearch] = useState("");

  const handleSearch = (searchText: string) => {
    console.log(searchText);
    setSearch(searchText);
  };

  useEffect(() => {
    console.log(search);
  }, [search]);

  return (
    <div className="h-screen">
      <div className="flex justify-between py-2">
        <CustomButton label="Add Product" icon={<LuPlus color="white" />} />
        <CustomInput
          value={search}
          onChange={handleSearch}
          startIcon={<BsSearch />}
          placeholder="Search Product"
          className="w-60"
        />
      </div>
      <div className="bg-red-200 "></div>
    </div>
  );
};

export default inventory;
