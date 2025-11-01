import { useNavigate } from 'react-router-dom';
import NamedLogo from '/named-logo.png';
import Logo from '../../assets/New_Logo.svg';

import Button from '@mui/material/Button';
import { rootApi, useAuthorizeUserMutation } from '../../services/ApiService';
import type { UserRequest } from '../../types/user';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { ErrorResponse } from '../../types/common';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/UserSlice';
import { TOAST_IDS } from '../../constants/constants';

const Login = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<UserRequest>({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const [
    authorizeUser,
    {
      data: headerData,
      isSuccess: isValidUser,
      isError: isInvalidUser,
      error: authorizationErrorMessage,
    },
  ] = useAuthorizeUserMutation();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const handleLogin = () => {
    localStorage.removeItem('access_token');
    authorizeUser(user);
  };

  useEffect(() => {
    if (isValidUser) {
      localStorage.setItem('access_token', headerData.access_token);
      dispatch(
        updateUser({
          email: user.email,
          loggedTime: new Date().toISOString(),
        })
      );
      toast.success('Logged in successfully', {
        toastId: TOAST_IDS.SUCCESS_LOGIN,
      });
      dispatch(rootApi.util.resetApiState());
      navigate('/');
    }
  }, [dispatch, headerData, isValidUser, navigate, user.email]);

  return (
    <>
      <div className="bg-white w-full min-h-screen items-center px-3 grid grid-cols-[60%_40%]">
        <div className="flex justify-center items-center">
          <img src={NamedLogo} />
        </div>
        <div className="flex flex-col w-3/5 gap-5">
          <div className="flex justify-center">
            <img src={Logo} className="w-20 h-20" />
          </div>
          <div className="flex flex-col gap-2 -intro-x">
            <h3 className="text-[#2B2F38] font-semibold text-2xl text-center">
              Log in to your account
            </h3>
            <p className="text-[#667085] text-center">Welcome back! Please enter your details.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p>Email</p>
              <input
                className="w-full px-3 py-2 rounded-md border border-outline outline-none"
                placeholder="Enter your email"
                onChange={(event) =>
                  setUser((prev) => {
                    return {
                      ...prev,
                      email: event.target.value,
                    };
                  })
                }
                value={user.email}
              ></input>
            </div>
            <div className="flex flex-col gap-1">
              <p>Password</p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 rounded-md border border-outline outline-none"
                  placeholder="Enter your password"
                  onChange={(event) =>
                    setUser((prev) => {
                      return {
                        ...prev,
                        password: event.target.value,
                      };
                    })
                  }
                  value={user.password}
                ></input>
                {showPassword ? (
                  <IoEye
                    size={25}
                    className="absolute right-0 top-1/2 -translate-1/2"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <IoEyeOff
                    size={25}
                    className="absolute right-0 top-1/2 -translate-1/2"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-full flex justify-center rounded-md hover:bg-highlight">
              <a
                className="text-new p-2 w-fit cursor-pointer"
                onClick={() => navigate('/auth/forgot-password')}
              >
                Forgot password
              </a>
            </div>
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={!(user.email && user.password)}
              className={` w-full p-3 h-11 rounded-md content-center text-white ${
                !(user.email && user.password) ? 'bg-disabled' : 'bg-secondary'
              }`}
            >
              Sign in
            </Button>
            {isInvalidUser && (
              <div className="flex flex-col items-center">
                <Typography color="error" className="flex" fontSize={'0.75rem'}>
                  {((authorizationErrorMessage as FetchBaseQueryError)?.data as ErrorResponse)
                    ?.detail ?? 'An error occurred'}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
