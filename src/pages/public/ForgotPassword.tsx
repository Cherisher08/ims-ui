import { useNavigate } from "react-router-dom";
import NamedLogo from "../../assets/named-logo.png";
import Logo from "../../assets/logo.svg";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useResetPasswordMutation } from "../../services/ApiService";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../constants/constants";
import { useDispatch } from "react-redux";
import { updateUser } from "../../store/UserSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [resetPassword, { isSuccess: isPasswordReset }] =
    useResetPasswordMutation();
  const [email, setEmail] = useState<string>();
  const navigate = useNavigate();

  const handleSendMail = async () => {
    if (email) resetPassword(email);
  };

  useEffect(() => {
    if (isPasswordReset) {
      dispatch(
        updateUser({
          email: email,
          loggedTime: new Date().toISOString(),
        })
      );
      toast("OTP is sent through email successfully", {
        toastId: TOAST_IDS.SUCCESS_OTP_GENERATION,
      });
      navigate("/auth/reset-password");
    }
  }, [dispatch, email, isPasswordReset, navigate]);

  return (
    <div className="bg-white w-full min-h-screen items-center px-3 grid grid-cols-[60%_40%]">
      <div className="flex justify-center items-center">
        <img src={NamedLogo} />
      </div>
      <div className="flex flex-col gap-5 w-3/5">
        <div className="flex justify-center">
          <img src={Logo} className="w-20 h-20" />
        </div>
        <div className="flex flex-col gap-2 -intro-x">
          <h3 className="text-[#2B2F38] font-semibold text-2xl text-center">
            Reset Your Password
          </h3>
          <p className="text-[#667085] text-center">
            We will send you an email with instructions to reset your password
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p>Email</p>
            <input
              className="w-full px-3 py-2 rounded-md border border-outline outline-none"
              placeholder="Enter your email"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            ></input>
          </div>
        </div>
        <Button
          variant="contained"
          className={`${
            !email ? "bg-disabled" : "bg-secondary"
          } w-full p-3 h-11 rounded-md content-center text-white`}
          onClick={handleSendMail}
          value={email}
          disabled={!email}
        >
          Email me
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
