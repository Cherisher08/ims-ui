import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import NamedLogo from "../../assets/named-logo.png";
import Logo from "../../assets/logo.svg";
import { Button } from "@mui/material";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
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
              Log in to your account
            </h3>
            <p className="text-[#667085] text-center">
              Welcome back! Please enter your details.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p>Email</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Enter your email"
              ></input>
            </div>
            <div className="flex flex-col gap-1">
              <p>Password</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Enter your password"
              ></input>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-full flex justify-center">
              <a
                className="text-new p-2 w-fit cursor-pointer"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Forgot password
              </a>
            </div>
            <Button
              variant="contained"
              onClick={handleLogin}
              className="bg-secondary w-full p-3 h-11 rounded-md content-center text-white"
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
