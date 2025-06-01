import { InputAdornment, TextField } from "@mui/material";

interface CustomInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
  type?: string;
  className?: string;
  startIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
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
  startIcon = null,
}) => {
  return (
    <div className="grid grid-cols-[auto_2fr] justify-between w-full gap-2 h-[3.5rem]">
      <label className="pt-2 w-[5rem] line-clamp-2 break-words h-fit">
        {label}
      </label>
      <TextField
        onChange={(e) => onChange(e.target.value)}
        value={value}
        error={error}
        type={type}
        variant="outlined"
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
            className: `p-2 h-[2.5rem] box-border ${className}`,
          },
        }}
      />
    </div>
  );
};

export default CustomInput;
