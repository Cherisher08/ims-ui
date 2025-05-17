import { useNavigate } from "react-router-dom";
import NamedLogo from "../../assets/named-logo.png";
import Logo from "../../assets/logo.svg";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSendMail = async () => {
    navigate("/auth/reset-password");
  };

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
            ></input>
          </div>
        </div>
        <button
          className="bg-secondary w-full p-3 rounded-md content-center bg-new text-white"
          onClick={handleSendMail}
        >
          Email me
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
