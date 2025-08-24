import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  helperText?: string;
  wrapperClass?: string;
  labelClass?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText = "",
  placeholder = "",
  className = "",
  wrapperClass = "",
  labelClass = "",
}) => {
  return (
    <div
      className={`grid grid-cols-[auto_2fr] h-[3.5rem] justify-between min-w-fit gap-2 ${wrapperClass} `}
    >
      <label
        className={`pt-2 min-w-[5rem] line-clamp-2 break-words h-fit ${labelClass}`}
      >
        {label}
      </label>
      <div className="flex flex-col gap-2 w-full">
        <DateTimePicker
          value={value ? dayjs(value) : null}
          onChange={(newValue: Dayjs | null) =>
            onChange(newValue ? newValue.format("YYYY-MM-DDThh:mm") : "")
          }
          slotProps={{
            textField: {
              error,
              helperText: error ? helperText : "",
              placeholder,
              className,
              fullWidth: true,
              sx: {
                "& .MuiPickersSectionList-root": {
                  padding: "0.7rem",
                },
                "& .MuiFormHelperText-root": {
                  margin: "0",
                },
              },
            },
          }}
          ampm
          format="DD/MM/YYYY hh:mm A"
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
