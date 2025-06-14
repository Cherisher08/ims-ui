import React from "react";
import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io";

type CardProps = {
  title: string;
  value: number;
  change: number;
  className?: string;
};

const CustomCard = ({ title, value, change, className }: CardProps) => {
  return (
    <div
      className={`rounded-3xl p-5 flex flex-col justify-between bg-[#eceefb] min-w-52 min-h-26 max-w-60 ${className}`}
    >
      <p>{title}</p>
      <div className="grid grid-cols-2 items-center">
        <p className="text-2xl font-bold">{value}</p>
        <div className="flex gap-2 justify-self-end items-center">
          <p className="">{change}%</p>
          {change > 0 ? (
            <IoIosTrendingUp color="green" size={20} />
          ) : (
            <IoIosTrendingDown color="red" size={20} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomCard;
