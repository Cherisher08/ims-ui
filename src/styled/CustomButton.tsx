import { Button } from "@mui/material";

interface CustomButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "outlined" | "contained" | "text";
  className?: string;
}

const buttonStyles = {
  outlined: "border-primary text-primary ",
  contained: "bg-primary",
  text: "text-primary",
};

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  className = "",
  variant = "contained",
  icon,
}) => {
  return (
    <Button
      classes={{
        root: `${className} ${buttonStyles[variant]} normal-case text-nowrap hover:bg-highlight h-[2.5rem]`,
      }}
      onClick={onClick}
      startIcon={icon}
      variant={variant}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
