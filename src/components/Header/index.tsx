import { Divider, Popover } from "@mui/material";
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
    <div className="w-full bg-red-400 px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={28} className="cursor-pointer" />
        <div className="bg-green-400 min-w-12 h-12 rounded-full"></div>
        <div ref={ref} onClick={handleMenu}>
          <IoMdMore size={28} className="cursor-pointer" />
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
          <div className="p-2 gap-1 flex flex-col ">
            <div className="flex gap-3 p-2 items-center cursor-pointer hover:bg-[#f3f3f3] rounded-sm">
              <FaUserPlus />
              <p>Add User</p>
            </div>
            <Divider />
            <div className="flex gap-3 p-2 items-center cursor-pointer hover:bg-[#f3f3f3] rounded-sm">
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
