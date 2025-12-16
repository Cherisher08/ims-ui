import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { CustomCellEditorProps } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import { IdNamePair } from '../../pages/private/Stocks';

type AutocompleteCellEditorProps = CustomCellEditorProps & {
  customerOptions: IdNamePair[];
};

export const AutocompleteCellEditor = ({
  value,
  stopEditing,
  onValueChange,
  customerOptions,
}: AutocompleteCellEditorProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<IdNamePair>(() => {
    return customerOptions.find((option) => option.name === value) || null;
  });

  useEffect(() => {
    // Auto focus after mount
    setTimeout(() => ref.current?.focus(), 10);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (_: any, newValue: IdNamePair) => {
    setSelected(newValue);
    onValueChange(newValue);
  };

  const handleBlur = () => {
    stopEditing();
  };

  return (
    <Autocomplete
      options={customerOptions}
      getOptionLabel={(option) => option.name}
      value={selected}
      onChange={handleChange}
      onBlur={handleBlur}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          variant="outlined"
          sx={{
            fontSize: '0.75rem', // Smaller font size
            backgroundColor: '#fff',
          }}
          size="small"
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          {option.name}
        </li>
      )}
      disableClearable
      autoHighlight
      openOnFocus
      fullWidth
    />
  );
};
