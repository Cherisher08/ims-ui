import { InputAdornment, TextField } from "@mui/material";

interface CustomInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
  className?: string;
  startIcon?: React.ReactNode;
  error?: boolean;
  defaultValue?: string;
  helperText?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChange,
  error = false,
  helperText = "",
  defaultValue = "",
  label,
  className = "",
  placeholder = "",
  startIcon = null,
}) => {
  return (
    <div className="flex justify-between w-full gap-2">
      <label className="pt-2">{label}</label>
      <TextField
        onChange={(e) => onChange(e.target.value)}
        value={value}
        error={error}
        variant="outlined"
        defaultValue={defaultValue}
        helperText={error ? helperText : helperText ? " " : ""}
        placeholder={placeholder}
        slotProps={{
          input: {
            ...(startIcon && {
              startAdornment: (
                <InputAdornment position="start">{startIcon}</InputAdornment>
              ),
            }),
          },
          htmlInput: {
            className: `p-2 ${className}`,
          },
        }}
      />
    </div>
  );
};

export default CustomInput;
