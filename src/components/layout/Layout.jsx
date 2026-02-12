import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Always open on desktop
      } else {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Expose toggle function globally for sidebar to access
  React.useEffect(() => {
    window.toggleSidebar = toggleSidebar;
    return () => {
      delete window.toggleSidebar;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />
      
      {/* Main Container - mobile-first responsive */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isMobile ? 'w-full' : sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <Header />
        <main className="flex-1 w-full overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;