import { useEffect, useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoIosNotificationsOutline, IoMdMore } from "react-icons/io";
import { PiSignOut } from "react-icons/pi";
import CustomMenu, { type CustomMenuItemProps } from "../../styled/CustomMenu";
import { Avatar, Modal } from "@mui/material";
import CustomInput from "../../styled/CustomInput";
import CustomButton from "../../styled/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { User, UserRole } from "../../types/user";
import { useNavigate } from "react-router-dom";
import { loginApi, useRegisterUserMutation } from "../../services/ApiService";
import { clearUser } from "../../store/UserSlice";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../constants/constants";

type NewUserErrorType = {
  name: boolean;
  email: boolean;
  password: boolean;
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [
    registerUser,
    { isLoading: isRegisteringUser, isSuccess: isUserRegisterSuccess },
  ] = useRegisterUserMutation();

  const userData = useSelector((state: RootState) => state.user);
  const ref = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [addUserModelOpen, setAddUserModelOpen] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState<User>({
    name: "",
    email: "",
    password: "",
    role: UserRole.User,
  });
  const [errors, setErrors] = useState<NewUserErrorType>({
    name: false,
    email: false,
    password: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    dispatch(clearUser());
    dispatch(loginApi.util.resetApiState());
    navigate("/auth/login");
  };

  const menuItems: CustomMenuItemProps[] = [
    {
      label: "Add User",
      icon: <FaUserPlus />,
      handleItem: () => handleAddUserModal(true),
      key: "add-user",
      disabled: userData.role !== UserRole.Admin,
    },
    {
      label: "Sign Out",
      icon: <PiSignOut />,
      handleItem: () => handleLogout(),
      key: "sign-out",
    },
  ];

  const handleMenu = (value: boolean) => {
    setMenuOpen(value);
  };

  const handleAddUserModal = (value: boolean) => {
    setAddUserModelOpen(value);
  };

  const addUser = () => {
    registerUser(newUserData);
    handleAddUserModal(false);
  };

  const strippedUserName = userData.name
    ? (userData.name[0] + userData.name[1]).toUpperCase()
    : "";

  useEffect(() => {
    if (!isRegisteringUser && isUserRegisterSuccess) {
      toast("User Created Successfully", {
        toastId: TOAST_IDS.SUCCESS_REGISTER_USER,
      });
    }
  }, [isRegisteringUser, isUserRegisterSuccess]);

  return (
    <div className="w-full px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={28} className="cursor-pointer" />
        <Avatar className="min-w-12 h-12 rounded-full">
          {strippedUserName}
        </Avatar>
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
              label="User Name"
              error={errors.name}
              placeholder="Enter User Name"
              value={newUserData.name}
              onChange={(name) =>
                setNewUserData((prev) => ({ ...prev, name: name }))
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

export default Header;
