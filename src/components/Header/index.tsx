import { Modal, Popover } from "@mui/material";
import { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoIosNotificationsOutline, IoMdMore } from "react-icons/io";
import { PiSignOut } from "react-icons/pi";

const index = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleMenu = () => {
    setModalOpen(true);
  };
  return (
    <div className="bg-red-300 w-full px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={24} />
        <div className="bg-green-400 min-w-10 h-10 rounded-full"></div>
        <IoMdMore size={24} onClick={handleMenu}>
          <Popover
            anchorOrigin={{
              horizontal: "center",
              vertical: "bottom",
            }}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <>
              <div className="flex gap-3 items-center">
                <FaUserPlus />
                <p>Add User</p>
              </div>
              <div className="flex gap-3 items-center">
                <PiSignOut />
                <p>Sign out</p>
              </div>
            </>
          </Popover>
        </IoMdMore>
      </div>
    </div>
  );
};

export default index;
