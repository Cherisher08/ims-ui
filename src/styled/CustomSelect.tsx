import { MenuItem, Select } from "@mui/material";

export type CustomSelectOptionProps = {
  id: string;
  value: string;
};

type CustomSelectProps = {
  value: string;
  options: CustomSelectOptionProps[];
  onChange: (value: string) => void;
  label: string;
  defaultValue?: string;
  error?: boolean;
  helperText?: string;
  className?: string;
  wrapperClass?: string;
  labelClass?: string;
};

const CustomSelect = ({
  value,
  options,
  label,
  onChange,
  defaultValue = "",
  error = false,
  helperText = "",
  className = "",
  labelClass = "",
  wrapperClass = "",
}: CustomSelectProps) => {
  return (
    <div
      className={`grid grid-cols-[auto_2fr] justify-between w-full gap-2 h-[3.5rem] ${
        helperText ? "" : "items-center"
      } ${wrapperClass}`}
    >
      <label
        className={`${
          helperText ? "pt-3" : ""
        } line-clamp-2 break-words h-fit ${labelClass} ${
          label ? "w-[5rem]" : "w-0"
        }`}
      >
        {label}
      </label>
      <div className="flex flex-col gap-2 w-full">
        <Select
          className={`h-[2.5rem] ${className}`}
          error={error}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {options.map((option) => (
            <MenuItem value={option.id} key={option.id}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
        {error && (
          <span className="text-red-700 text-[12px] ml-4">{helperText}</span>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
