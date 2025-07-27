import { CustomCellEditorProps } from "ag-grid-react";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface SelectCellEditorProps extends CustomCellEditorProps {
  options: string[];
}

export const SelectCellEditor = (props: SelectCellEditorProps) => {
  const inputRef = useRef<HTMLSelectElement>(null);

  const options = props.options;
  const [value, setValue] = useState<string>(props.value ?? "");

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setValue(event.target.value);
    props.onValueChange(event.target.value);
  };

  const handleBlur = () => {
    props.stopEditing();
  };

  return (
    <FormControl fullWidth size="small" sx={{ backgroundColor: "#fff" }}>
      <Select
        inputRef={inputRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
        fullWidth
        sx={{
          fontSize: "0.75rem", // Smaller font size
          backgroundColor: "#fff",
          minHeight: "32px", // Optional: reduce height too
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
