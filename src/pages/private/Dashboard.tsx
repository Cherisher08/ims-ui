import { useState } from "react";
import CustomSelect from "../../styled/CustomSelect";
import CustomCard from "../../styled/CustomCard";

const Dashboard = () => {
  const [filter, setFilter] = useState<string>("1");
  const [filterOptions, setFilterOptions] = useState([
    { id: "1", value: "daily" },
    { id: "2", value: "weekly" },
    { id: "3", value: "monthly" },
  ]);

  return (
    <div className="h-auto w-auto">
      <div className="w-full flex justify-between">
        <p className="text-primary font-bold">Overview</p>
        <div>
          <CustomSelect
            label=""
            onChange={(val) => setFilter(val)}
            className="w-[8rem]"
            options={filterOptions}
            value={filter}
          />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(13rem,_1fr))] gap-4">
        <CustomCard
          title="Products In"
          className="grow"
          value={30}
          change={11.2}
        />
        <CustomCard
          title="Products In"
          className="grow"
          value={30}
          change={-11.2}
        />
        <CustomCard
          title="Products In"
          className="grow"
          value={30}
          change={-11.2}
        />
        <CustomCard
          title="Products In"
          className="grow"
          value={30}
          change={11.2}
        />
      </div>
    </div>
  );
};

export default Dashboard;
