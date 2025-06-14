import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loader from "../components/Loader";
import { ToastContainer } from "react-toastify";

const MainLayout = React.lazy(() => import("../components/Layouts/MainLayout"));
const AuthLayout = React.lazy(() => import("../components/Layouts/AuthLayout"));
const Login = React.lazy(() => import("../pages/public/Login"));
const ForgotPassword = React.lazy(
  () => import("../pages/public/ForgotPassword")
);
const ResetPassword = React.lazy(() => import("../pages/public/ResetPassword"));
const Dashboard = React.lazy(() => import("../pages/private/Dashboard"));
const Orders = React.lazy(() => import("../pages/private/Orders"));
const Inventory = React.lazy(() => import("../pages/private/Inventory"));
const Contacts = React.lazy(() => import("../pages/private/Contacts"));

type RouteType = {
  path: string;
  index?: boolean;
  element: React.ReactNode;
  children?: RouteType[];
};

const publicRoutes = [
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "*",
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
];

const privateRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/inventory",
        element: <Inventory />,
      },
      {
        path: "/contacts",
        element: <Contacts />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

const appRoutes = (routes: RouteType[]): React.ReactNode => {
  return routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && appRoutes(route.children)}
    </Route>
  ));
};

const Index = () => {
  const newRoutes = [...publicRoutes, ...privateRoutes];

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>{appRoutes(newRoutes)}</Routes>
        <ToastContainer />
      </Suspense>
    </BrowserRouter>
  );
};

export default Index;
