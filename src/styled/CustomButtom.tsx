import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { IconType } from "react-icons";

interface customButtonProps {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const CustomButton: React.FC<customButtonProps> = s({
  label,
  className,
  icon,
}) => {
  return (
    <Button startIcon={icon} variant="contained" className={className}>
      {label}
    </Button>
  );
};

export default CustomButton;
