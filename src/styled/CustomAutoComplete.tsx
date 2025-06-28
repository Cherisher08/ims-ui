import { Autocomplete, TextField } from "@mui/material";
import { useMemo, useState } from "react";

export type CustomOptionProps = {
  id: string;
  value: string;
};

type CustomAutoCompleteProps = {
  value: string;
  options: CustomOptionProps[];
  onChange: (value?: string) => void;
  label: string;
  placeholder: string;
  addNewValue: (value: string) => void;
  createOption?: boolean;
  error?: boolean;
  helperText?: string;
  className?: string;
};

const CustomAutoComplete: React.FC<CustomAutoCompleteProps> = ({
  value,
  options,
  label,
  onChange,
  addNewValue,
  placeholder,
  error = false,
  helperText = "",
  className = "",
  createOption = true,
}) => {
  const [inputValue, setInputValue] = useState(value);

  const customOptions = [
    ...options.filter((option) => {
      return option.value.toLowerCase().includes(inputValue.toLowerCase());
    }),
  ];

  const customFilterOptions = (
    options: CustomOptionProps[],
    { inputValue }: { inputValue: string }
  ) => {
    setInputValue(inputValue);
    const filteredOptions = options.filter((option) =>
      option.value.toLowerCase().startsWith(inputValue.toLowerCase())
    );

    return [
      { id: "0", value: "add-new" },
      ...filteredOptions.sort((a, b) => a.value.localeCompare(b.value)),
    ];
  };

  const currentValue = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  return (
    <div className="grid grid-cols-[auto_2fr] justify-between w-full gap-2 h-[3.5rem]">
      <label className="pt-2 w-[5rem] line-clamp-2 break-words h-fit">
        {label}
      </label>
      <div className="flex flex-col gap-2 w-auto">
        <Autocomplete
          autoHighlight
          value={currentValue}
          options={createOption ? customOptions : options}
          filterOptions={customFilterOptions}
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;
            if (option?.value === "add-new") return "+ Create New";
            return option?.value || "";
          }}
          classes={{ root: `  ${className}` }}
          renderInput={(params) => (
            <div>
              <TextField
                {...params}
                placeholder={placeholder}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  className: "h-[2.5rem] px-2",
                }}
              />
              {error && (
                <span className="text-red-700 text-[12px] ml-4">
                  {helperText}
                </span>
              )}
            </div>
          )}
          renderOption={(props, option) =>
            option.value === "add-new" ? (
              <li
                {...props}
                key="create-option"
                onClick={() => {
                  addNewValue(inputValue);
                }}
                className="text-green-500 px-4 py-2 cursor-pointer"
              >
                + Create New
              </li>
            ) : (
              <li {...props} key={option.value}>
                {option.value}
              </li>
            )
          }
          onChange={(_, newValue) => onChange(newValue?.value)}
        />
      </div>
    </div>
  );
};

export default CustomAutoComplete;
