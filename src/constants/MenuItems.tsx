import { IoIosContact } from "react-icons/io";
import { LuClipboardList, LuShoppingBag } from "react-icons/lu";
import { MdDashboardCustomize } from "react-icons/md";

type MenuItemsType = {
  id: number;
  title: string;
  path: string;
  logo: React.ReactNode;
};

export const MenuItems: MenuItemsType[] = [
  {
    id: 1,
    title: "Dashboard",
    path: "/dashboard",
    logo: <MdDashboardCustomize size={30} />,
  },
  {
    id: 2,
    title: "Entries",
    path: "/orders/rentals",
    logo: <LuClipboardList size={30} />,
  },
  {
    id: 3,
    title: "Stocks",
    path: "/inventory",
    logo: <LuShoppingBag size={30} />,
  },
  {
    id: 4,
    title: "Contacts",
    path: "/contacts",
    logo: <IoIosContact size={30} />,
  },
  {
    id: 5,
    title: "Summary",
    path: "/orders",
    logo: <LuClipboardList size={30} />,
  },
];
