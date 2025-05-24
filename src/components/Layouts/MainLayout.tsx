import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="relative flex h-screen w-screen">
      <Sidebar />
      <div className="w-full h-full overflow-hidden">
        <Header />
        <div className="p-6 h-auto overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
