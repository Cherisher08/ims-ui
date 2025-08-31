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
    <div className={`flex flex-col w-full h-fit ${wrapperClass}`}>
      <label className={` line-clamp-2 break-words h-fit ${labelClass}`}>{label}</label>
      <div className="flex flex-col gap-2">
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
        {error && <span className="text-red-700 text-[12px] ml-4">{helperText}</span>}
      </div>
    </div>
  );
};

export default CustomSelect;
