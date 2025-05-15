
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default Layout;
