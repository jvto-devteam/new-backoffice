import React, { useState, ReactNode } from 'react';
import Header from '../Components/Header/index';
import Sidebar from '../Components/Sidebar/index';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import '../../css/app.css'
import '../../css/satoshi.css'
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';


const Main: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      {/* Wrap seluruh aplikasi dengan Router */}
      <div className="dark:bg-boxdark-2 dark:text-bodydark">
        {/* <!-- ===== Page Wrapper Start ===== --> */}
        <div className="flex h-screen overflow-hidden">
          {/* <!-- ===== Sidebar Start ===== --> */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Start ===== --> */}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/* <!-- ===== Header Start ===== --> */}
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Header End ===== --> */}

            {/* <!-- ===== Main Content Start ===== --> */}
            <main>
              <div className="p-4 md:p-6 2xl:p-10">
                {children}
              </div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </div>
    </Router>
  );
};

export default Main;
