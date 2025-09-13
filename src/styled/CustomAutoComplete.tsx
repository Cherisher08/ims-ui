import { Autocomplete, Box, Link, TextField } from '@mui/material';
import { useMemo, useState } from 'react';

export type CustomOptionProps = {
  id: string;
  value: string;
};

export type LabelNavigation = {
  label: string;
  link: string;
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
  labelNavigation?: LabelNavigation;
};

const CustomAutoComplete: React.FC<CustomAutoCompleteProps> = ({
  value,
  options,
  label,
  onChange,
  addNewValue,
  placeholder,
  error = false,
  helperText = '',
  className = '',
  createOption = true,
  labelNavigation = { label: '', link: '' },
}) => {
  const [inputValue, setInputValue] = useState(value);

  const customOptions = [
    ...options.filter((option) => {
      return option.value?.toLowerCase().includes(inputValue.toLowerCase());
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
    return createOption
      ? [
          { id: '0', value: 'add-new' },
          ...filteredOptions.sort((a, b) => a.value.localeCompare(b.value)),
        ]
      : [...filteredOptions.sort((a, b) => a.value.localeCompare(b.value))];
  };

  const currentValue = useMemo(() => {
    return (
      options.find((option) => option.value === value) ?? {
        id: '',
        value: '',
      }
    );
  }, [options, value]);

  return (
    <div className="flex flex-col w-full">
      <Box className="flex justify-between mb-1">
        <label className="line-clamp-2 break-words h-fit" htmlFor={`custom-autocomplete-${label}`}>
          {label}
        </label>
        {labelNavigation.link && (
          <Link
            variant="caption"
            href={labelNavigation.link}
            target="_blank"
            rel="noopener"
            className=" relative top-0.5"
          >
            {labelNavigation.label}
          </Link>
        )}
      </Box>
      <div className="flex flex-col gap-2 w-auto">
        <Autocomplete
          autoHighlight
          value={currentValue}
          options={createOption ? customOptions : options}
          filterOptions={customFilterOptions}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            if (option?.value === 'add-new') return '+ Create New';
            return option?.value || '';
          }}
          classes={{ root: `  ${className}` }}
          renderInput={(params) => (
            <div>
              <TextField
                {...params}
                placeholder={placeholder}
                variant="outlined"
                id={`custom-autocomplete-${label}`}
                InputProps={{
                  ...params.InputProps,
                  className: `h-[2.5rem] px-2 ${error ? 'border border-red-700 text-red-700' : ''}`,
                }}
              />
              {error && <span className="text-red-700 text-[12px] ml-4">{helperText}</span>}
            </div>
          )}
          renderOption={(props, option) =>
            option.value === 'add-new' ? (
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
