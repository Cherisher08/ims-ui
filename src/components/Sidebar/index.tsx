import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LuChevronsLeft } from "react-icons/lu";
import Logo from "../../assets/logo.svg";

import { MenuItems } from "../../constants/MenuItems";
import { useMenu } from "../../contexts/MenuContext";
import { useLocation, useNavigate } from "react-router-dom";

const index = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { active, setActive } = useMenu();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    const activeMenuItem = MenuItems.find((item) => item.path === pathname);
    if (activeMenuItem) {
      setActive(activeMenuItem.id);
    }
  }, [pathname]);

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: open ? 0 : "-95%" }}
      transition={{
        bounce: false,
      }}
      className="absolute top-0 left-0 h-screen bg-primary w-70 rounded-r-3xl flex flex-col gap-8 px-6 py-8"
    >
      {/* Hamburger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="absolute top-1/2 right-0 flex justify-center items-center translate-x-5 rounded-r-xl -translate-y-1/2 bg-primary w-6 h-18"
      >
        <LuChevronsLeft
          size={23}
          color="white"
          className={`transition-transform duration-200 ${
            open ? "rotate-0" : "rotate-180"
          }`}
        />
      </div>

      {/* Title */}
      <div className="flex items-center justify-center">
        <div className="rounded-full overflow-hidden w-18 h-15 content-center bg-white">
          <img src={Logo} className="w-full h-full" />
        </div>
        <p className="text-2xl text-white text-center w-fit">
          Mani Power Tools
        </p>
      </div>

      {/* Menu */}
      <ul className="flex flex-col gap-2">
        {MenuItems.map((item) => {
          const Icon = item.logo;
          return (
            <li
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative cursor-pointer flex items-center gap-3 w-full pl-5 py-2 text-white rounded-r-md ${
                item.id === active ? "menu-active bg-[#006fc431]" : ""
              }`}
            >
              <Icon className="w-5 h-5 text-gray-500" />
              <p className="text-lg font-semibold">{item.title}</p>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export default index;
