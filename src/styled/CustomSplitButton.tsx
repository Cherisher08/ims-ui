import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRef, useState } from 'react';

interface CustomSplitButtonProps {
  label: string;
  onClick: () => void;
  options: string[];
  onMenuItemClick?: (index: number) => void;
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

const CustomSplitButton: React.FC<CustomSplitButtonProps> = ({
  label,
  onClick,
  options,
  onMenuItemClick,
  className = '',
  variant = 'contained',
  icon,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    if (onMenuItemClick) {
      onMenuItemClick(index);
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup variant="contained" ref={anchorRef} aria-label="Button group with a nested menu">
        <Button
          onClick={onClick}
          startIcon={icon}
          variant={variant}
          disabled={disabled}
          classes={{
            root: `${disabled ? 'bg-disabled! text-white!' : ''}${className} ${
              buttonStyles[variant]
            } min-w-fit normal-case text-nowrap hover:bg-highlight h-[2.5rem]`,
          }}
        >
          {label}
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          disabled={disabled || options.length === 0}
          classes={{
            root: `${disabled ? 'bg-disabled! text-white!' : ''}${className} ${
              buttonStyles[variant]
            } min-w-fit normal-case text-nowrap hover:bg-highlight h-[2.5rem]`,
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="top-end"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem key={option} onClick={(event) => handleMenuItemClick(event, index)}>
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default CustomSplitButton;
