import { useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoIosNotificationsOutline, IoMdMore } from "react-icons/io";
import { PiSignOut } from "react-icons/pi";
import CustomMenu, { type CustomMenuItemProps } from "../../styled/CustomMenu";
import { Modal } from "@mui/material";
import CustomInput from "../../styled/CustomInput";
import CustomButton from "../../styled/CustomButtom";

type NewUserDataType = {
  username: string;
  email: string;
  password: string;
};

type NewUserErrorType = {
  username: boolean;
  email: boolean;
  password: boolean;
};

const index = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [addUserModelOpen, setAddUserModelOpen] = useState<boolean>(true);
  const [newUserData, setNewUserData] = useState<NewUserDataType>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<NewUserErrorType>({
    username: false,
    email: false,
    password: false,
  });

  const menuItems: CustomMenuItemProps[] = [
    {
      label: "Add User",
      icon: <FaUserPlus />,
      handleItem: () => handleAddUserModal(true),
    },
    {
      label: "Sign Out",
      icon: <PiSignOut />,
      handleItem: () => console.log(1),
    },
  ];

  const handleMenu = (value: boolean) => {
    setMenuOpen(value);
  };

  const handleAddUserModal = (value: boolean) => {
    setAddUserModelOpen(value);
  };

  const addUser = () => {};

  return (
    <div className="w-full px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={28} className="cursor-pointer" />
        <div className="bg-green-400 min-w-12 h-12 rounded-full"></div>
        <div ref={ref} onClick={() => handleMenu(true)}>
          <IoMdMore size={28} className="cursor-pointer" />
        </div>
        <CustomMenu
          anchorEl={ref.current}
          open={menuOpen}
          handleClose={() => handleMenu(false)}
          className="mt-4"
          menuItems={menuItems}
          transformPosition={{
            vertical: "top",
            horizontal: "right",
          }}
        />
      </div>

      {/* Add User Modal */}
      <Modal
        open={addUserModelOpen}
        onClose={() => handleAddUserModal(false)}
        className="w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col gap-4 justify-center items-center bg-white rounded-lg p-4">
          <p className="text-primary text-xl font-semibold w-full text-start">
            Add User
          </p>
          <div className="flex flex-col w-[30rem] px-10 gap-y-2 justify-center items-start">
            <CustomInput
              label="UserName"
              error={errors.username}
              placeholder="Enter User Name"
              value={newUserData.username}
              onChange={(username) =>
                setNewUserData((prev) => ({ ...prev, username: username }))
              }
              className="w-60 rounded-lg"
              helperText="Enter User Name"
            />

            <CustomInput
              label="Email"
              error={errors.email}
              placeholder="Enter Email"
              value={newUserData.email}
              onChange={(email) =>
                setNewUserData((prev) => ({ ...prev, email: email }))
              }
              className="w-60 rounded-lg"
              helperText="Enter Valid Email"
            />
            <CustomInput
              label="Password"
              error={errors.password}
              placeholder="Enter Password"
              value={newUserData.password}
              onChange={(password) =>
                setNewUserData((prev) => ({ ...prev, password: password }))
              }
              className="w-60 rounded-lg"
              helperText="Enter password"
            />
          </div>
          <div className="flex w-full gap-3 justify-end">
            <CustomButton
              onClick={() => handleAddUserModal(false)}
              label="Cancel"
              variant="outlined"
              className="bg-white"
            />
            <CustomButton onClick={addUser} label="Add User" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default index;
