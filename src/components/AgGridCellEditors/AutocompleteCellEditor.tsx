import { useState, useEffect, useRef } from "react";
import { CustomCellEditorProps } from "ag-grid-react";
import { IdNamePair } from "../../pages/private/Stocks";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          variant="outlined"
          sx={{
            fontSize: "0.75rem", // Smaller font size
            backgroundColor: "#fff",
          }}
          size="small"
        />
      )}
      disableClearable
      autoHighlight
      openOnFocus
      fullWidth
    />
  );
};
