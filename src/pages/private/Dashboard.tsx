import React, { useEffect, useState } from "react";
import CustomSelect from "../../styled/CustomSelect";
import CustomCard from "../../styled/CustomCard";
import CustomLineChart from "../../styled/CustomLineChart";

const Dashboard = () => {
  const [filter, setFilter] = useState<string>("1");
  const [graphFilter, setGraphFilter] = useState<number>(1);
  const [filterOptions, setFilterOptions] = useState([
    { id: "1", value: "daily" },
    { id: "2", value: "weekly" },
    { id: "3", value: "monthly" },
  ]);

  const sampleData = [
    { date: "2024-05-01", price: 120 },
    { date: "2024-05-02", price: 125 },
    { date: "2024-05-03", price: 140 },
    { date: "2024-05-04", price: 428 },
    { date: "2024-05-05", price: 35 },
    { date: "2024-05-06", price: 440 },
    { date: "2024-05-07", price: 138 },
    { date: "2024-05-08", price: 732 },
    { date: "2024-05-09", price: 145 },
    { date: "2024-05-10", price: 150 },
    { date: "2024-05-11", price: 252 },
    { date: "2024-05-12", price: 148 },
    { date: "2024-05-13", price: 149 },
    { date: "2024-05-14", price: 151 },
    { date: "2024-05-15", price: 55 },
    { date: "2024-05-16", price: 160 },
    { date: "2024-05-17", price: 858 },
    { date: "2024-05-18", price: 562 },
    { date: "2024-05-19", price: 165 },
    { date: "2024-05-20", price: 168 },
  ];

  return (
    <div className="h-auto w-full overflow-y-auto">
      {/* Header */}
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
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(13rem,_1fr))] items-center justify-center gap-4">
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
        <div className="grid grid-cols-[70%_auto] w-full gap-3 pb-4">
          <div className="flex flex-col bg-gray-50 rounded-xl gap-1 px-3 py-2 h-full">
            <ul className="flex flex-row text-sm gap-3">
              <li
                className={`cursor-pointer ${
                  graphFilter == 1 ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setGraphFilter(1)}
              >
                Balance Pending
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 2 ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setGraphFilter(2)}
              >
                Return Pending
              </li>
              <li
                className={`cursor-pointer ${
                  graphFilter == 3 ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setGraphFilter(3)}
              >
                Order Timeline
              </li>
            </ul>
            <CustomLineChart chartData={sampleData} />
          </div>
          <div className="rounded-xl p-4 bg-gray-50 flex flex-col gap-1 max-h-[28rem] overflow-y-auto">
            <p className="text-lg font-semibold">Title</p>
            <ul className="flex flex-col gap-3 px-4 h-full overflow-y-auto">
              {[
                { name: "hari", amount: 1000 },
                { name: "bob", amount: 6000 },
                { name: "raj", amount: 3000 },
                { name: "alice", amount: 600 },
                { name: "kumar", amount: 4500 },
                { name: "ram", amount: 1800 },
                { name: "karan", amount: 200 },
                { name: "alice", amount: 600 },
                { name: "raj", amount: 3000 },
                { name: "alice", amount: 600 },
                { name: "kumar", amount: 4500 },
                { name: "ram", amount: 1800 },
                { name: "karan", amount: 200 },
                { name: "alice", amount: 600 },
                { name: "bob", amount: 6000 },
                { name: "ram", amount: 1800 },
                { name: "jai", amount: 500 },
              ].map((record, index) => (
                <li key={index} className="flex justify-between">
                  <p>{record.name}</p>
                  <p>{record.amount}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
