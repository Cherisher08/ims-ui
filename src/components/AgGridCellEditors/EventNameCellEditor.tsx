import { useState, useEffect, useRef } from "react";
import { CustomCellEditorProps } from "ag-grid-react";
import { IdNamePair } from "../../pages/private/Stocks";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

type EventNameCellEditorProps = CustomCellEditorProps & {
  customerOptions?: IdNamePair[];
};

export const EventNameCellEditor = ({
  value,
  stopEditing,
  onValueChange,
  customerOptions = [],
}: EventNameCellEditorProps) => {
  const ref = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<IdNamePair>(() =>
    customerOptions.find((option) => option.name === value)
  );

  const [inputValue, setInputValue] = useState<string>(value ?? "");

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 10);
  }, []);

  const commitValue = (val: IdNamePair) => {
    setSelected(val);
    onValueChange(val);
    stopEditing();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (_: any, newValue: IdNamePair | string | null) => {
    if (typeof newValue === "string") {
      commitValue({ _id: newValue, name: newValue });
    } else if (newValue) {
      commitValue(newValue);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (_: any, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleBlur = () => {
    if (inputValue && (!selected || selected.name !== inputValue)) {
      commitValue({ _id: inputValue, name: inputValue });
    } else {
      stopEditing();
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={customerOptions}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
      value={selected}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      onBlur={handleBlur}
      renderInput={(params) => {
        // 🔑 Merge our onKeyDown with MUI's
        const { onKeyDown, ...inputProps } = params.inputProps;

        return (
          <TextField
            {...params}
            inputRef={ref}
            variant="outlined"
            size="small"
            sx={{
              fontSize: "0.75rem",
              backgroundColor: "#fff",
            }}
            inputProps={{
              ...inputProps,
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                // ✅ Call MUI's handler first so Autocomplete works
                if (onKeyDown) onKeyDown(e);

                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  commitValue({ _id: inputValue, name: inputValue });
                }

                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  stopEditing();
                }
              },
            }}
          />
        );
      }}
      disableClearable
      autoHighlight
      openOnFocus
      fullWidth
    />
  );
};
