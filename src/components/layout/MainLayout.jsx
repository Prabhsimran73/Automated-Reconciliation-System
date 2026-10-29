import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main App Content Viewport */}
      <div className="main-layout">
        <Header onOpenMobile={() => setIsMobileNavOpen(true)} />

        <main className="content-area">
          <Outlet />
        </main>

        {/* Persistent Project Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

