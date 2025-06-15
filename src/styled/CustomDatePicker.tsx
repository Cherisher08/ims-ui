import React from "react";

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) => {
  return (
    <div className="grid grid-cols-[auto_2fr] justify-between w-full gap-2 h-[3.5rem]">
      <label className="pt-2 w-[5rem] line-clamp-2 break-words h-fit">
        {label}
      </label>
      <input
        type="datetime-local"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-sm border border-[#ced4da] focus:border-0 px-3 h-[2.5rem] !w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2] ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomDatePicker;
