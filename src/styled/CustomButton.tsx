import { Button } from '@mui/material';

interface CustomButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
  className?: string;
  disabled?: boolean;
}

const buttonStyles = {
  outlined: 'border-primary text-primary ',
  contained: 'bg-primary',
  text: 'text-primary',
};

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  className = '',
  variant = 'contained',
  icon,
  disabled = false,
}) => {
  return (
    <Button
      classes={{
        root: `${disabled ? 'bg-disabled! text-white!' : ''}${className} ${
          buttonStyles[variant]
        } min-w-fit normal-case text-nowrap hover:bg-highlight h-[2.5rem]`,
      }}
      onClick={onClick}
      startIcon={icon}
      variant={variant}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
