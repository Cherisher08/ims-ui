// AddressCellEditor.tsx
import { CustomCellEditorProps } from "ag-grid-react";
import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";

export const AddressCellEditor = (props: CustomCellEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>(props.value || "");
  //   const [currentRowNode, setCurrentRowNode] = useState<IRowNode<any> | null>(
  //     null
  //   );

  useEffect(() => {
    // Optional: delay focus slightly to ensure DOM is ready
    // setCurrentRowNode(props.node);
    // if (currentRowNode) {
    //   currentRowNode.setRowHeight(45);
    //   props.api.onRowHeightChanged();
    // }
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [props.api, props.node]);

  const handleBlur = () => {
    // if (currentRowNode) {
    //   currentRowNode.setRowHeight(45);
    //   props.api.onRowHeightChanged();
    // }
    props.stopEditing();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    props.onValueChange(e.target.value);
  };

  return (
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      multiline
      fullWidth
      variant="outlined"
      className="ag-input-field-input"
      InputProps={{
        sx: {
          backgroundColor: "#ffffff", // White background
          fontSize: "0.75rem", // Smaller font
          padding: "6px",
        },
      }}
    />
  );
};
