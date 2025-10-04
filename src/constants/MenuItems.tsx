import { IoIosContact } from 'react-icons/io';
import { LuClipboardList, LuShoppingBag } from 'react-icons/lu';
import { MdDashboardCustomize, MdDataSaverOn } from 'react-icons/md';

type MenuItemsType = {
  id: number;
  title: string;
  path: string;
  logo: React.ReactNode;
};

export const MenuItems: MenuItemsType[] = [
  {
    id: 1,
    title: 'Dashboard',
    path: '/dashboard',
    logo: <MdDashboardCustomize size={30} />,
  },
  {
    id: 5,
    title: 'Orders',
    path: '/orders',
    logo: <LuClipboardList size={30} />,
  },
  {
    id: 2,
    title: 'Entries',
    path: '/orders/rentals',
    logo: <MdDataSaverOn size={30} />,
  },
  {
    id: 6,
    title: 'Invoices',
    path: '/orders/invoices',
    logo: <LuClipboardList size={30} />,
  },
  {
    id: 3,
    title: 'Stocks',
    path: '/inventory',
    logo: <LuShoppingBag size={30} />,
  },
  {
    id: 4,
    title: 'Customer',
    path: '/contacts',
    logo: <IoIosContact size={30} />,
  },
];
