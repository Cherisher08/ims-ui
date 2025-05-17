import { Divider, Modal, Popover } from "@mui/material";
import { useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoIosNotificationsOutline, IoMdMore } from "react-icons/io";
import { PiSignOut } from "react-icons/pi";

const index = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMenu = () => {
    setModalOpen(true);
  };
  return (
    <div className="w-full px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={24} />
        <div className="bg-green-400 min-w-10 h-10 rounded-full"></div>
        <div ref={ref} onClick={handleMenu}>
          <IoMdMore size={24} />
        </div>
        <Popover
          anchorEl={ref.current}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          className="mt-4"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <div className="p-2 gap-1 flex flex-col bg-[#f3edf7]">
            <div className="flex gap-3 p-2 items-center cursor-pointer">
              <FaUserPlus />
              <p>Add User</p>
            </div>
            <Divider />
            <div className="flex gap-3 p-2 items-center cursor-pointer">
              <PiSignOut />
              <p>Sign out</p>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default index;
