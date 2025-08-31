import { InputAdornment, TextField } from "@mui/material";

interface CustomInputProps {
  value: string | number;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
  type?: string;
  className?: string;
  startIcon?: React.ReactNode;
  error?: boolean;
  maxLength?: number;
  multiline?: boolean;
  minRows?: number;
  helperText?: string;
  disabled?: boolean;
  wrapperClass?: string;
  labelClass?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChange,
  label,
  error = false,
  helperText = "",
  type = "text",
  className = "",
  placeholder = "",
  multiline = false,
  minRows = 4,
  startIcon = null,
  maxLength = 120,
  disabled = false,
  wrapperClass = "",
  labelClass = "",
}) => {
  return (
    <div className={`flex flex-col min-w-fit ${wrapperClass}`}>
      <label className={`w-full line-clamp-2 break-words ${labelClass}`}>
        {label}
      </label>
      <TextField
        onChange={(e) => onChange(e.target.value)}
        value={value}
        error={error}
        type={type}
        variant="outlined"
        multiline={multiline}
        minRows={minRows}
        disabled={disabled}
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
            min: type === "number" ? 0 : undefined,
            maxLength: maxLength,
            className: `${
              multiline ? "h-fit" : "h-[2.5rem] p-2"
            } box-border ${className}`,
          },
        }}
      />
    </div>
  );
};

export default CustomInput;
