import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

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
  format?: string;
  disabled?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText = '',
  placeholder = '',
  className = '',
  wrapperClass = '',
  labelClass = '',
  format = 'DD/MM/YYYY hh:mm A',
  disabled = false,
}) => {
  const dateFormat = format || 'DD/MM/YYYY hh:mm A';

  const handleChange = (newValue: string | Dayjs | null) => {
    onChange(newValue?.toString() || '');
  };

  return (
    <div className={`flex flex-col  ${wrapperClass} `}>
      <label className={`min-w-[5rem] line-clamp-2 break-words h-fit ${labelClass}`}>{label}</label>
      <div className="flex flex-col gap-2 w-full">
        <DateTimePicker
          value={value ? dayjs(value) : null}
          onChange={handleChange}
          disabled={disabled}
          slotProps={{
            textField: {
              error,
              helperText: error ? helperText : '',
              placeholder,
              className,
              fullWidth: true,
              sx: {
                '& .MuiPickersSectionList-root': {
                  padding: '0.6rem',
                  height: '2.5rem',
                },
                '& .MuiFormHelperText-root': {
                  margin: '0',
                },
              },
            },
            actionBar: {
              actions: ['clear', 'accept'],
            },
          }}
          ampm
          format={dateFormat}
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
