import { Outlet } from 'react-router-dom';

import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { useState } from 'react';

const MainLayout = () => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <Sidebar open={open} setOpen={(value: boolean) => setOpen(value)} />
      <div className="flex flex-col w-full h-full overflow-hidden">
        <Header open={open} setOpen={(value: boolean) => setOpen(value)} />
        <div className="flex-1 overflow-y-auto sm:px-6 px-2 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
