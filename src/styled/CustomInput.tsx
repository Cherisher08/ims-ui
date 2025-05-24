import { InputAdornment, TextField } from "@mui/material";

interface customInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
  startIcon?: React.ReactNode;
  error?: boolean;
  defaultValue?: string;
  helperText?: string;
}

const CustomInput: React.FC<customInputProps> = ({
  value,
  onChange,
  error = false,
  helperText = "",
  defaultValue = "",
  label = "",
  className = "",
  placeholder = "",
  startIcon = null,
}) => {
  return (
    <TextField
      onChange={(e) => onChange(e.target.value)}
      value={value}
      error={error}
      label={label}
      variant="outlined"
      defaultValue={defaultValue}
      helperText={helperText}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
        },
        htmlInput: {
          className: `p-2 ${className}`,
        },
      }}
    />
  );
};

export default CustomInput;
