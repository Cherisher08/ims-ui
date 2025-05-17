import React from "react";
import ContactIcon from "../assets/icons/contact.svg?react";
import DashboardIcon from "../assets/icons/dashboard.svg?react";
import OrdersIcon from "../assets/icons/orders.svg?react";
import InventoryIcon from "../assets/icons/inventory.svg?react";

type MenuItemsType = {
  id: number;
  title: string;
  path: string;
  logo: React.FC<React.SVGProps<SVGSVGElement>>;
};

export const MenuItems: MenuItemsType[] = [
  {
    id: 1,
    title: "Dashboard",
    path: "/",
    logo: DashboardIcon,
  },
  {
    id: 2,
    title: "Inventory",
    path: "/inventory",
    logo: InventoryIcon,
  },
  {
    id: 3,
    title: "Contacts",
    path: "/contacts",
    logo: ContactIcon,
  },
  {
    id: 4,
    title: "Orders",
    path: "/orders",
    logo: OrdersIcon,
  },
];
