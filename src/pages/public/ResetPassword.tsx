import { useNavigate } from "react-router-dom";
import NamedLogo from "../../assets/named-logo.png";
import Logo from "../../assets/logo.svg";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useUpdateUserPasswordMutation,
  useVerifyOtpMutation,
} from "../../services/ApiService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../constants/constants";

interface PasswordObject {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const email = useSelector((state: RootState) => state.user.email);
  const name = "Mani";
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>();
  const [password, setPassword] = useState<PasswordObject>({
    password: "",
    confirmPassword: "",
  });
  const [verified, setVerified] = useState<boolean>(false);
  const [verifyOtp, { isSuccess: isOtpSuccess, isError: isOtpError }] =
    useVerifyOtpMutation();
  const [updateUserPassword, { isSuccess: isPasswordUpdateSuccess }] =
    useUpdateUserPasswordMutation();

  const handleVerify = () => {
    if (otp && email)
      verifyOtp({
        otp: otp,
        email: email,
      });
  };

  const handleSignIn = () => {
    updateUserPassword({
      email: email,
      password: password.password,
    });
  };

  const isValidPassword =
    password.password && password.password === password.confirmPassword;

  useEffect(() => {
    if (isOtpSuccess) {
      toast("Entered OTP is valid", {
        toastId: TOAST_IDS.OTP_VALID,
      });
      setVerified(true);
    }
    if (isOtpError) {
      toast("Entered OTP is invalid. Please try again", {
        toastId: TOAST_IDS.OTP_INVALID,
      });
    }
    if (isPasswordUpdateSuccess) {
      toast("Password Updated Successfully", {
        toastId: TOAST_IDS.SUCCESS_PASSWORD_UPDATE,
      });
      navigate("/");
    }
  }, [isOtpError, isOtpSuccess, isPasswordUpdateSuccess, navigate]);

  return (
    <div className="bg-white w-full min-h-screen items-center px-3 grid grid-cols-[60%_40%]">
      <div className="flex justify-center items-center">
        <img src={NamedLogo} />
      </div>
      {verified ? (
        <div className="flex flex-col gap-5 w-3/5">
          <div className="flex justify-center">
            <img src={Logo} className="w-20 h-20" />
          </div>
          <div className="flex flex-col gap-2 -intro-x">
            <h3 className="text-[#2B2F38] font-semibold text-2xl text-center">
              Enter a new password
            </h3>
            <p className="text-[#667085] text-center">
              Welcome {name}! Please enter your new password.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-sm">New Password</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Enter new password"
                onChange={(event) =>
                  setPassword((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                value={password.password}
              ></input>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm">Confirm Password</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Re-enter password"
                onChange={(event) =>
                  setPassword((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                value={password.confirmPassword}
              ></input>
            </div>
          </div>
          <Button
            variant="contained"
            className={`${
              !isValidPassword ? "bg-disabled" : "bg-secondary"
            } w-full p-3 rounded-md content-center h-11 text-white`}
            onClick={handleSignIn}
            disabled={!isValidPassword}
          >
            Sign in
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 w-3/5">
          <div className="flex justify-center">
            <img src={Logo} className="w-20 h-20" />
          </div>
          <div className="flex flex-col gap-2 -intro-x">
            <h3 className="text-[#2B2F38] font-semibold text-2xl text-center">
              Enter OTP
            </h3>
            <p className="text-[#667085] text-center">
              Enter the OTP received in the entered email
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p>OTP</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Enter your otp"
                onChange={(event) => setOtp(event.target.value)}
                value={otp}
              ></input>
            </div>
          </div>
          <Button
            variant="contained"
            className={`${
              !(otp && email) ? "bg-disabled" : "bg-secondary"
            } w-full p-3 h-11 rounded-md content-center bg-new text-white`}
            onClick={handleVerify}
            disabled={!(otp && email)}
          >
            Verify OTP
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
