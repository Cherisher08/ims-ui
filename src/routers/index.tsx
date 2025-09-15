import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Loader from '../components/Loader';
import RequireAuth from '../components/RequireAuth/RequireAuth';

const MainLayout = React.lazy(() => import('../components/Layouts/MainLayout'));
const AuthLayout = React.lazy(() => import('../components/Layouts/AuthLayout'));
const Login = React.lazy(() => import('../pages/public/Login'));
const ForgotPassword = React.lazy(() => import('../pages/public/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/public/ResetPassword'));
const Dashboard = React.lazy(() => import('../pages/private/Dashboard'));
const Inventory = React.lazy(() => import('../pages/private/Stocks'));
const Contacts = React.lazy(() => import('../pages/private/Customers/Contacts'));
const CustomerBills = React.lazy(() => import('../pages/private/Customers/CustomerBills'));
const Orders = React.lazy(() => import('../pages/private/Orders/Orders'));
const NewOrder = React.lazy(() => import('../pages/private/Entries/NewOrder'));
const OrderInvoice = React.lazy(() => import('../pages/private/Entries/OrderInvoice'));

type RouteType = {
  path: string;
  index?: boolean;
  element: React.ReactNode;
  children?: RouteType[];
};

const publicRoutes = [
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: '*',
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
];

const privateRoutes = [
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        path: '/orders',
        element: <Orders />,
      },
      {
        path: '/orders/rentals',
        element: <NewOrder />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/inventory',
        element: <Inventory />,
      },
      {
        path: '/contacts',
        element: <Contacts />,
      },
      {
        path: '/contacts/:id',
        element: <CustomerBills />,
      },
      {
        path: '/orders/rentals/:rentalId',
        element: <NewOrder />,
      },
      {
        path: '/orders/invoice/:rentalId',
        element: <OrderInvoice />,
      },
      {
        path: '*',
        element: <Navigate to="/orders/rentals" replace />,
      },
      {
        path: '/',
        element: <Navigate to="/orders/rentals" replace />,
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
