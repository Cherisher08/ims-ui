import { Button } from "@mui/material";

interface customButtonProps {
  label: string;
  className?: string;
  icon: React.ReactNode;
}

const CustomButton: React.FC<customButtonProps> = ({
  label,
  className = "",
  icon,
}) => {
  return (
    <Button
      classes={{
        root: `${className} bg-primary normal-case`,
      }}
      startIcon={icon}
      variant="contained"
    >
      {label}
    </Button>
  );
};

export default CustomButton;
