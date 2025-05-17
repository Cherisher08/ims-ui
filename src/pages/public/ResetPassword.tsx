import { useNavigate } from "react-router-dom";
import NamedLogo from "../../assets/named-logo.png";
import Logo from "../../assets/logo.svg";
import { useState } from "react";

const ResetPassword = () => {
  const name = "Mani";
  const navigate = useNavigate();
  const [verified, setVerified] = useState<boolean>(false);

  const handleVerify = () => {
    setVerified(true);
  };

  const handleSignIn = () => {
    navigate("/");
  };

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
              ></input>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm">Confirm Password</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Re-enter password"
              ></input>
            </div>
          </div>
          <button
            className="bg-secondary w-full p-3 rounded-md content-center bg-new text-white"
            onClick={handleSignIn}
          >
            Sign in
          </button>
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
              ></input>
            </div>
          </div>
          <button
            className="bg-secondary w-full p-3 rounded-md content-center bg-new text-white"
            onClick={handleVerify}
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
