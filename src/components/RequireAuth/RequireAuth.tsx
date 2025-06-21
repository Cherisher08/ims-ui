// components/RequireAuth.tsx
import { Navigate } from "react-router-dom"; // adjust path
import { useGetUserQuery } from "../../services/ApiService";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect } from "react";
import { updateUser } from "../../store/UserSlice";
import { useDispatch } from "react-redux";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const dispatch = useDispatch();
  const {
    data: user,
    isSuccess: isGetUserSuccess,
    isLoading: isGetUserLoading,
    error,
  } = useGetUserQuery();

  useEffect(() => {
    if (isGetUserSuccess) {
      dispatch(
        updateUser({
          id: user._id,
          role: user.role,
          name: user.name,
        })
      );
    }
  }, [user, dispatch, isGetUserLoading, isGetUserSuccess]);

  if (isGetUserLoading)
    return (
      <Box className="flex h-screen w-screen justify-center items-center">
        <CircularProgress />;
      </Box>
    );


  if (
    !user &&
    error &&
    "status" in error &&
    typeof error.status === "number" &&
    [401, 403].includes(error.status)
  ) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default RequireAuth;
