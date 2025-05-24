import { useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoIosNotificationsOutline, IoMdMore } from "react-icons/io";
import { PiSignOut } from "react-icons/pi";
import CustomMenu, { type CustomMenuItemProps } from "../../styled/CustomMenu";

const index = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMenu = () => {
    setModalOpen(true);
  };

  const menuItems: CustomMenuItemProps[] = [
    {
      label: "Add User",
      icon: <FaUserPlus />,
      handleItem: () => console.log(1),
    },
    {
      label: "Sign Out",
      icon: <PiSignOut />,
      handleItem: () => console.log(1),
    },
  ];

  return (
    <div className="w-full px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={28} className="cursor-pointer" />
        <div className="bg-green-400 min-w-12 h-12 rounded-full"></div>
        <div ref={ref} onClick={handleMenu}>
          <IoMdMore size={28} className="cursor-pointer" />
        </div>
        <CustomMenu
          anchorEl={ref.current}
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          className="mt-4"
          menuItems={menuItems}
          transformPosition={{
            vertical: "top",
            horizontal: "right",
          }}
        />
      </div>
    </div>
  );
};

export default index;
