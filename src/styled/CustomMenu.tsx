import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";

type Vertical = "top" | "center" | "bottom";
type Horizontal = "left" | "center" | "right";

export interface CustomMenuItemProps {
  label: string;
  icon: React.ReactNode;
  handleItem: () => void;
}

export interface TransformPositionType {
  vertical: Vertical;
  horizontal: Horizontal;
}

interface CustomMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  menuItems: CustomMenuItemProps[];
  transformPosition: TransformPositionType;
  className?: string;
  menuItemClassName?: string;
}

const CustomMenu: React.FC<CustomMenuProps> = ({
  anchorEl,
  open,
  handleClose,
  menuItems,
  transformPosition,
  className = "",
  menuItemClassName = "",
}) => {
  return (
    <Menu
      classes={{
        root: `${className}`,
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      transformOrigin={transformPosition}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      autoFocus={false}
    >
      {menuItems.map((item) => (
        <MenuItem
          className={`${menuItemClassName} px-3 py-1`}
          onClick={item.handleItem}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default CustomMenu;
