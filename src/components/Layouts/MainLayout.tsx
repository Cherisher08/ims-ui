import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

const MainLayout = () => {
  return (
    <div className="relative flex h-screen w-screen">
      <Sidebar />
      <div className="ml-3 flex flex-col w-full h-full">
        <Header />
        <div className="flex-1 overflow-y-auto px-6 py-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
