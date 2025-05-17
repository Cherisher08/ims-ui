import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="relative">
      <Header />
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
