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
    <div className="w-fit h-auto relative">
      <motion.div
        initial={{ width: "17rem" }}
        animate={{ width: open ? "17rem" : "0px" }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className={`relative h-full bg-primary rounded-r-3xl overflow-hidden ${
          open ? "px-6 py-8" : "p-1"
        }`}
      >
        <motion.div
          initial={{ opacity: open ? 1 : 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`flex flex-col gap-8 ${
            open ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {open && (
            <>
              <div className="flex items-center justify-center">
                <div className="rounded-full overflow-hidden w-18 h-15 content-center bg-white">
                  <img src={Logo} className="w-full h-full" />
                </div>
                <p className="text-2xl text-white text-center w-fit">
                  Mani Power Tools
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {MenuItems.map((item) => {
                  const Icon = item.logo;
                  return (
                    <li
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`relative cursor-pointer flex items-center gap-3 w-full pl-5 py-2 text-white rounded-r-md hover:menu-active hover:bg-[#006fc431] ${
                        item.id === active ? "menu-active bg-[#006fc431]" : ""
                      }`}
                    >
                      <Icon className="w-5 h-5 text-gray-500" />
                      <p className="text-lg font-semibold">{item.title}</p>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Hamburger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="absolute cursor-pointer top-1/2 right-0 flex justify-center items-center translate-x-5 rounded-r-xl -translate-y-1/2 bg-primary w-6 h-18"
      >
        <LuChevronsLeft
          size={23}
          color="white"
          className={`transition-transform duration-200 ${
            open ? "rotate-0" : "rotate-180"
          }`}
        />
      </div>
    </div>
  );
};

export default index;
