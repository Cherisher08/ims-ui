import { CustomCellEditorProps } from 'ag-grid-react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

dayjs.extend(utc);
dayjs.extend(timezone);

export const InDateCellEditor = forwardRef((props: CustomCellEditorProps & { format: string }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Dayjs | null>(() => (props.value ? dayjs(props.value) : null));

  const format = props.format || 'DD/MM/YYYY hh:mm A';

  const handleChange = (newValue: Dayjs | null) => {
    setValue(newValue);
    props.onValueChange(newValue?.toDate());
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      props.stopEditing();
    }
  };

  useEffect(() => {
    setTimeout(() => wrapperRef.current?.focus(), 10);
  }, []);

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown}>
      <DateTimePicker
        value={value}
        onChange={handleChange}
        ampm
        format={format}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            autoFocus: true,
            sx: {
              '& .MuiPickersInputBase-root': {
                height: '100%',
                outline: 'none',
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' },
              },
              '& .MuiOutlinedInput-root': {
                height: '2.5rem',
                border: 0,
                width: 'fit-content',
              },
              '& .MuiPickersSectionList-root': { width: 'fit-content' },
              '& .MuiInputBase-input': {
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
              },
              '& fieldset': { border: 'none' },
            },
          },
        }}
      />
    </div>
  );
});
