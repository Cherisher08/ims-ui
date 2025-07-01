import { useEffect, useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { IoMdMore } from "react-icons/io";
import { PiSignOut } from "react-icons/pi";
import CustomMenu, { type CustomMenuItemProps } from "../../styled/CustomMenu";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  Drawer,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import CustomInput from "../../styled/CustomInput";
import CustomButton from "../../styled/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { User, UserRole } from "../../types/user";
import { useNavigate } from "react-router-dom";
import { rootApi, useRegisterUserMutation } from "../../services/ApiService";
import { clearUser } from "../../store/UserSlice";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../constants/constants";
import { useLazyGetExpiredRentalOrdersQuery } from "../../services/OrderService";
import { setExpiredRentalOrders } from "../../store/OrdersSlice";
import { RiMenu3Line } from "react-icons/ri";

type NewUserErrorType = {
  name: boolean;
  email: boolean;
  password: boolean;
};

type HeaderType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const Header = ({ open, setOpen }: HeaderType) => {
  const [triggerGetRentalOrder] = useLazyGetExpiredRentalOrdersQuery();
  const expiredRentalOrders = useSelector(
    (state: RootState) => state.rentalOrder.data
  );
  const expiredOrdersCount = expiredRentalOrders.length;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [
    registerUser,
    { isLoading: isRegisteringUser, isSuccess: isUserRegisterSuccess },
  ] = useRegisterUserMutation();

  const userData = useSelector((state: RootState) => state.user);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setDrawerOpen(newOpen);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [addUserModelOpen, setAddUserModelOpen] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState<User>({
    name: "",
    email: "",
    password: "",
    role: UserRole.User,
  });
  const [errors] = useState<NewUserErrorType>({
    name: false,
    email: false,
    password: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    dispatch(clearUser());
    dispatch(rootApi.util.resetApiState());
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
    const fetchExpiredOrders = async () => {
      const result = await triggerGetRentalOrder();
      if ("error" in result && result.error) {
        const error = result.error;

        if ("status" in error && error.status === 404) {
          dispatch(setExpiredRentalOrders([]));
        }
      } else if ("data" in result && result.data) {
        dispatch(setExpiredRentalOrders(result.data));
      }
    };

    // immediately on mount
    fetchExpiredOrders();

    // every 30 min
    const interval = setInterval(() => {
      fetchExpiredOrders();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [triggerGetRentalOrder, dispatch]);

  useEffect(() => {
    if (!isRegisteringUser && isUserRegisterSuccess) {
      toast("User Created Successfully", {
        toastId: TOAST_IDS.SUCCESS_REGISTER_USER,
      });
    }
  }, [isRegisteringUser, isUserRegisterSuccess]);

  const DrawerList = (
    <Box
      sx={{ width: 300 }}
      className="p-2"
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Expired Rental Orders
      </Typography>

      {expiredRentalOrders.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No expired orders found.
        </Typography>
      )}

      <Box
        sx={{
          maxHeight: "85vh",
          overflowY: "auto",
          pr: 1,
        }}
      >
        {expiredRentalOrders.map((order) => (
          <Card
            key={order.order_id}
            variant="outlined"
            sx={{ mb: 2, backgroundColor: "#f9f9f9" }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Order ID: {order.order_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected Date:{" "}
                {new Date(order.expected_date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
              <CustomButton
                variant="contained"
                onClick={() => {
                  navigate(`/orders/rentals/${order._id}`);
                }}
                className="mt-1"
                label={"View Order"}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  return (
    <div className="w-full flex justify-between">
      {open && (
        <div
          className="md:hidden w-screen h-screen absolute bg-black opacity-50 z-30"
          onClick={() => setOpen(false)}
        ></div>
      )}
      <div className="flex items-center md:hidden">
        <RiMenu3Line size={30} onClick={() => setOpen(!open)} />
      </div>
      <div className="w-full px-6 h-18 flex justify-end">
        <div className="flex items-center gap-4">
          <IconButton
            onClick={toggleDrawer(true)}
            sx={{
              padding: 0,
              backgroundColor: "transparent",
            }}
          >
            <Badge
              color="error"
              badgeContent={expiredOrdersCount > 0 ? expiredOrdersCount : null}
              overlap="circular"
            >
              <NotificationsNoneIcon sx={{ fontSize: 28 }} />
            </Badge>
          </IconButton>
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
        <Drawer
          open={drawerOpen}
          anchor={"right"}
          onClose={toggleDrawer(false)}
        >
          {DrawerList}
        </Drawer>

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
    </div>
  );
};

export default Header;
