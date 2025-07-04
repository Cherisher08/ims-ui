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
    <div
      className={`grid grid-cols-[auto_2fr]  justify-between min-w-fit gap-2 ${wrapperClass} ${
        multiline ? "h-fit pb-8" : "h-[3.5rem]"
      }`}
    >
      <label
        className={`1pt-2 min-w-[5rem] line-clamp-2 break-words h-fit ${labelClass}`}
      >
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
